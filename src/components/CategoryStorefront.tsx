import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag, Star, Clock, MapPin, Phone, ArrowRight, Coffee, UtensilsCrossed,
  ShoppingCart, Wrench, Cake, Paintbrush, Sparkles, Car, Scissors, Search,
  CalendarDays, Users, Heart, Bed, Truck, CreditCard, Shirt,
} from "lucide-react";

// ─── Category Configs ───────────────────────────────────────────────────────

const categoryConfigs: Record<string, {
  name: string; icon: any; tagline: string;
  menuCategories: string[];
  sampleProducts: { name: string; price: number; emoji: string; category: string; desc: string }[];
  extraSections?: string[];
}> = {
  cafe: {
    name: "Kopi Senja", icon: Coffee, tagline: "Nikmati kopi premium suasana nyaman",
    menuCategories: ["Semua", "Coffee", "Non-Coffee", "Food"],
    sampleProducts: [
      { name: "Kopi Susu Gula Aren", price: 28000, emoji: "☕", category: "Coffee", desc: "Espresso single shot + susu full cream + gula aren" },
      { name: "Es Teh Manis", price: 15000, emoji: "🧋", category: "Non-Coffee", desc: "Teh pilihan manis segar" },
      { name: "Cappuccino Hot", price: 32000, emoji: "☕", category: "Coffee", desc: "Double shot + steamed milk foam" },
      { name: "Nasi Goreng Spesial", price: 35000, emoji: "🍚", category: "Food", desc: "Nasi goreng ayam telur kerupuk" },
      { name: "Croissant Butter", price: 22000, emoji: "🥐", category: "Food", desc: "Croissant mentega segar" },
      { name: "Matcha Latte", price: 35000, emoji: "🍵", category: "Non-Coffee", desc: "Matcha premium oat milk" },
      { name: "Chicken Katsu", price: 42000, emoji: "🍗", category: "Food", desc: "Katsu ayam crispy + nasi + salad" },
      { name: "Americano", price: 25000, emoji: "☕", category: "Coffee", desc: "Double shot espresso + hot water" },
    ],
    extraSections: ["Meja Number input", "Dine-in / Takeaway / Delivery"],
  },
  restoran: {
    name: "Ayam Goreng Mantap", icon: UtensilsCrossed, tagline: "Ayam goreng resep turun temurun",
    menuCategories: ["Semua", "Makanan", "Minuman", "Pendamping"],
    sampleProducts: [
      { name: "Ayam Goreng Original", price: 35000, emoji: "🍗", category: "Makanan", desc: "Ayam goreng renyah resep rahasia" },
      { name: "Nasi Putih", price: 5000, emoji: "🍚", category: "Pendamping", desc: "Nasi putih pulen" },
      { name: "Es Jeruk Segar", price: 12000, emoji: "🍊", category: "Minuman", desc: "Jeruk peras segar" },
      { name: "Sambal Extra", price: 3000, emoji: "🌶️", category: "Pendamping", desc: "Sambal ulek pedas" },
      { name: "Ayam Bakar Madu", price: 38000, emoji: "🍗", category: "Makanan", desc: "Ayam bakar madu + nasi + lalapan" },
      { name: "Es Teh Tawar", price: 8000, emoji: "🧋", category: "Minuman", desc: "Es teh tawar segar" },
    ],
    extraSections: ["Reservasi Meja", "Table Layout Visual"],
  },
  toko_retail: {
    name: "Minimart Jaya", icon: ShoppingCart, tagline: "Kebutuhan sehari-hari lengkap",
    menuCategories: ["Semua", "Makanan", "Minuman", "Kebutuhan Rumah"],
    sampleProducts: [
      { name: "Beras Premium 5kg", price: 65000, emoji: "🌾", category: "Makanan", desc: "Beras pulen premium" },
      { name: "Minyak Goreng 2L", price: 38000, emoji: "🫒", category: "Makanan", desc: "Minyak goreng sawit" },
      { name: "Sabun Mandi", price: 12000, emoji: "🧼", category: "Kebutuhan Rumah", desc: "Sabun mandi wangi" },
      { name: "Air Mineral", price: 4000, emoji: "💧", category: "Minuman", desc: "Air mineral 600ml" },
    ],
    extraSections: ["SKU/Barcode", "Kurir Pengiriman"],
  },
  bakery: {
    name: "Roti Enak", icon: Cake, tagline: "Roti & kue segar setiap hari",
    menuCategories: ["Semua", "Roti", "Kue", "Pastry"],
    sampleProducts: [
      { name: "Roti Tawar 400gr", price: 18000, emoji: "🍞", category: "Roti", desc: "Roti tawar lembut" },
      { name: "Croissant Butter", price: 22000, emoji: "🥐", category: "Pastry", desc: "Croissant mentega renyah" },
      { name: "Kue Lapis", price: 35000, emoji: "🍰", category: "Kue", desc: "Kue lapis legit" },
      { name: "Donat Kampung", price: 8000, emoji: "🍩", category: "Roti", desc: "Donat kampung manis" },
      { name: "Custom Cake Ultah", price: 350000, emoji: "🎂", category: "Kue", desc: "Pesanan custom H-3, deposit 50%" },
      { name: "Day-Old Bread", price: 10000, emoji: "🍞", category: "Roti", desc: "Diskon 50% setelah jam 20:00" },
    ],
    extraSections: ["Custom Cake Form", "Day-Old Section", "Display Counter Chiller"],
  },
  toko_cat: {
    name: "Jaya Cat", icon: Paintbrush, tagline: "Cat & warna profesional",
    menuCategories: ["Semua", "Cat Tembok", "Cat Kayu", "Thinner"],
    sampleProducts: [
      { name: "Cat Tembok Putih 5L", price: 185000, emoji: "🎨", category: "Cat Tembok", desc: "Nippon Paint, daya sebar 11m²/L" },
      { name: "Thinner A Special 5L", price: 85000, emoji: "🧪", category: "Thinner", desc: "Thinner untuk cat kayu/besi" },
      { name: "Cat Kayu Brown 1L", price: 65000, emoji: "🎨", category: "Cat Kayu", desc: "Cat kayu water-based" },
    ],
    extraSections: ["Color Visualizer", "Volume Calculator", "Katalog Warna Fan Deck"],
  },
  spa: {
    name: "Luxury Spa Bali", icon: Sparkles, tagline: "Relaksasi & kesejahteraan",
    menuCategories: ["Semua", "Massage", "Facial", "Body Treatment"],
    sampleProducts: [
      { name: "Bali Massage 60m", price: 250000, emoji: "💆", category: "Massage", desc: "Traditional Bali massage" },
      { name: "Thai Massage 90m", price: 350000, emoji: "💆", category: "Massage", desc: "Thai stretching massage" },
      { name: "Facial Treatment 60m", price: 200000, emoji: "✨", category: "Facial", desc: "Deep cleansing facial" },
      { name: "Body Scrub 60m", price: 180000, emoji: "🧴", category: "Body Treatment", desc: "Lulur traditional" },
    ],
    extraSections: ["Booking Calendar", "Therapist List", "Membership", "Day Pass"],
  },
  bengkel: {
    name: "Bengkel Jaya", icon: Wrench, tagline: "Servis kendaraan terpercaya",
    menuCategories: ["Semua", "Servis Ringan", "Servis Sedang", "Servis Berat"],
    sampleProducts: [
      { name: "Ganti Oli", price: 150000, emoji: "🔧", category: "Servis Ringan", desc: "Ganti oli mesin + filter" },
      { name: "Tune Up", price: 350000, emoji: "🔧", category: "Servis Sedang", desc: "Tune up + ganti busi + filter udara" },
      { name: "Overhaul Mesin", price: 5000000, emoji: "🔧", category: "Servis Berat", desc: "Turun mesin total" },
    ],
    extraSections: ["Vehicle History Lookup", "Booking Slot Mekanik"],
  },
  toko_sparepart: {
    name: "Sparepart Murah", icon: Car, tagline: "Part OEM & aftermarket lengkap",
    menuCategories: ["Semua", "Mesin", "Kelistrikan", "Rem"],
    sampleProducts: [
      { name: "Kampas Rem Depan Avanza", price: 185000, emoji: "🔧", category: "Rem", desc: "OEM Toyota, garansi 6 bulan" },
      { name: "Oli Mesin 5W-30 4L", price: 285000, emoji: "🛢️", category: "Mesin", desc: "Oli mesin sintetik" },
      { name: "Filter Udara Avanza", price: 65000, emoji: "🔧", category: "Mesin", desc: "Filter udara original" },
    ],
    extraSections: ["VIN Lookup", "Cross-Reference NGK/Denso/Bosch", "Bin Location A1-02"],
  },
  toko_kain: {
    name: "Kain Batik Jaya", icon: Scissors, tagline: "Kain berkualitas grosir & eceran",
    menuCategories: ["Semua", "Katun", "Batik", "Denim"],
    sampleProducts: [
      { name: "Kain Katun Putih 115cm", price: 25000, emoji: "🧵", category: "Katun", desc: "Lebar 115cm, gramasi 150 GSM" },
      { name: "Kain Batik Parang 150cm", price: 45000, emoji: "🧣", category: "Batik", desc: "Batik tulis, lebar 150cm" },
      { name: "Kain Denim Biru 150cm", price: 55000, emoji: "👖", category: "Denim", desc: "Denim premium, gramasi 320 GSM" },
    ],
    extraSections: ["Roll Remaining Info", "Calculator Kebutuhan Meter", "Remnants Diskon Section", "Konveksi B2B Form"],
  },
  toko_pakaian: {
    name: "Fashion Jaya", icon: Shirt, tagline: "Gaya terbaik setiap hari — koleksi atasan, bawahan, outerwear & dress",
    menuCategories: ["Semua", "Atasan", "Bawahan", "Outerwear", "Dress"],
    sampleProducts: [
      { name: "Kemeja Oxford Polos (M, Putih)", price: 149000, emoji: "👔", category: "Atasan", desc: "Oxford cotton 100%, jahitan rapi — size S–XL" },
      { name: "Celana Chino Slim Fit (32, Hitam)", price: 179000, emoji: "👖", category: "Bawahan", desc: "Chino stretch premium, nyaman seharian" },
      { name: "Denim Jacket Vintage (L, Biru)", price: 259000, emoji: "🧥", category: "Outerwear", desc: "Denim 12oz washed, klasik abadi" },
    ],
    extraSections: ["Panduan Ukuran (XS–XXL)", "SKU Matrix Size × Warna", "Size Exchange 7–14 hari", "Cek Ongkir JNE/J&T/SiCepat"],
  },
};

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

