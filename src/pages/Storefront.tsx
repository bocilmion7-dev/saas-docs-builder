import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag, Star, Clock, MapPin, Phone, CreditCard,
  Coffee, UtensilsCrossed, ShoppingCart, Wrench, Cake,
  Paintbrush, Sparkles, Car, Scissors,
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

/**
 * Detect subdomain from hostname.
 * Production: kopisenja.tokobuilder.id → "kopisenja"
 * Dev/Local: falls back to ?sub= query param or ?cat= for category
 */
function detectSubdomain(): string | null {
  const hostname = window.location.hostname;
  // Production: *.tokobuilder.id
  const parts = hostname.split(".");
  if (parts.length >= 3) return parts[0]; // subdomain.tokobuilder.id
  // Local dev: check for port-based subdomain simulation
  if (parts[0] === "localhost" || parts[0].match(/^\d/)) return null;
  return parts[0];
}

export default function Storefront() {
  const [searchParams] = useSearchParams();

  // Detect subdomain from URL, fallback to ?sub= query param
  const subdomain = useMemo(() => {
    const detected = detectSubdomain();
    return detected || searchParams.get("sub") || null;
  }, [searchParams]);

  // Category fallback for dev without subdomain
  const categoryFallback = searchParams.get("cat") ?? "cafe";

  // Fetch real tenant data from Convex
  const storefrontData = useQuery(
    api.tenants.getStorefront,
    subdomain ? { subdomain } : "skip",
  );

  const tenant = storefrontData?.tenant;
  const categories = storefrontData?.categories ?? [];
  const products = storefrontData?.products ?? [];
  const CatIcon = CATEGORY_ICONS[tenant?.category ?? categoryFallback] ?? Coffee;

  // Group products by category
  const groupedProducts = useMemo(() => {
    if (products.length === 0) return {};
    const groups: Record<string, typeof products> = { "Semua": products };
    for (const cat of categories) {
      groups[cat.name] = products.filter((p) => p.categoryId === cat._id);
    }
    return groups;
  }, [products, categories]);

  // Loading state
  if (subdomain && storefrontData === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <p className="text-sm text-muted-foreground">Memuat toko...</p>
        </div>
      </div>
    );
  }

  // Store not found
  if (subdomain && storefrontData === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🏪</div>
          <h1 className="text-2xl font-bold">Toko Tidak Ditemukan</h1>
          <p className="text-muted-foreground">Subdomain <strong>{subdomain}</strong>.tokobuilder.id tidak terdaftar.</p>
          <Button onClick={() => window.location.href = "/"}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  // No subdomain — show demo selector
  if (!subdomain) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold mb-4">TokoBuilder Storefront</h1>
          <p className="text-muted-foreground mb-8">Pilih kategori untuk melihat contoh storefront:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const Icon = CATEGORY_ICONS[key];
              return (
                <a key={key} href={`/store?cat=${key}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border/60 p-5 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                  <Icon className="size-8 text-primary" />
                  <span className="font-semibold text-sm">{label}</span>
                </a>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-8">
            Atau akses via subdomain: <code className="bg-muted px-1.5 py-0.5 rounded">kopisenja.tokobuilder.id</code>
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER STOREFRONT WITH REAL DATA
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <CatIcon className="size-3" />{CATEGORY_LABELS[tenant?.category ?? ""] ?? tenant?.category}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{tenant?.name ?? "Toko"}</h1>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Star className="size-4 text-amber-500 fill-amber-500" />4.8</span>
            <span className="flex items-center gap-1"><Clock className="size-4" />Buka 07:00-22:00</span>
            {tenant?.address && <span className="flex items-center gap-1"><MapPin className="size-4" />{tenant.address}</span>}
            {tenant?.phone && <span className="flex items-center gap-1"><Phone className="size-4" />{tenant.phone}</span>}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        <h2 className="text-xl font-bold mb-6">Menu / Produk ({products.length})</h2>
        <StorefrontProductGrid products={products} categories={categories} />
      </section>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StorefrontProductGrid({ products, categories }: { products: any[]; categories: any[] }) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cart, setCart] = useState<{ name: string; price: number; qty: number }[]>([]);

  const filtered = activeCategory === "Semua"
    ? products
    : products.filter((p) => {
        const cat = categories.find((c) => c._id === p.categoryId);
        return cat?.name === activeCategory;
      });

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === product.name);
      if (existing) return prev.map((c) => c.name === product.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { name: product.name, price: product.price, qty: 1 }];
    });
  };

  const menuCategories = ["Semua", ...categories.map((c) => c.name)];

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {menuCategories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <Card key={p._id} className="group border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all overflow-hidden">
            <div className="relative h-32 bg-muted/30 flex items-center justify-center">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <ShoppingBag className="size-10 text-muted-foreground/30 group-hover:text-primary/30 transition-colors" />
              )}
              {p.stockQuantity <= 0 && (
                <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">Habis</Badge>
              )}
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
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <ShoppingBag className="size-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada produk</p>
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 z-50">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <span className="text-sm font-medium">{cart.reduce((s, c) => s + c.qty, 0)} item</span>
            <div className="flex items-center gap-3">
              <span className="font-extrabold">{formatRp(cart.reduce((s, c) => s + c.price * c.qty, 0))}</span>
              <Button className="gap-2"><CreditCard className="size-4" /> Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


