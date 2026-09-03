import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag, Star, Clock, MapPin, Phone, CreditCard,
  Coffee, UtensilsCrossed, ShoppingCart, Wrench, Cake,
  Paintbrush, Sparkles, Car, Scissors, CalendarDays, Users,
  Search, Truck, Heart, Bed, Calculator, Link2, Shield,
  Package, Tag, Percent, Bell, ScissorsIcon,
} from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const CATEGORY_ICONS: Record<string, any> = {
  cafe: Coffee, restoran: UtensilsCrossed, toko_retail: ShoppingCart,
  bakery: Cake, toko_cat: Paintbrush, spa: Sparkles,
  bengkel: Wrench, toko_sparepart: Car, toko_kain: Scissors,
};

const CATEGORY_LABELS: Record<string, string> = {
  cafe: "Cafe", restoran: "Restoran", toko_retail: "Retail",
  bakery: "Bakery", toko_cat: "Toko Cat", spa: "Spa",
  bengkel: "Bengkel", toko_sparepart: "Sparepart", toko_kain: "Kain",
};

function detectSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length >= 3) return parts[0];
  if (parts[0] === "localhost" || parts[0].match(/^\d/)) return null;
  return parts[0];
}

export default function Storefront() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subdomain = useMemo(() => detectSubdomain() || searchParams.get("sub") || null, [searchParams]);

  const storefrontData = useQuery(api.tenants.getStorefront, subdomain ? { subdomain } : "skip");
  const tenant = storefrontData?.tenant;
  const categories = storefrontData?.categories ?? [];
  const products = storefrontData?.products ?? [];
  const extra = storefrontData?.extra ?? {};
  const cat = tenant?.category ?? "cafe";
  const CatIcon = CATEGORY_ICONS[cat] ?? Coffee;

  if (subdomain && storefrontData === undefined) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center space-y-4"><Skeleton className="h-12 w-48 mx-auto" /><Skeleton className="h-4 w-64 mx-auto" /><p className="text-sm text-muted-foreground">Memuat toko...</p></div></div>;
  }
  if (subdomain && storefrontData === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center space-y-4"><div className="text-6xl">🏪</div><h1 className="text-2xl font-bold">Toko Tidak Ditemukan</h1><p className="text-muted-foreground">Subdomain <strong>{subdomain}</strong>.tokobuilder.id tidak terdaftar.</p><Button onClick={() => window.location.href = "/"}>Kembali</Button></div></div>;
  }
  if (!subdomain) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold mb-4">TokoBuilder Storefront</h1>
          <p className="text-muted-foreground mb-8">Pilih kategori untuk melihat contoh storefront:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => { const Icon = CATEGORY_ICONS[key]; return (
              <a key={key} href={`/store?cat=${key}`} className="flex flex-col items-center gap-2 rounded-xl border border-border/60 p-5 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"><Icon className="size-8 text-primary" /><span className="font-semibold text-sm">{label}</span></a>
            ); })}
          </div>
          <p className="text-xs text-muted-foreground mt-8">Atau akses via subdomain: <code className="bg-muted px-1.5 py-0.5 rounded">kopisenja.tokobuilder.id</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — all categories */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5"><CatIcon className="size-3" />{CATEGORY_LABELS[cat]}</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{tenant?.name}</h1>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Star className="size-4 text-amber-500 fill-amber-500" />4.8</span>
            <span className="flex items-center gap-1"><Clock className="size-4" />Buka 07:00-22:00</span>
            {tenant?.address && <span className="flex items-center gap-1"><MapPin className="size-4" />{tenant.address}</span>}
            {tenant?.phone && <span className="flex items-center gap-1"><Phone className="size-4" />{tenant.phone}</span>}
          </div>
        </div>
      </section>

      {/* Category-specific sections */}
      {(cat === "cafe" || cat === "restoran") && <CafeRestoSections extra={extra} />}
      {cat === "toko_retail" && <RetailSections />}
      {cat === "bakery" && <BakerySections extra={extra} />}
      {cat === "toko_cat" && <TokoCatSections extra={extra} />}
      {cat === "spa" && <SpaSections extra={extra} />}
      {cat === "bengkel" && <BengkelSections extra={extra} />}
      {cat === "toko_sparepart" && <SparepartSections extra={extra} />}
      {cat === "toko_kain" && <KainSections extra={extra} />}

      {/* Search Bar */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Cari produk..." className="pl-9" onClick={() => navigate(`/store/search?sub=${subdomain || ""}`)} readOnly />
        </div>
      </section>

      {/* Product Grid — all categories */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        <h2 className="text-xl font-bold mb-6">Menu / Produk ({products.length})</h2>
        <ProductGrid products={products} categories={categories} subdomain={subdomain} />
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY-SPECIFIC SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function CafeRestoSections({ extra }: { extra: any }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      {/* Table Info */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="size-5 text-primary" /></div>
              <div>
                <p className="font-bold">Info Meja</p>
                <p className="text-sm text-muted-foreground">{extra.availableTables ?? 0} dari {extra.tableCount ?? 0} meja tersedia</p>
              </div>
            </div>
            <Button variant="outline" size="sm"><CalendarDays className="size-4 mr-1" /> Reservasi</Button>
          </div>
          {extra.areas && (
            <div className="flex gap-2 mt-3">
              {extra.areas.map((a: string) => <Badge key={a} variant="secondary" className="text-xs capitalize">{a}</Badge>)}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function RetailSections() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Percent className="size-5 text-primary" />
            <div>
              <p className="font-bold">Promo Hari Ini!</p>
              <p className="text-sm text-muted-foreground">Diskon spesial untuk produk terpilih</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">HOT</Badge>
        </CardContent>
      </Card>
    </section>
  );
}

function BakerySections({ extra }: { extra: any }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      {/* Display Counter */}
      {extra.displayCounters?.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">🧁 Display Counter Chiller</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {extra.displayCounters.map((c: any, i: number) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.type} • {c.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Custom Cake CTA */}
      <Card className="border-pink-200 bg-pink-50/50">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cake className="size-5 text-pink-600" />
            <div>
              <p className="font-bold">Custom Cake</p>
              <p className="text-sm text-muted-foreground">Pesanan kue ulang tahun & custom design. Deposit 50%.</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Pesan</Button>
        </CardContent>
      </Card>
    </section>
  );
}

function TokoCatSections({ extra }: { extra: any }) {
  const [luas, setLuas] = useState(50);
  const [lapis, setLapis] = useState(2);
  const liter = (luas / 11) * lapis;
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      {/* Volume Calculator */}
      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="size-4" /> Volume Calculator</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium">Luas Area (m²)</label><Input type="number" value={luas} onChange={(e) => setLuas(+e.target.value)} className="mt-1" /></div>
            <div><label className="text-xs font-medium">Lapisan</label><Input type="number" value={lapis} onChange={(e) => setLapis(+e.target.value)} className="mt-1" /></div>
          </div>
          <div className="bg-primary/5 rounded-lg p-3 text-center">
            <p className="text-2xl font-extrabold text-primary">{liter.toFixed(1)} Liter</p>
            <p className="text-xs text-muted-foreground">Rekomendasi: {liter <= 1 ? "1 Kaleng 1L" : liter <= 5 ? "1 Kaleng 5L" : `${Math.ceil(liter / 25)} Kaleng 25L`}</p>
          </div>
        </CardContent>
      </Card>
      {/* Color Formulas */}
      {extra.colorFormulas?.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Paintbrush className="size-4" /> Formula Warna Populer</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {extra.colorFormulas.map((f: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                  <div><span className="font-mono font-bold">{f.colorCode}</span> <span className="text-muted-foreground">{f.colorName}</span></div>
                  <div className="flex gap-2"><Badge variant="outline" className="text-xs">{f.brand}</Badge><Badge variant="secondary" className="text-xs">{f.finish}</Badge></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function SpaSections({ extra }: { extra: any }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      {/* Rooms */}
      {extra.rooms?.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bed className="size-4" /> Ruangan</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {extra.rooms.map((r: any, i: number) => (
                <div key={i} className={`rounded-lg p-3 text-center border ${r.status === "available" ? "border-green-200 bg-green-50/50" : "border-border/60 bg-muted/30"}`}>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.type}</p>
                  <Badge variant={r.status === "available" ? "default" : "secondary"} className="mt-1 text-[10px]">{r.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Therapists */}
      {extra.therapists?.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Heart className="size-4" /> Therapist</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {extra.therapists.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">{t.name[0]}</div>
                    <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.specialization?.join(", ")}</p></div>
                  </div>
                  <div className="flex items-center gap-1 text-sm"><Star className="size-3 text-amber-500 fill-amber-500" />{t.rating}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Booking CTA */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3"><CalendarDays className="size-5 text-purple-600" /><div><p className="font-bold">Booking Sekarang</p><p className="text-sm text-muted-foreground">Pilih tanggal, jam, dan therapist favorit Anda</p></div></div>
          <Button variant="outline" size="sm">Booking</Button>
        </CardContent>
      </Card>
    </section>
  );
}

function BengkelSections({ extra }: { extra: any }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      {/* Service List */}
      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Wrench className="size-4" /> Layanan Servis</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{ name: "Servis Ringan", desc: "Ganti oli, filter, busi", price: "Mulai Rp150K" }, { name: "Servis Sedang", desc: "Tune up, rem, kopling", price: "Mulai Rp350K" }, { name: "Servis Berat", desc: "Overhaul, turun mesin", price: "Mulai Rp2JT" }].map((s) => (
              <div key={s.name} className="rounded-lg border border-border/60 p-4 text-center hover:border-primary/30 transition-colors">
                <p className="font-bold text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                <p className="text-sm font-extrabold text-primary mt-2">{s.price}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Mechanics */}
      {extra.mechanics?.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base">Mekanik Tersedia</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {extra.mechanics.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">{m.name[0]}</div>
                    <div><p className="text-sm font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{m.specialization}</p></div>
                  </div>
                  <div className="flex items-center gap-1 text-sm"><Star className="size-3 text-amber-500 fill-amber-500" />{m.rating}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Vehicle Lookup CTA */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3"><Car className="size-5 text-blue-600" /><div><p className="font-bold">Cek Riwayat Kendaraan</p><p className="text-sm text-muted-foreground">Masukkan plat nomor untuk lihat riwayat servis</p></div></div>
          <Button variant="outline" size="sm">Cek</Button>
        </CardContent>
      </Card>
    </section>
  );
}

function SparepartSections({ extra }: { extra: any }) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      {/* VIN Search */}
      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Search className="size-4" /> Cari Part by VIN / Brand / Model</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Masukkan VIN, brand, atau model..." className="flex-1" />
            <Button><Search className="size-4 mr-1" /> Cari</Button>
          </div>
        </CardContent>
      </Card>
      {/* Cross References */}
      {extra.crossReferences?.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Link2 className="size-4" /> Cross-Reference Populer</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {extra.crossReferences.slice(0, 5).map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 text-sm">
                  <span className="font-medium">{r.brand}</span>
                  <span className="font-mono text-muted-foreground">OEM: {r.oemNumber}</span>
                  <span>→</span>
                  <span className="font-mono">{r.aftermarketNumber}</span>
                  <Badge variant="outline" className="text-xs ml-auto">{r.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function KainSections({ extra }: { extra: any }) {
  const [meter, setMeter] = useState(10);
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      {/* Roll Info */}
      {extra.rolls?.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Package className="size-4" /> Stok Roll Kain</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {extra.rolls.map((r: any, i: number) => {
                const pct = r.totalMeter > 0 ? (r.remainingMeter / r.totalMeter) * 100 : 0;
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div><span className="font-mono font-bold text-sm">{r.rollNumber}</span><span className="text-xs text-muted-foreground ml-2">Lebar {r.widthCm}cm</span></div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${pct > 30 ? "bg-green-500" : pct > 10 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} /></div>
                      <span className="text-sm font-bold">{r.remainingMeter.toFixed(1)}m</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Calculator */}
      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="size-4" /> Kalkulator Kebutuhan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1"><label className="text-xs font-medium">Kebutuhan (meter)</label><Input type="number" value={meter} onChange={(e) => setMeter(+e.target.value)} className="mt-1" /></div>
            <div className="pt-5"><p className="text-lg font-extrabold text-primary">{meter}m</p><p className="text-xs text-muted-foreground">≈ {Math.ceil(meter / 25)} roll</p></div>
          </div>
        </CardContent>
      </Card>
      {/* Remnants */}
      {extra.remnants?.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Tag className="size-4" /> Remnants (Sisa Kain)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {extra.remnants.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/50 p-3 text-sm">
                  <div><span className="font-mono font-bold">{r.barcode}</span><span className="text-muted-foreground ml-2">{r.meterRemaining.toFixed(2)}m</span></div>
                  <span className="font-bold text-primary">{formatRp(r.price)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Konveksi B2B CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3"><Truck className="size-5 text-primary" /><div><p className="font-bold">Konveksi B2B</p><p className="text-sm text-muted-foreground">Harga grosir untuk konveksi & garmen. Min. 10 roll.</p></div></div>
          <Button variant="outline" size="sm">Hubungi</Button>
        </CardContent>
      </Card>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT GRID (shared across all categories)
// ═══════════════════════════════════════════════════════════════════════════════

function ProductGrid({ products, categories, subdomain }: { products: any[]; categories: any[]; subdomain?: string | null }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cart, setCart] = useState<{ name: string; price: number; qty: number }[]>([]);

  const filtered = activeCategory === "Semua" ? products : products.filter((p) => categories.find((c) => c._id === p.categoryId)?.name === activeCategory);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === product.name);
      if (existing) return prev.map((c) => c.name === product.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { name: product.name, price: product.price, qty: 1 }];
    });
  };

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {["Semua", ...categories.map((c) => c.name)].map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <Card key={p._id} className="group border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all overflow-hidden cursor-pointer" onClick={() => navigate(`/store/product/${p.slug}?sub=${subdomain || ""}`)}>
            <div className="relative h-32 bg-muted/30 flex items-center justify-center">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" /> : <ShoppingBag className="size-10 text-muted-foreground/30 group-hover:text-primary/30 transition-colors" />}
              {p.stockQuantity <= 0 && <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">Habis</Badge>}
            </div>
            <CardContent className="p-4">
              <h3 className="text-sm font-bold leading-tight">{p.name}</h3>
              {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-base font-extrabold text-primary">{formatRp(p.price)}</span>
                <button onClick={() => addToCart(p)} disabled={p.stockQuantity <= 0}
                  className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <ShoppingBag className="size-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground"><ShoppingBag className="size-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Belum ada produk</p></div>}
      </div>
      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 z-50">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <span className="text-sm font-medium">{cart.reduce((s, c) => s + c.qty, 0)} item</span>
            <div className="flex items-center gap-3">
              <span className="font-extrabold">{formatRp(cart.reduce((s, c) => s + c.price * c.qty, 0))}</span>
              <Button className="gap-2" onClick={() => navigate(`/store/checkout?sub=${subdomain || ""}`)}><CreditCard className="size-4" /> Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