// ─── Component ──────────────────────────────────────────────────────────────

interface Props { category: string; }

export default function CategoryStorefront({ category }: Props) {
  const config = categoryConfigs[category] ?? categoryConfigs.cafe;
  const CatIcon = config.icon;
  const [activeCategory, setActiveCategory] = useState(config.menuCategories[0]);
  const [cart, setCart] = useState<{ name: string; price: number; qty: number }[]>([]);

  const filtered = activeCategory === "Semua"
    ? config.sampleProducts
    : config.sampleProducts.filter((p) => p.category === activeCategory);

  const addToCart = (product: typeof config.sampleProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === product.name);
      if (existing) return prev.map((c) => c.name === product.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { name: product.name, price: product.price, qty: 1 }];
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <CatIcon className="size-3" />{category.replace(/_/g, " ").toUpperCase()}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{config.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">{config.tagline}</p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="size-4 text-amber-500 fill-amber-500" />4.8</span>
            <span className="flex items-center gap-1"><Clock className="size-4" />Buka 07:00-22:00</span>
            <span className="flex items-center gap-1"><MapPin className="size-4" />Jakarta</span>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {config.menuCategories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        <h2 className="text-xl font-bold mb-6">Menu / Produk</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <Card key={i} className="group border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden">
              <div className="relative h-32 bg-muted/30 flex items-center justify-center">
                <span className="text-5xl group-hover:scale-110 transition-transform">{p.emoji}</span>
              </div>
              <CardContent className="p-4">
                <h3 className="text-sm font-bold leading-tight">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-extrabold text-primary">{formatRp(p.price)}</span>
                  <button onClick={() => addToCart(p)}
                    className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <ShoppingBag className="size-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Extra Sections per Category */}
      {config.extraSections && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
          <div className="flex flex-wrap gap-2">
            {config.extraSections.map((s) => (
              <Badge key={s} variant="secondary" className="px-3 py-1.5 text-xs">{s}</Badge>
            ))}
          </div>
        </section>
      )}

      {/* Checkout CTA */}
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
