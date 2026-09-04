import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ShoppingBag, Store, ArrowRight, Sparkles, Truck, ShieldCheck,
  CreditCard, ChevronRight, MapPin, LayoutGrid, Heart,
} from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const CATEGORY_META: Record<string, { label: string; emoji: string; gradient: string }> = {
  cafe: { label: "Cafe", emoji: "☕", gradient: "from-amber-500/20 to-orange-500/5" },
  restoran: { label: "Restoran", emoji: "🍜", gradient: "from-red-500/20 to-rose-500/5" },
  toko_retail: { label: "Retail", emoji: "🛍️", gradient: "from-emerald-500/20 to-teal-500/5" },
  bakery: { label: "Bakery", emoji: "🍞", gradient: "from-pink-500/20 to-rose-500/5" },
  toko_cat: { label: "Toko Cat", emoji: "🎨", gradient: "from-blue-500/20 to-indigo-500/5" },
  spa: { label: "Spa", emoji: "💆", gradient: "from-green-500/20 to-emerald-500/5" },
  bengkel: { label: "Bengkel", emoji: "🔧", gradient: "from-slate-500/20 to-gray-500/5" },
  toko_sparepart: { label: "Sparepart", emoji: "🚗", gradient: "from-cyan-500/20 to-sky-500/5" },
  toko_kain: { label: "Kain", emoji: "🧵", gradient: "from-purple-500/20 to-violet-500/5" },
  toko_pakaian: { label: "Toko Pakaian", emoji: "👕", gradient: "from-fuchsia-500/20 to-pink-500/5" },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_META);

