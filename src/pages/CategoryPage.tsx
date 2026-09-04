import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Search, Store, ChevronRight, ChevronLeft, Heart, ShoppingBag,
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

export default function CategoryPage() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const cat = category ?? "toko_retail";
  const meta = CATEGORY_META[cat] ?? CATEGORY_META.toko_retail;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const data = useQuery(api.marketplace.categoryProducts, {
    category: cat,
    search: search || undefined,
    page,
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const [liked, setLiked] = useState<Set<string>>(new Set());

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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm">TB</div>
            <div className="leading-tight text-left">
              <p className="font-extrabold text-sm">TokoBuilder<span className="text-primary">.id</span></p>
            </div>
          </button>
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={`Cari di ${meta.label}...`}
              className="pl-9 rounded-full bg-muted/60 border-transparent focus:bg-background"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <h1 className="text-xl lg:text-2xl font-extrabold">{meta.label}</h1>
              <p className="text-sm text-muted-foreground">{total} produk dari semua toko</p>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={`Cari di ${meta.label}...`}
              className="pl-9 rounded-full bg-muted/60"
            />
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">{meta.emoji}</div>
            <p className="font-semibold">Belum ada produk di kategori ini</p>
            <p className="text-sm text-muted-foreground">Produk akan muncul setelah toko mengunggahnya</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>Kembali ke Marketplace</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
            {products.map((p: any) => {
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Selanjutnya <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}