import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Star,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Coffee,
  UtensilsCrossed,
  ShoppingCart,
  Wrench,
  Cake,
  Paintbrush,
  Sparkles,
  Car,
  Scissors,
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  cafe: Coffee,
  restoran: UtensilsCrossed,
  toko_retail: ShoppingCart,
  bengkel: Wrench,
  bakery: Cake,
  toko_cat: Paintbrush,
  spa: Sparkles,
  toko_sparepart: Car,
  toko_kain: Scissors,
};

const demoProducts = [
  { name: "Kopi Susu Gula Aren", price: 28000, emoji: "☕", category: "Coffee", rating: 4.8, sold: 324 },
  { name: "Es Teh Manis", price: 15000, emoji: "🧋", category: "Non-Coffee", rating: 4.6, sold: 256 },
  { name: "Cappuccino Hot", price: 32000, emoji: "☕", category: "Coffee", rating: 4.9, sold: 189 },
  { name: "Nasi Goreng Spesial", price: 35000, emoji: "🍚", category: "Food", rating: 4.7, sold: 145 },
  { name: "Chicken Katsu", price: 42000, emoji: "🍗", category: "Food", rating: 4.5, sold: 98 },
  { name: "Croissant Butter", price: 22000, emoji: "🥐", category: "Food", rating: 4.4, sold: 167 },
  { name: "Matcha Latte", price: 35000, emoji: "🍵", category: "Non-Coffee", rating: 4.8, sold: 203 },
  { name: "Americano", price: 25000, emoji: "☕", category: "Coffee", rating: 4.3, sold: 278 },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function Storefront() {
  // In production, subdomain would be extracted from host
  const storeName = "Kopi Senja";
  const category = "cafe";
  const CatIcon = categoryIcons[category] ?? Coffee;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CatIcon className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">{storeName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">3</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 sm:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <CatIcon className="size-3" />
            {category.replace("_", " ").toUpperCase()}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {storeName}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Nikmati kopi premium dan hidangan lezat suasana nyaman.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Star className="size-4 text-amber-500 fill-amber-500" /> 4.8 (256 ulasan)</span>
            <span className="flex items-center gap-1.5"><Clock className="size-4" /> Buka 07:00 - 22:00</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-4" /> Jakarta Selatan</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["Semua", "Coffee", "Non-Coffee", "Food"].map((cat, i) => (
            <button
              key={cat}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <h2 className="text-xl font-bold mb-6">Menu Populer</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {demoProducts.map((p, i) => (
            <Card key={i} className="group border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden">
              <div className="relative h-36 bg-muted/30 flex items-center justify-center">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{p.emoji}</span>
                <Badge variant="secondary" className="absolute top-2 left-2 text-[10px]">{p.category}</Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="text-sm font-bold leading-tight">{p.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 text-amber-500 fill-amber-500" />
                  {p.rating}
                  <span className="mx-0.5">·</span>
                  {p.sold} terjual
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-extrabold text-primary">{formatRp(p.price)}</span>
                  <button className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <ShoppingBag className="size-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-extrabold">Pesan Sekarang</h2>
          <p className="mt-2 text-muted-foreground">Order langsung dari toko online kami</p>
          <Button className="mt-6 gap-2" size="lg">
            Mulai Pesan
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 {storeName}. Powered by <span className="font-bold text-primary">TokoBuilder.id</span></p>
        </div>
      </footer>
    </div>
  );
}