export default function MarketplaceLanding() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const data = useQuery(
    api.marketplace.getMarketplace,
    { perStore: 6, search: search || undefined, category: activeCat || undefined },
  );

  const products = data?.featuredProducts ?? [];
  const stores = data?.stores ?? [];
  const stats = data?.stats;

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const goProduct = (p: any) => navigate(`/store/product/${p.slug}?sub=${p.subdomain}`);

  return (
    <div className="min-h-screen bg-background">
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm">TB</div>
            <div className="leading-tight text-left">
              <p className="font-extrabold text-sm">TokoBuilder<span className="text-primary">.id</span></p>
              <p className="text-[9px] text-muted-foreground">Marketplace UMKM</p>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <button onClick={() => navigate("/platform-landing")} className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-colors">Platform</button>
            <button onClick={() => { setActiveCat(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-colors">Semua Produk</button>
          </div>

          <div className="hidden md:flex flex-1 max-w-md ml-auto items-center relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk, toko, kategori…"
              className="pl-9 rounded-full bg-muted/60 border-transparent focus:bg-background"
            />
          </div>

          <div className="ml-auto md:ml-0 flex items-center gap-2">
            <button onClick={() => navigate("/auth")} className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Masuk</button>
            <Button size="sm" className="rounded-full" onClick={() => navigate("/auth")}>
              <Store className="h-4 w-4 mr-1" /> Jualan di Sini
            </Button>
          </div>
        </div>
        {/* Search mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk, toko, kategori…" className="pl-9 rounded-full bg-muted/60" />
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-amber-50" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 lg:py-24">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 rounded-full bg-background/70 text-xs py-1 px-3">
              <Sparkles className="h-3 w-3 mr-1 text-primary" /> {stats?.totalStores ?? "…"} toko lokal, satu marketplace
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Belanja dari{" "}
              <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">UMKM terbaik</span>{" "}
              di Indonesia 🇮🇩
            </h1>
            <p className="mt-4 text-muted-foreground text-base lg:text-lg">
              Kopi pagi, cat rumah, sparepart motor, kain batik, hingga spa — semua dalam satu tempat.
              Belanja langsung dari toko, bayar aman via Midtrans.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-7" onClick={() => document.getElementById("produk")?.scrollIntoView({ behavior: "smooth" })}>
                <ShoppingBag className="h-5 w-5 mr-2" /> Belanja Sekarang
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-7 bg-background/70" onClick={() => navigate("/auth")}>
                <Store className="h-5 w-5 mr-2" /> Buka Toko Gratis
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3 max-w-md gap-4">
              {[
                { label: "Toko Aktif", value: stats?.totalStores ?? 0 },
                { label: "Produk", value: stats?.totalProducts ?? 0 },
                { label: "Kategori", value: stats?.totalCategories ?? 0 },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold">{s.value.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────── */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> Ongkir via RajaOngkir (JNE/J&T/SiCepat)</span>
          <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-primary" /> Bayar Midtrans QRIS/Transfer</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Belanja langsung dari toko resmi</span>
        </div>
      </section>

      {/* ── CATEGORY CHIPS ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => setActiveCat(null)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${!activeCat ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border/60 hover:border-primary/40"}`}
          >
            <LayoutGrid className="h-4 w-4" /> Semua
          </button>
          {CATEGORY_ORDER.map((key) => {
            const meta = CATEGORY_META[key];
            const isActive = activeCat === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCat(isActive ? null : key)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${isActive ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border/60 hover:border-primary/40"}`}
              >
                <span>{meta.emoji}</span> {meta.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── PRODUCT GRID ───────────────────────────────────── */}
      <section id="produk" className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold">
              {activeCat ? `${CATEGORY_META[activeCat]?.emoji} ${CATEGORY_META[activeCat]?.label}` : "🛍️ Produk Pilihan"}
            </h2>
            <p className="text-sm text-muted-foreground">{products.length} produk dari {stores.length} toko</p>
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch("")}>✕ Hapus pencarian</Button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🔍</div>
            <p className="font-semibold">Produk tidak ditemukan</p>
            <p className="text-sm text-muted-foreground">Coba kata kunci lain atau kategori berbeda</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setActiveCat(null); }}>Reset Filter</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
            {products.map((p: any) => {
              const meta = CATEGORY_META[p.storeCategory] ?? CATEGORY_META.toko_retail;
              const isLiked = liked.has(p._id);
              return (
                <div
                  key={p._id}
                  onClick={() => goProduct(p)}
                  className="group cursor-pointer rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                >
                  {/* Visual */}
                  <div className={`relative aspect-square bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl drop-shadow-sm transition-transform group-hover:scale-110">{meta.emoji}</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(p._id); }}
                      className={`absolute top-2 right-2 size-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center transition-all ${isLiked ? "text-red-500 scale-110" : "text-muted-foreground hover:text-red-400"}`}
                    >
                      <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <Badge className="absolute bottom-2 left-2 text-[10px] bg-background/85 backdrop-blur text-foreground">
                      {meta.emoji} {meta.label}
                    </Badge>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-bold leading-snug line-clamp-2 min-h-[2.5rem]">{p.name}</p>
                    <p className="text-sm font-extrabold text-primary mt-1">{formatRp(p.price)}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Store className="h-3 w-3 shrink-0" style={{ color: p.primaryColor }} />
                      <span className="truncate">{p.storeName}</span>
                      <ChevronRight className="h-3 w-3 ml-auto shrink-0 opacity-50" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── STORES SECTION ─────────────────────────────────── */}
      {!activeCat && !search && stores.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl lg:text-2xl font-extrabold">🏪 Jelajahi Toko</h2>
              <p className="text-sm text-muted-foreground">Belanja langsung dari toko favorit Anda</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stores.slice(0, 8).map((s: any) => {
              const meta = CATEGORY_META[s.category] ?? CATEGORY_META.toko_retail;
              return (
                <button
                  key={s._id}
                  onClick={() => navigate(`/store?sub=${s.subdomain}`)}
                  className="group text-left rounded-2xl border border-border/60 p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="size-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm"
                      style={{ backgroundColor: s.primaryColor }}
                    >
                      {s.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate font-mono">{s.subdomain}.tokobuilder.id</p>
                    </div>
                    <ArrowRight className="ml-auto size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{meta.emoji} {meta.label}</Badge>
                    <span className="text-[11px] text-muted-foreground">{s.productCount} produk</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SELLER CTA ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-amber-600 text-primary-foreground px-6 py-12 lg:px-14 lg:py-16">
          <div className="absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <Badge className="bg-white/20 text-primary-foreground border-white/30 rounded-full mb-4">
              <Sparkles className="h-3 w-3 mr-1" /> Gratis 14 hari
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight">
              Punya bisnis? Buat toko online Anda dalam 3 langkah.
            </h2>
            <p className="mt-3 text-primary-foreground/85">
              Pilih kategori, pilih template, isi info toko — selesai. Dashboard lengkap: POS, stok, laporan, KDS, hingga pembayaran Midtrans.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" className="rounded-full px-7" onClick={() => navigate("/auth")}>
                Buka Toko Sekarang <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-7 border-white/40 text-primary-foreground hover:bg-white/10" onClick={() => navigate("/platform-landing")}>
                Lihat Platform
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-primary-foreground/80">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> 10 kategori bisnis</span>
              <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> 30 template siap pakai</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Subdomain toko sendiri</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-[10px]">TB</div>
              <p className="font-extrabold">TokoBuilder<span className="text-primary">.id</span></p>
            </div>
            <p className="text-sm text-muted-foreground mt-3 max-w-xs">
              Marketplace UMKM Indonesia — belanja langsung dari toko online yang dibangun di platform TokoBuilder.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Kategori</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORY_ORDER.map((k) => (
                <button key={k} onClick={() => { setActiveCat(k); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-sm text-muted-foreground hover:text-primary text-left">
                  {CATEGORY_META[k].emoji} {CATEGORY_META[k].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Platform</p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <button onClick={() => navigate("/platform-landing")} className="hover:text-primary block">Tentang TokoBuilder</button>
              <button onClick={() => navigate("/auth")} className="hover:text-primary block">Buat Toko</button>
              <button onClick={() => navigate("/auth")} className="hover:text-primary block">Masuk</button>
            </div>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TokoBuilder.id — Platform SaaS & Marketplace untuk UMKM Indonesia
        </div>
      </footer>
    </div>
  );
}