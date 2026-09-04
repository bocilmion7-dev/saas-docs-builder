import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ShoppingBag, Store, ArrowRight, Sparkles, Truck, ShieldCheck,
  CreditCard, ChevronRight, MapPin, LayoutGrid, Heart, Clock, Zap, Star,
  Package, RotateCcw, Headphones, Gift, Percent, Users, TrendingUp,
  CheckCircle, ShoppingBasket,
} from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const CATEGORY_META: Record<string, { label: string; emoji: string; gradient: string; bg: string }> = {
  cafe: { label: "Cafe & Kopi", emoji: "☕", gradient: "from-amber-500/20 to-orange-500/5", bg: "bg-amber-50 hover:bg-amber-100" },
  restoran: { label: "Restoran", emoji: "🍜", gradient: "from-red-500/20 to-rose-500/5", bg: "bg-red-50 hover:bg-red-100" },
  toko_retail: { label: "Retail & Fashion", emoji: "🛍️", gradient: "from-emerald-500/20 to-teal-500/5", bg: "bg-emerald-50 hover:bg-emerald-100" },
  bakery: { label: "Bakery & Roti", emoji: "🍞", gradient: "from-pink-500/20 to-rose-500/5", bg: "bg-pink-50 hover:bg-pink-100" },
  toko_cat: { label: "Toko Cat & Palet", emoji: "🎨", gradient: "from-blue-500/20 to-indigo-500/5", bg: "bg-blue-50 hover:bg-blue-100" },
  spa: { label: "Spa & Wellness", emoji: "💆", gradient: "from-green-500/20 to-emerald-500/5", bg: "bg-green-50 hover:bg-green-100" },
  bengkel: { label: "Bengkel & Servis", emoji: "🔧", gradient: "from-slate-500/20 to-gray-500/5", bg: "bg-slate-50 hover:bg-slate-100" },
  toko_sparepart: { label: "Sparepart & Part", emoji: "🚗", gradient: "from-cyan-500/20 to-sky-500/5", bg: "bg-cyan-50 hover:bg-cyan-100" },
  toko_kain: { label: "Kain & Textile", emoji: "🧵", gradient: "from-purple-500/20 to-violet-500/5", bg: "bg-purple-50 hover:bg-purple-100" },
  toko_pakaian: { label: "Toko Pakaian", emoji: "👕", gradient: "from-fuchsia-500/20 to-pink-500/5", bg: "bg-fuchsia-50 hover:bg-fuchsia-100" },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_META);

const HOW_IT_WORKS = [
  { step: "1", icon: Search, title: "Cari & Pilih", desc: "Temukan produk dari ribuan toko UMKM terpercaya di seluruh Indonesia" },
  { step: "2", icon: ShoppingBasket, title: "Pesan & Bayar", desc: "Checkout mudah, bayar via QRIS, Transfer Bank, atau E-Wallet tanpa ribet" },
  { step: "3", icon: Truck, title: "Dikirim & Sampai", desc: "Pengiriman cepat via JNE, J&T, SiCepat langsung ke alamat Anda" },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "100% Aman", desc: "Pembayaran terenkripsi, uang Anda aman sampai pesanan dikirim" },
  { icon: Truck, title: "Pengiriman Cepat", desc: "Jangkauan ke seluruh Indonesia, lacak pengiriman secara real-time" },
  { icon: RotateCcw, title: "Garansi Retur", desc: "Produk cacat atau tidak sesuai? Retur gratis dalam 7 hari" },
  { icon: Headphones, title: "Bantuan 24/7", desc: "Tim support siap membantu Anda kapan saja, chat langsung dengan penjual" },
  { icon: Percent, title: "Promo Menarik", desc: "Diskon harian, voucher eksklusif, dan cashback dari toko favorit" },
  { icon: Gift, title: "Gratis Ongkir", desc: "Gratis ongkir dari berbagai toko, buruan klaim sebelum kehabisan!" },
];

const TESTIMONIALS = [
  { name: "Rina", role: "Ibu Rumah Tangga", review: "Beli bahan kue di sini hemat banyak! Ongkir murah, barang sampai dengan aman. Sangat recommended untuk yang mau belanja kebutuhan sehari-hari.", rating: 5 },
  { name: "Budi", role: "Mekanik", review: "Sparepart langganan saya cari di sini selalu ready. Harga juga lebih bersahabat dari marketplace lain. Top!", rating: 5 },
  { name: "Anisa", role: "Penggemar Fashion", review: "Koleksi fashion-nya variatif, dari casual sampai formal ada. Pelayanan dari penjual juga ramah. Pasti balik lagi beli di sini!", rating: 4 },
  { name: "Tono", role: "Pemilik Bengkel", review: "Pengadaan sparepart untuk bengkel jadi lebih gampang. Bisa beli langsung dari supplier, harga grosir pula. Terima kasih TokoBuilder!", rating: 5 },
];

