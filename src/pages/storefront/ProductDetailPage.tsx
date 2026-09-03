import { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingBag, Minus, Plus, Star, Package, Truck, Clock } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function detectSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  if (parts.length >= 3) return parts[0];
  if (parts[0] === "localhost" || parts[0].match(/^\d/)) return null;
  return parts[0];
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subdomain = useMemo(() => detectSubdomain() || searchParams.get("sub") || null, [searchParams]);

  const storefrontData = useQuery(api.tenants.getStorefront, subdomain ? { subdomain } : "skip");
  const products = storefrontData?.products ?? [];
  const categories = storefrontData?.categories ?? [];
  const tenant = storefrontData?.tenant;

  const product = useMemo(() => products.find((p) => p.slug === slug || p._id === slug), [products, slug]);
  const category = useMemo(() => product ? categories.find((c) => c._id === product.categoryId) : null, [product, categories]);

  const [qty, setQty] = useState(1);

  if (storefrontData === undefined) {
    return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-64 w-full max-w-2xl" /></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-bold">Produk Tidak Ditemukan</h1>
          <Button onClick={() => navigate(-1)}>Kembali</Button>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p._id !== product._id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="size-4 mr-1" /> Kembali</Button>
          <span className="text-sm text-muted-foreground truncate">{tenant?.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square rounded-2xl bg-muted/30 flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="size-24 text-muted-foreground/20" />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {category && <Badge variant="secondary" className="mb-2 text-xs">{category.name}</Badge>}
              <h1 className="text-3xl font-extrabold tracking-tight">{product.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 font-mono">SKU: {product.sku}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary">{formatRp(product.price)}</span>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Package className="size-4" />
                <span>Stok: <strong className={product.stockQuantity > 0 ? "text-emerald-600" : "text-destructive"}>{product.stockQuantity > 0 ? `${product.stockQuantity} tersedia` : "Habis"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5"><Truck className="size-4" /><span>Pengiriman 1-3 hari</span></div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className="size-4 text-amber-500 fill-amber-500" />)}</div>
              <span className="text-sm text-muted-foreground">(128 ulasan)</span>
            </div>

            {/* Quantity + Add to Cart */}
            {product.stockQuantity > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Jumlah:</span>
                  <div className="flex items-center border border-border rounded-lg">
                    <Button variant="ghost" size="sm" onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 px-3"><Minus className="size-3" /></Button>
                    <span className="w-12 text-center text-sm font-bold">{qty}</span>
                    <Button variant="ghost" size="sm" onClick={() => setQty(qty + 1)} className="h-9 px-3"><Plus className="size-3" /></Button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button size="lg" className="flex-1 gap-2" onClick={() => {
                    // Store in localStorage for checkout
                    const cart = JSON.parse(localStorage.getItem("tb_storefront_cart") || "[]");
                    const existing = cart.find((c: any) => c.productId === product._id);
                    if (existing) { existing.qty += qty; } else { cart.push({ productId: product._id, name: product.name, price: product.price, qty, sku: product.sku }); }
                    localStorage.setItem("tb_storefront_cart", JSON.stringify(cart));
                    navigate(`/store/checkout?sub=${subdomain || ""}`);
                  }}>
                    <ShoppingBag className="size-4" /> Keranjang ({formatRp(product.price * qty)})
                  </Button>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              {[{ icon: Truck, label: "Gratis Ongkir", sub: "Min. Rp100K" }, { icon: Clock, label: "Garansi 7 Hari", sub: "Retur mudah" }, { icon: Package, label: "Packaging Aman", sub: "Bubble wrap" }].map((b) => (
                <div key={b.label} className="text-center">
                  <b.icon className="size-5 mx-auto text-primary" />
                  <p className="text-xs font-semibold mt-1">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">Produk Lainnya</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Card key={p._id} className="cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate(`/store/product/${p.slug}?sub=${subdomain || ""}`)}>
                  <div className="aspect-square bg-muted/30 flex items-center justify-center">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <ShoppingBag className="size-8 text-muted-foreground/30" />}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-bold line-clamp-2">{p.name}</p>
                    <p className="text-sm font-extrabold text-primary mt-1">{formatRp(p.price)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
