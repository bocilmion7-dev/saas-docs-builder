import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
// Midtrans Snap loaded from CDN in handleOrder
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, CreditCard, Truck, Store, Clock } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  sku: string;
}

function detectSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length >= 3) return parts[0];
  if (parts[0] === "localhost" || parts[0].match(/^\d/)) return null;
  return parts[0];
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subdomain = useMemo(() => detectSubdomain() || searchParams.get("sub") || null, [searchParams]);

  const storefrontData = useQuery(api.tenants.getStorefront, subdomain ? { subdomain } : "skip");
  const tenant = storefrontData?.tenant;
  const cat = tenant?.category ?? "cafe";
  const createOrder = useMutation(api.orders.create);

  // Payment Action dari konfigurasi tenant: "midtrans" (online) atau "whatsapp"
  const paymentAction = (tenant as any)?.paymentAction ?? "midtrans";
  const waRaw = ((tenant as any)?.paymentWhatsappNumber ?? "") as string;
  const waDigits = waRaw.replace(/[^\d]/g, "").replace(/^0/, "62");
  const waMode = paymentAction === "whatsapp" && !!waDigits;

  // Cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("tb_storefront_cart") || "[]"); } catch { return []; }
  });

  // Platform settings (Midtrans + RajaOngkir keys)
  const platformSettings = useQuery(api.platformSettings.getAll);
  const rajaongkirKey = platformSettings?.rajaongkir_api_key ?? "";
  const midtransServerKey = platformSettings?.midtrans_server_key ?? "";
  const midtransProduction = platformSettings?.midtrans_production === "true";

  // RajaOngkir integration
  const searchCities = useAction(api.shipping.searchCities);
  const calculateCost = useAction(api.shipping.calculateCost);

  // Midtrans integration
  const [paymentMethod, setPaymentMethod] = useState<"midtrans" | "cod">("midtrans");

  // Shipping info
  const [shipping, setShipping] = useState({ name: "", phone: "", address: "", city: "", cityId: "", notes: "" });
  const [fulfillment, setFulfillment] = useState<"dine_in" | "takeaway" | "delivery" | "shipping">(
    (cat === "cafe" || cat === "restoran") ? "dine_in" : "shipping"
  );
  const [courier, setCourier] = useState<"jne" | "jnt" | "sicepat">("jne");
  const [cityResults, setCityResults] = useState<{ cityId: string; cityName: string; province: string; type: string; postalCode: string }[]>([]);
  const [selectedShippingService, setSelectedShippingService] = useState<{ service: string; cost: number; etd: string } | null>(null);
  const [shippingOptions, setShippingOptions] = useState<{ service: string; cost: number; etd: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [waChatUrl, setWaChatUrl] = useState<string | null>(null);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * ((cat === "toko_retail" || cat === "toko_cat" || cat === "toko_sparepart" || cat === "toko_kain" || cat === "toko_pakaian") ? 0.11 : 0.1));
  const shippingCost = selectedShippingService?.cost ?? 0;
  const total = subtotal + tax + shippingCost;

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((c) => c.productId === productId ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0);
      localStorage.setItem("tb_storefront_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId: string) => {
    const updated = cart.filter((c) => c.productId !== productId);
    setCart(updated);
    localStorage.setItem("tb_storefront_cart", JSON.stringify(updated));
  };

  // Create Midtrans Snap transaction
  const createMidtransPayment = useAction(api.midtrans.createSnapTransaction);

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const orderNumber = `WEB-${Date.now().toString(36).toUpperCase()}`;

      // Create order in DB
      const orderNotes = [
        fulfillment === "dine_in" ? "Dine-in" : fulfillment === "takeaway" ? "Takeaway" : fulfillment === "delivery" ? `Delivery (${courier.toUpperCase()})` : `Shipping (${courier.toUpperCase()})`,
        shipping.address ? `${shipping.name} - ${shipping.address}, ${shipping.city}` : "",
        shipping.notes,
      ].filter(Boolean).join(" | ");

      const orderItems = cart.map((c) => ({
        productId: c.productId, nameSnapshot: c.name, priceSnapshot: c.price, qty: c.qty, subtotal: c.price * c.qty,
      }));

      const order = await createOrder({
        tenantId: storefrontData?.tenant ? (storefrontData as any).tenant._id ?? "" : "",
        orderNumber,
        subtotal, discountTotal: 0, taxTotal: tax,
        grandTotal: total,
        paymentMethod: waMode ? "tempo" : paymentMethod === "midtrans" ? "qris" : "tunai",
        notes: orderNotes,
        createdBy: "web",
        items: orderItems,
      });

      // ── MODE WHATSAPP: buka chat ke nomor tenant dengan ringkasan pesanan ──
      if (waMode) {
        // Info ongkir: hanya untuk kategori dengan cek ongkir (bukan cafe/resto/jasa)
        const needsShipping = fulfillment === "delivery" || fulfillment === "shipping";
        let ongkirLine = "";
        let ongkirNotice = "";
        if (needsShipping && !noOngkir) {
          if (selectedShippingService) {
            ongkirLine =
              shippingCost > 0
                ? `Ongkir (${courier.toUpperCase()} ${selectedShippingService.service}, ${selectedShippingService.etd}): ${formatRp(shippingCost)}`
                : "Ongkir: GRATIS 🎉";
          } else {
            ongkirLine = "Ongkir: belum dipilih — mohon dibantu cek ongkirnya ya";
            ongkirNotice = "*Total belum termasuk ongkir — menunggu konfirmasi dari toko.*";
          }
        }

        const metodeLine = isService
          ? "Metode: Pesan layanan — mohon info jadwal & ketersediaan"
          : needsShipping
            ? `Metode: ${fulfillment === "delivery" ? "Delivery" : "Shipping"}`
            : `Metode: ${fulfillment === "dine_in" ? "Makan di tempat" : "Takeaway"}`;

        const lines = [
          `Halo ${(storefrontData as any)?.tenant?.name ?? "toko"}! Saya mau memesan:`, "",
          ...cart.map((c) => `- ${c.qty}x ${c.name} (${formatRp(c.price * c.qty)})`), "",
          `Subtotal: ${formatRp(subtotal)}`,
          `Pajak: ${formatRp(tax)}`,
          ongkirLine,
          `*TOTAL: ${formatRp(total)}*`,
          ongkirNotice,
          "",
          `No. Order: ${orderNumber}`,
          metodeLine,
          !noOngkir && shipping.city ? `Kirim ke: ${shipping.city}${selectedShippingService ? ` (${courier.toUpperCase()})` : ""}` : "",
          shipping.name ? `Nama: ${shipping.name}` : "",
          shipping.phone ? `Telepon: ${shipping.phone}` : "",
          shipping.address ? `Alamat: ${shipping.address}` : "",
          shipping.notes ? `Catatan: ${shipping.notes}` : "",
          "", noOngkir
            ? isService
              ? "Mohon konfirmasi jadwal & ketersediaan layanan. Terima kasih! 🙏"
              : "Mohon konfirmasi ketersediaan & biaya pengiriman. Terima kasih! 🙏"
            : "Mohon konfirmasi ketersediaan, ongkir, & pembayaran. Terima kasih! 🙏",
        ].filter((l) => l !== "").join("\n");

        const url = `https://wa.me/${waDigits}?text=${encodeURIComponent(lines)}`;
        localStorage.removeItem("tb_storefront_cart");
        setWaChatUrl(url);
        setOrderSuccess(true);
        window.open(url, "_blank", "noopener");
        return;
      }

      // ── MODE ONLINE: pembayaran Midtrans / COD ──
      if (paymentMethod === "midtrans" && midtransServerKey) {
        const result = await createMidtransPayment({
          orderId: orderNumber,
          amount: total,
          customerName: shipping.name || "Customer",
          customerPhone: shipping.phone || undefined,
          items: cart.map((c) => ({
            id: c.productId,
            name: c.name,
            price: c.price,
            quantity: c.qty,
          })),
          serverKey: midtransServerKey,
          isProduction: midtransProduction,
        });

        if (result.success && result.redirectUrl) {
          localStorage.removeItem("tb_storefront_cart");
          // Redirect to Midtrans payment page
          window.location.href = result.redirectUrl;
          return;
        } else {
          alert(`Gagal memproses pembayaran Midtrans: ${result.error}. Pesanan sudah dibuat, silakan bayar COD.`);
        }
      }

      // COD (atau fallback bila Midtrans belum dikonfigurasi)
      localStorage.removeItem("tb_storefront_cart");
      setOrderSuccess(true);
      void order;
    } catch (err) {
      alert("Gagal membuat pesanan. Coba lagi.");
    }
    setProcessing(false);
  };

  if (orderSuccess) {
    // Mode WhatsApp → ajak pelanggan lanjut di chat yang sudah terbuka
    if (waChatUrl) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8 space-y-5">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <svg viewBox="0 0 24 24" className="size-8 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </div>
              <h1 className="text-2xl font-bold">Pesanan Terkirim ke WhatsApp! 🎉</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ringkasan pesanan Anda sudah dikirim ke WhatsApp toko. Tim toko akan membalas untuk
                konfirmasi stok, ongkir, dan pembayaran.
              </p>
              <div className="flex flex-col gap-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => window.open(waChatUrl, "_blank", "noopener")}>
                  💬 Buka WhatsApp Lagi
                </Button>
                <Button variant="outline" onClick={() => navigate(`/store?sub=${subdomain || ""}`)}>Kembali ke Toko</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8 space-y-4">
            <div className="text-6xl">✅</div>
            <h1 className="text-2xl font-bold">Pesanan Berhasil!</h1>
            <p className="text-muted-foreground">Terima kasih. Pesanan Anda sedang diproses.</p>
            <Button onClick={() => navigate(`/store?sub=${subdomain || ""}`)}>Kembali ke Toko</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-6xl">🛒</div>
          <h1 className="text-2xl font-bold">Keranjang Kosong</h1>
          <Button onClick={() => navigate(`/store?sub=${subdomain || ""}`)}>Belanja Sekarang</Button>
        </div>
      </div>
    );
  }

  // City search handler
  const handleCitySearch = useCallback(async (query: string) => {
    if (query.length < 2) { setCityResults([]); return; }
    try {
      const results = await searchCities({ query, apiKey: rajaongkirKey || undefined });
      setCityResults(results as any);
    } catch { setCityResults([]); }
  }, [searchCities, rajaongkirKey]);

  // Calculate shipping cost
  const handleCalculateShipping = useCallback(async (cityId: string) => {
    setShippingOptions([]);
    setSelectedShippingService(null);
    try {
      const results = await calculateCost({
        origin: (tenant as any)?.cityId ?? "151",
        destination: cityId,
        weight: cart.reduce((s, c) => s + (c.qty * 500), 0),
        courier,
        apiKey: rajaongkirKey || undefined,
      });
      const options = (results as any) ?? [];
      setShippingOptions(options);
      if (options.length > 0) setSelectedShippingService(options[0]);
    } catch {
      setShippingOptions([]);
      setSelectedShippingService(null);
    }
  }, [calculateCost, tenant, cart, courier]);

  const isFood = cat === "cafe" || cat === "restoran" || cat === "bakery";
  // Kategori tanpa cek ongkir (RajaOngkir): cafe, restoran, dan jasa (spa & bengkel)
  const noOngkir = cat === "cafe" || cat === "restoran" || cat === "spa" || cat === "bengkel";
  const isService = cat === "spa" || cat === "bengkel";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="size-4 mr-1" /> Kembali</Button>
          <h1 className="font-bold">Checkout</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: Cart + Info */}
          <div className="space-y-6">
            {/* Fulfillment Method (for food categories) */}
            {isFood && (
              <Card className="border-border/60">
                <CardHeader className="pb-3"><CardTitle className="text-base">Metode Penyajian</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ key: "dine_in", label: "🍽️ Dine-in", desc: "Makan di tempat" }, { key: "takeaway", label: "🥡 Takeaway", desc: "Bawa pulang" }, { key: "delivery", label: "🚗 Delivery", desc: "Antar ke alamat" }].map((m) => (
                      <button key={m.key} onClick={() => setFulfillment(m.key as any)}
                        className={`rounded-lg border p-3 text-center transition-all ${fulfillment === m.key ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/60 hover:border-primary/30"}`}>
                        <p className="text-sm font-semibold">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping / Address Info — tanpa cek ongkir utk cafe/resto/jasa */}
            {(fulfillment === "delivery" || fulfillment === "shipping" || !isFood) && (
              <Card className="border-border/60">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Truck className="size-4" /> {isService ? "Informasi Pemesan" : isFood ? "Alamat Pengiriman" : "Informasi Pengiriman"}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Nama Lengkap</Label><Input value={shipping.name} onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))} placeholder="Nama" /></div>
                    <div><Label className="text-xs">Telepon</Label><Input value={shipping.phone} onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))} placeholder="08xxx" /></div>
                  </div>
                  {!isService && <div><Label className="text-xs">Alamat Lengkap</Label><Input value={shipping.address} onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))} placeholder="Jl. ..., RT/RW, Kelurahan" /></div>}

                  {/* Cek ongkir (kota + kurir) — disembunyikan untuk cafe/resto/spa/bengkel */}
                  {!noOngkir && (
                    <div>
                      <Label className="text-xs">Kota / Kabupaten</Label>
                      <Input
                        value={shipping.city}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShipping((s) => ({ ...s, city: val, cityId: "" }));
                          setSelectedShippingService(null);
                          setShippingOptions([]);
                          handleCitySearch(val);
                        }}
                        placeholder="Ketik nama kota..."
                      />
                      {cityResults.length > 0 && !shipping.cityId && (
                        <div className="mt-1 max-h-40 overflow-y-auto border border-border rounded-lg bg-background shadow-lg">
                          {cityResults.map((c) => (
                            <button
                              key={c.cityId}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                              onClick={() => {
                                setShipping((s) => ({ ...s, city: c.cityName, cityId: c.cityId }));
                                setCityResults([]);
                                handleCalculateShipping(c.cityId);
                              }}
                            >
                              {c.cityName}, {c.province}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div><Label className="text-xs">{isService ? "Catatan / Jadwal yang diinginkan" : "Catatan"}</Label><Input value={shipping.notes} onChange={(e) => setShipping((s) => ({ ...s, notes: e.target.value }))} placeholder={isService ? "Contoh: Sabtu siang, terapis wanita..." : "Catatan untuk toko..."} /></div>

                  {/* Pilih Kurir & layanan ongkir — hanya jika ada cek ongkir */}
                  {!noOngkir && shipping.cityId && (
                    <div>
                      <Label className="text-xs">Kurir</Label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {([
                          { key: "jne", label: "JNE", desc: "Reg/Yes/Oke" },
                          { key: "jnt", label: "J&T", desc: "EZ/Reg" },
                          { key: "sicepat", label: "SiCepat", desc: "Reg/Halu" },
                        ] as const).map((c) => (
                          <button
                            key={c.key}
                            onClick={() => {
                              setCourier(c.key);
                              handleCalculateShipping(shipping.cityId);
                            }}
                            className={`rounded-lg border p-2 text-center transition-all text-xs ${
                              courier === c.key ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/60 hover:border-primary/30"
                            }`}
                          >
                            <p className="font-semibold">{c.label}</p>
                            <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                          </button>
                        ))}
                      </div>
                      {shippingOptions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {shippingOptions.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedShippingService(opt)}
                              className={`w-full flex justify-between items-center rounded-lg border p-2 text-xs transition-all ${
                                selectedShippingService?.service === opt.service
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                  : "border-border/60 hover:border-primary/30"
                              }`}
                            >
                              <span className="font-medium">{opt.service}</span>
                              <span className="text-muted-foreground">{opt.etd}</span>
                              <span className="font-bold text-primary">{formatRp(opt.cost)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {noOngkir && (
                    <p className="rounded-lg bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                      {isService
                        ? "💬 Tim toko akan mengonfirmasi jadwal & ketersediaan layanan melalui chat."
                        : "🛵 Biaya pengiriman akan disepakati dengan toko (tidak dihitung otomatis)."}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Cart Items */}
            <Card className="border-border/60">
              <CardHeader className="pb-3"><CardTitle className="text-base">Item ({cart.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 py-3 border-b border-border/60 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatRp(item.price)} × {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-border rounded-lg">
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => updateQty(item.productId, -1)}><span className="text-xs">−</span></Button>
                        <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => updateQty(item.productId, 1)}><span className="text-xs">+</span></Button>
                      </div>
                      <span className="text-sm font-bold w-24 text-right">{formatRp(item.price * item.qty)}</span>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive" onClick={() => removeItem(item.productId)}><Trash2 className="size-3" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Summary + Payment */}
          <div className="space-y-4">
            <Card className="border-border/60 sticky top-20">
              <CardHeader className="pb-3"><CardTitle className="text-base">Ringkasan Pesanan</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRp(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pajak ({(cat === "toko_retail" || cat === "toko_cat" || cat === "toko_sparepart" || cat === "toko_kain") ? "11" : "10"}%)</span><span>{formatRp(tax)}</span></div>
                  {!noOngkir && selectedShippingService && <div className="flex justify-between"><span className="text-muted-foreground">Ongkir ({selectedShippingService.service})</span><span>{formatRp(shippingCost)}</span></div>}
                  {!noOngkir && !selectedShippingService && (fulfillment === "delivery" || fulfillment === "shipping") && !shipping.cityId && <div className="flex justify-between"><span className="text-muted-foreground">Ongkir</span><span className="text-xs text-muted-foreground">Pilih kota</span></div>}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-extrabold">
                  <span>Total</span><span className="text-primary">{formatRp(total)}</span>
                </div>

                {/* Payment Method — hanya untuk mode Online; mode WhatsApp pakai CTA langsung */}
                {waMode ? (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 text-center">
                    <p className="text-xs font-bold text-emerald-600">💬 Pembayaran via WhatsApp</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Setelah klik tombol di bawah, chat WhatsApp ke toko terbuka otomatis dengan ringkasan pesanan Anda.
                    </p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Label className="text-xs">Metode Pembayaran</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { key: "midtrans", label: "💳 Midtrans", desc: "QRIS/EDC/Transfer" },
                        { key: "cod", label: "💵 COD", desc: "Bayar di tempat" },
                      ].map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setPaymentMethod(m.key as any)}
                          className={`rounded-lg border p-2 text-center transition-all ${
                            paymentMethod === m.key
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border/60 hover:border-primary/30"
                          }`}
                        >
                          <p className="text-xs font-semibold">{m.label}</p>
                          <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                    {paymentMethod === "midtrans" && !midtransServerKey && (
                      <p className="text-[10px] text-amber-600 mt-1">⚠️ Midtrans belum dikonfigurasi. Menggunakan COD.</p>
                    )}
                  </div>
                )}

                {/* Est. Time */}
                {isFood && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                    <Clock className="size-3" />
                    <span>Estimasi: {fulfillment === "dine_in" ? "15-20 menit" : fulfillment === "takeaway" ? "10-15 menit" : "30-45 menit"}</span>
                  </div>
                )}

                <Button
                  className={waMode ? "w-full bg-emerald-600 hover:bg-emerald-700" : "w-full"}
                  size="lg"
                  onClick={handleOrder}
                  disabled={processing}
                >
                  {processing
                    ? "Memproses..."
                    : waMode
                      ? `💬 Pesan via WhatsApp — ${formatRp(total)}`
                      : `Bayar ${formatRp(total)}`}
                </Button>
                {waMode && (
                  <p className="text-[10px] text-center text-emerald-600">
                    Pembayaran dikonfirmasi langsung lewat chat dengan toko.
                  </p>
                )}

                <p className="text-[10px] text-center text-muted-foreground">
                  Dengan memesan, Anda menyetujui syarat & ketentuan.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