export default function MarketplaceLanding() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

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
            <button onClick={() => document.getElementById("cara-beli")?.scrollIntoView({ behavior: "smooth" })} className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-colors">Cara Beli</button>
            <button onClick={() => document.getElementById("keunggulan")?.scrollIntoView({ behavior: "smooth" })} className="px-3 py-2 rounded-lg hover:bg-muted hover:text-foreground transition-colors">Keunggulan</button>
          </div>

          <div className="hidden md:flex flex-1 max-w-md ml-auto items-center relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk, toko, atau kategori…"
              className="pl-9 rounded-full bg-muted/60 border-transparent focus:bg-background"
            />
          </div>

          <div className="ml-auto md:ml-0 flex items-center gap-2">
            <button onClick={() => navigate("/auth")} className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Masuk</button>
            <Button size="sm" className="rounded-full" onClick={() => navigate("/auth")}>
              <Store className="h-4 w-4 mr-1" /> Buka Toko
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
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="outline" className="mb-4 rounded-full bg-background/70 text-xs py-1 px-3">
                <Sparkles className="h-3 w-3 mr-1 text-primary" /> {stats?.totalStores ?? "…"} UMKM Aktif
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Belanja langsung dari{" "}
                <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">UMKM terbaik</span>{" "}
                di Indonesia 🇮🇩
              </h1>
              <p className="mt-4 text-muted-foreground text-base lg:text-lg">
                Temukan ribuan produk dari ribuan toko UMKM terpercaya — kopi, makanan, sparepart, fashion, dan masih banyak lagi.
                Belanja aman, bayar mudah, pengiriman cepat ke seluruh Indonesia.
              </p>
              <div className="mt-8 grid grid-cols-3 max-w-sm gap-4">
                {[
                  { label: "Toko", value: stats?.totalStores ?? 0, icon: Store },
                  { label: "Produk", value: stats?.totalProducts ?? 0, icon: Package },
                  { label: "Kategori", value: stats?.totalCategories ?? 0, icon: LayoutGrid },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <s.icon className="h-5 w-5 mx-auto text-primary" />
                    <p className="text-2xl font-extrabold mt-1">{s.value.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-amber-50/50 rounded-3xl -m-6" />
              <div className="relative grid grid-cols-2 gap-4">
                {products.slice(0, 4).map((p: any) => {
                  const meta = CATEGORY_META[p.storeCategory] ?? CATEGORY_META.toko_retail;
                  return (
                    <div key={p._id} onClick={() => goProduct(p)} className={`cursor-pointer rounded-2xl p-4 ${meta.bg} transition-all hover:shadow-lg hover:-translate-y-1`}>
                      <div className="text-3xl mb-2">{meta.emoji}</div>
                      <p className="text-sm font-bold line-clamp-2 min-h-[2rem]">{p.name}</p>
                      <p className="text-sm font-extrabold text-primary mt-1">{formatRp(p.price)}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">{p.storeName}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────── */}
      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> Ongkir via JNE/J&T/SiCepat</span>
          <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-primary" /> Bayar QRIS & Transfer</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Perlindungan Pembeli 100%</span>
          <span className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4 text-primary" /> Retur Gratis 7 Hari</span>
        </div>
      </section>

      {/* ── CATEGORY SHOWCASE ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <Badge variant="outline" className="rounded-full mb-3">Jelajahi Berdasarkan Kategori</Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Ribuan Produk, 10 Kategori</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">Temukan kebutuhan Anda dari berbagai kategori usaha lokal Indonesia</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORY_ORDER.map((key) => {
            const meta = CATEGORY_META[key];
            return (
              <button
                key={key}
                onClick={() => { setActiveCat(key); document.getElementById("produk")?.scrollIntoView({ behavior: "smooth" }); }}
                className={`group rounded-2xl border p-5 text-center transition-all hover:shadow-lg hover:-translate-y-1 ${meta.bg} border-border/60`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{meta.emoji}</div>
                <p className="text-sm font-bold">{meta.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="cara-beli" className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="rounded-full mb-3">Mudah & Cepat</Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Cara Belanja di TokoBuilder</h2>
          <p className="text-sm text-muted-foreground mt-2">Hanya 3 langkah untuk mendapatkan produk impian Anda</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="mx-auto size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 lg:right-auto lg:-top-2 lg:left-1/2 lg:translate-x-8 size-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {item.step}
              </div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORY CHIPS ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-extrabold">
            {activeCat ? `${CATEGORY_META[activeCat]?.emoji} ${CATEGORY_META[activeCat]?.label}` : "🛍️ Semua Produk"}
          </h2>
          {activeCat && (
            <Button variant="ghost" size="sm" onClick={() => setActiveCat(null)}>✕ Hapus Filter</Button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-1 px-1">
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
        {products.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🔍</div>
            <p className="font-semibold">Produk tidak ditemukan</p>
            <p className="text-sm text-muted-foreground">Coba kata kunci lain atau kategori berbeda</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setActiveCat(null); }}>Reset Pencarian</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">{products.length} produk dari {stores.length} toko</p>
              {search && (
                <Button variant="ghost" size="sm" onClick={() => setSearch("")}>✕ Hapus pencarian</Button>
              )}
            </div>
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
          </>
        )}
      </section>

      {/* ── STORES SECTION ─────────────────────────────────── */}
      {!activeCat && !search && stores.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl lg:text-2xl font-extrabold">🏪 Toko Favorit</h2>
              <p className="text-sm text-muted-foreground">Temukan toko terbaik berdasarkan kategori usaha</p>
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

      {/* ── BENEFITS ───────────────────────────────────────── */}
      <section id="keunggulan" className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="rounded-full mb-3">Kenapa Belanja di Sini?</Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Keunggulan TokoBuilder Marketplace</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-4 p-5 rounded-2xl border border-border/60 bg-card hover:shadow-md transition-all">
              <div className="size-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold">{b.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 bg-muted/30 rounded-3xl mx-4 sm:mx-6 mb-12">
        <div className="text-center mb-10">
          <Badge variant="outline" className="rounded-full mb-3">Apa Kata Mereka?</Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Testimoni Pembeli</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl bg-card border p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.review}"</p>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-amber-50 border border-primary/20 p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full mb-3">
                <Gift className="h-3 w-3 mr-1" /> Promo Khusus
              </Badge>
              <h2 className="text-2xl lg:text-3xl font-extrabold">Dapatkan Voucher & Promo Eksklusif! 🎁</h2>
              <p className="text-muted-foreground mt-2">
                Daftarkan email Anda untuk mendapatkan voucher diskon, info promo terbaru, dan penawaran spesial langsung ke inbox Anda.
              </p>
            </div>
            <div>
              {subscribed ? (
                <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                  <p className="font-bold mt-3">Berhasil Berlangganan! 🎉</p>
                  <p className="text-sm text-muted-foreground mt-1">Voucher dan info promo akan dikirim ke email Anda.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-full bg-background/80"
                    required
                  />
                  <Button type="submit" className="rounded-full px-6">Berlangganan</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

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
              Punya bisnis? Jualan online di TokoBuilder sekarang juga.
            </h2>
            <p className="mt-3 text-primary-foreground/85">
              Buat toko online dalam 3 langkah mudah — pilih kategori, pilih template, isi info toko.
              Dashboard lengkap: POS, stok, laporan, hingga pembayaran Midtrans otomatis.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" className="rounded-full px-7" onClick={() => navigate("/auth")}>
                Buka Toko Gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-7 border-white/40 text-primary-foreground hover:bg-white/10" onClick={() => navigate("/platform-landing")}>
                Pelajari Lebih Lanjut
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-primary-foreground/80">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> 10 kategori bisnis</span>
              <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> 30 template siap pakai</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Subdomain toko sendiri</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Laporan real-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-[10px]">TB</div>
              <p className="font-extrabold">TokoBuilder<span className="text-primary">.id</span></p>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Marketplace UMKM Indonesia — belanja langsung dari toko online terpercaya yang dibangun di platform TokoBuilder.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {["🖥️", "📱", "💬"].map((icon, i) => (
                <div key={i} className="size-8 rounded-full bg-muted flex items-center justify-center text-sm hover:bg-primary/10 cursor-pointer transition-colors">{icon}</div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Kategori Populer</p>
            <div className="space-y-2">
              {CATEGORY_ORDER.slice(0, 6).map((k) => (
                <button key={k} onClick={() => { setActiveCat(k); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-sm text-muted-foreground hover:text-primary block">
                  {CATEGORY_META[k].emoji} {CATEGORY_META[k].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Tentang</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <button onClick={() => navigate("/platform-landing")} className="hover:text-primary block">Tentang TokoBuilder</button>
              <button onClick={() => navigate("/auth")} className="hover:text-primary block">Buka Toko Gratis</button>
              <button onClick={() => navigate("/auth")} className="hover:text-primary block">Masuk / Daftar</button>
              <button onClick={() => document.getElementById("keunggulan")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-primary block">Keunggulan Marketplace</button>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Bantuan</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <span className="block">📧 support@tokobuilder.id</span>
              <span className="block">📞 0812-3456-7890</span>
              <span className="block">💬 Chat WhatsApp Kami</span>
              <span className="block">📋 Syarat & Ketentuan</span>
            </div>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TokoBuilder.id — Platform SaaS & Marketplace untuk UMKM Indonesia 🇮🇩
        </div>
      </footer>
    </div>
  );
}