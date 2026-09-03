import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, ShoppingBag, SlidersHorizontal } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function detectSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length >= 3) return parts[0];
  if (parts[0] === "localhost" || parts[0].match(/^\d/)) return null;
  return parts[0];
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subdomain = useMemo(() => detectSubdomain() || searchParams.get("sub") || null, [searchParams]);
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  const storefrontData = useQuery(api.tenants.getStorefront, subdomain ? { subdomain } : "skip");
  const tenant = storefrontData?.tenant;
  const products = storefrontData?.products ?? [];
  const categories = storefrontData?.categories ?? [];

  const filtered = useMemo(() => {
    let results = products;
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "Semua") {
      const catObj = categories.find((c) => c.name === categoryFilter);
      if (catObj) results = results.filter((p) => p.categoryId === catObj._id);
    }
    return results;
  }, [products, categories, query, categoryFilter]);

  if (storefrontData === undefined) {
    return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-64 w-full max-w-2xl" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="size-4" /></Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk, SKU, atau deskripsi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">{filtered.length} hasil</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {["Semua", ...categories.map((c) => c.name)].map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="size-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-semibold">Tidak ada hasil untuk "{query}"</p>
            <p className="text-sm text-muted-foreground mt-1">Coba kata kunci lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => {
              const catObj = categories.find((c) => c._id === p.categoryId);
              return (
                <Card key={p._id} className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all overflow-hidden"
                  onClick={() => navigate(`/store/product/${p.slug}?sub=${subdomain || ""}`)}>
                  <div className="relative h-32 bg-muted/30 flex items-center justify-center">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <ShoppingBag className="size-10 text-muted-foreground/30" />}
                    {p.stockQuantity <= 0 && <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">Habis</Badge>}
                  </div>
                  <CardContent className="p-3">
                    {catObj && <Badge variant="secondary" className="text-[10px] mb-1">{catObj.name}</Badge>}
                    <p className="text-sm font-bold line-clamp-2">{p.name}</p>
                    <p className="text-base font-extrabold text-primary mt-1">{formatRp(p.price)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
