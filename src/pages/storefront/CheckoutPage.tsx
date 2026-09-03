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

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * ((cat === "toko_retail" || cat === "toko_cat" || cat === "toko_sparepart" || cat === "toko_kain") ? 0.11 : 0.1));
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

      await createOrder({
        tenantId: storefrontData?.tenant ? (storefrontData as any).tenant._id ?? "" : "",
        orderNumber,
        subtotal, discountTotal: 0, taxTotal: tax,
        grandTotal: total,
        paymentMethod: paymentMethod === "midtrans" ? "qris" : "tunai",
        notes: orderNotes,
        createdBy: "web",
        items: cart.map((c) => ({
          productId: c.productId, nameSnapshot: c.name, priceSnapshot: c.price, qty: c.qty, subtotal: c.price * c.qty,
        })),
      });

      // If Midtrans, redirect to payment page
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

      // COD or Midtrans fallback
      localStorage.removeItem("tb_storefront_cart");
      setOrderSuccess(true);
    } catch (err) {
      alert("Gagal membuat pesanan. Coba lagi.");
    }
    setProcessing(false);
  };

  if (orderSuccess) {
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

            {/* Shipping / Address Info */}
            {(fulfillment === "delivery" || fulfillment === "shipping" || !isFood) && (
              <Card className="border-border/60">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Truck className="size-4" /> {isFood ? "Alamat Pengiriman" : "Informasi Pengiriman"}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Nama Lengkap</Label><Input value={shipping.name} onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))} placeholder="Nama" /></div>
                    <div><Label className="text-xs">Telepon</Label><Input value={shipping.phone} onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))} placeholder="08xxx" /></div>
                  </div>
                  <div><Label className="text-xs">Alamat Lengkap</Label><Input value={shipping.address} onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))} placeholder="Jl. ..., RT/RW, Kelurahan" /></div>
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
                  <div><Label className="text-xs">Catatan</Label><Input value={shipping.notes} onChange={(e) => setShipping((s) => ({ ...s, notes: e.target.value }))} placeholder="Catatan untuk kurir..." /></div>

                  {/* Courier Selection */}
                  {shipping.cityId && (
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
                  {selectedShippingService && <div className="flex justify-between"><span className="text-muted-foreground">Ongkir ({selectedShippingService.service})</span><span>{formatRp(shippingCost)}</span></div>}
                  {!selectedShippingService && (fulfillment === "delivery" || fulfillment === "shipping") && !shipping.cityId && <div className="flex justify-between"><span className="text-muted-foreground">Ongkir</span><span className="text-xs text-muted-foreground">Pilih kota</span></div>}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-extrabold">
                  <span>Total</span><span className="text-primary">{formatRp(total)}</span>
                </div>

                {/* Payment Method */}
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

                {/* Est. Time */}
                {isFood && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                    <Clock className="size-3" />
                    <span>Estimasi: {fulfillment === "dine_in" ? "15-20 menit" : fulfillment === "takeaway" ? "10-15 menit" : "30-45 menit"}</span>
                  </div>
                )}

                <Button className="w-full" size="lg" onClick={handleOrder} disabled={processing}>
                  {processing ? "Memproses..." : `Bayar ${formatRp(total)}`}
                </Button>

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
