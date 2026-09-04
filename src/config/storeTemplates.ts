/**
 * Katalog template storefront per kategori (10 kategori × 3 template = 30).
 * Dipakai wizard "Buat Toko" di dashboard & registrasi.
 * previewData → mock mini storefront agar tampilan template sesuai preview.
 */
export interface StoreTemplate {
  name: string;
  slug: string;
  desc: string;
  color: string; // warna dominan template
  accent?: string;
}

export const STORE_TEMPLATES: Record<string, StoreTemplate[]> = {
  cafe: [
    { name: "Minimalist Coffee", slug: "cafe-modern", desc: "Dark, modern, clean lines", color: "#1a1a2e", accent: "#e0a458" },
    { name: "Warm Bakery", slug: "cafe-classic", desc: "Cream, warm, friendly", color: "#f5e6d3", accent: "#a9754f" },
    { name: "Premium Lounge", slug: "cafe-minimalist", desc: "Elegant, dark wood", color: "#2d1b0e", accent: "#c9a227" },
  ],
  restoran: [
    { name: "Minimal Resto", slug: "resto-modern", desc: "Clean, professional", color: "#ffffff", accent: "#2b6cb0" },
    { name: "Family Feast", slug: "resto-family", desc: "Warm, inviting, family-friendly", color: "#ff8c42", accent: "#7c2d12" },
    { name: "Premium Dining", slug: "resto-premium", desc: "Luxury, fine dining", color: "#1a1a2e", accent: "#c9a227" },
  ],
  toko_retail: [
    { name: "Minimal Store", slug: "retail-minimal", desc: "Clean grid layout", color: "#ffffff", accent: "#111827" },
    { name: "Supermarket", slug: "retail-supermarket", desc: "Grid heavy, category-focused", color: "#00a651", accent: "#ffffff" },
    { name: "Fashion Boutique", slug: "retail-fashion", desc: "Visual, image-forward", color: "#e91e63", accent: "#ffffff" },
  ],
  bakery: [
    { name: "Sweet Morning", slug: "bakery-sweet", desc: "Pastel, playful", color: "#ffb6c1", accent: "#9d174d" },
    { name: "Artisan Bread", slug: "bakery-artisan", desc: "Rustic, natural", color: "#8b6914", accent: "#f5e6d3" },
    { name: "Custom Cake Studio", slug: "bakery-cake", desc: "Elegant, photo showcase", color: "#fff0f5", accent: "#db2777" },
  ],
  toko_cat: [
    { name: "Color Studio", slug: "cat-studio", desc: "Visualizer, interactive", color: "#4a90d9", accent: "#ffffff" },
    { name: "Industrial Paint", slug: "cat-industrial", desc: "Catalog heavy, professional", color: "#333333", accent: "#f59e0b" },
    { name: "Contractor Pro", slug: "cat-contractor", desc: "Project gallery", color: "#f57c00", accent: "#ffffff" },
  ],
  spa: [
    { name: "Luxury Zen", slug: "spa-luxury", desc: "Minimalist, bamboo", color: "#8fbc8f", accent: "#1c4532" },
    { name: "Bali Retreat", slug: "spa-bali", desc: "Tropical, warm", color: "#228b22", accent: "#fef9c3" },
    { name: "Modern Wellness", slug: "spa-modern", desc: "Clean, health-focused", color: "#e0f2f1", accent: "#0f766e" },
  ],
  bengkel: [
    { name: "Auto Service Pro", slug: "bengkel-pro", desc: "Professional, trustworthy", color: "#1565c0", accent: "#ffffff" },
    { name: "Quick Fix", slug: "bengkel-quick", desc: "Fast, efficient", color: "#ff6f00", accent: "#ffffff" },
    { name: "Premium Garage", slug: "bengkel-premium", desc: "High-end, detailed", color: "#212121", accent: "#ffb300" },
  ],
  toko_sparepart: [
    { name: "Part Finder", slug: "sparepart-finder", desc: "VIN search, compatibility", color: "#37474f", accent: "#29b6f6" },
    { name: "Garage Store", slug: "sparepart-garage", desc: "Workshop feel", color: "#455a64", accent: "#ffca28" },
    { name: "OEM Catalog", slug: "sparepart-oem", desc: "Clean catalog layout", color: "#ffffff", accent: "#37474f" },
  ],
  toko_kain: [
    { name: "Batik Gallery", slug: "kain-batik", desc: "Motif gallery, rich colors", color: "#5d4037", accent: "#ffcc80" },
    { name: "Textile Wholesale", slug: "kain-wholesale", desc: "Roll management, bulk", color: "#795548", accent: "#ffffff" },
    { name: "Fashion Fabric", slug: "kain-fashion", desc: "Modern, fabric-focused", color: "#ff7043", accent: "#ffffff" },
  ],
  toko_pakaian: [
    { name: "Atelier Modest", slug: "pakaian-klasik", desc: "Elegant, editorial fashion", color: "#18181b", accent: "#e4d5c0" },
    { name: "Urban Street", slug: "pakaian-casual", desc: "Bold, streetwear energy", color: "#1e3a8a", accent: "#facc15" },
    { name: "Boutique Chic", slug: "pakaian-boutique", desc: "Soft tones, boutique feel", color: "#be185d", accent: "#fdf2f8" },
  ],
};

// Data produk mini untuk preview storefront per kategori
export const TEMPLATE_PREVIEW_PRODUCTS: Record<string, { emoji: string; name: string; price: number }[]> = {
  cafe: [
    { emoji: "☕", name: "Kopi Susu", price: 28000 },
    { emoji: "🍵", name: "Matcha Latte", price: 35000 },
    { emoji: "🥐", name: "Croissant", price: 22000 },
    { emoji: "🍰", name: "Cheesecake", price: 42000 },
    { emoji: "🍹", name: "Es Teh", price: 15000 },
    { emoji: "🍚", name: "Nasi Goreng", price: 35000 },
  ],
  restoran: [
    { emoji: "🍗", name: "Ayam Goreng", price: 35000 },
    { emoji: "🍖", name: "Ayam Bakar", price: 38000 },
    { emoji: "🍛", name: "Nasi Padang", price: 28000 },
    { emoji: "🍜", name: "Mie Goreng", price: 25000 },
    { emoji: "🥤", name: "Es Jeruk", price: 12000 },
    { emoji: "🍤", name: "Udang Bakar", price: 45000 },
  ],
  toko_retail: [
    { emoji: "👕", name: "Kaos Polos", price: 89000 },
    { emoji: "🎧", name: "Headphone", price: 299000 },
    { emoji: "🔋", name: "Powerbank", price: 149000 },
    { emoji: "⌚", name: "Jam Tangan", price: 249000 },
    { emoji: "👜", name: "Tas Selempang", price: 129000 },
    { emoji: "👖", name: "Celana Jeans", price: 199000 },
  ],
  bakery: [
    { emoji: "🍞", name: "Roti Tawar", price: 18000 },
    { emoji: "🥐", name: "Croissant", price: 22000 },
    { emoji: "🍩", name: "Donat", price: 8000 },
    { emoji: "🎂", name: "Custom Cake", price: 350000 },
    { emoji: "🍰", name: "Kue Lapis", price: 35000 },
    { emoji: "🧁", name: "Cupcake", price: 15000 },
  ],
  toko_cat: [
    { emoji: "🎨", name: "Cat Tembok 5L", price: 185000 },
    { emoji: "🧪", name: "Thinner 5L", price: 85000 },
    { emoji: "🖌️", name: "Cat Kayu 1L", price: 65000 },
    { emoji: "🛢️", name: "Cat Besi", price: 95000 },
    { emoji: "🧴", name: "Cat Semprot", price: 45000 },
    { emoji: "🪣", name: "Ember Cat", price: 25000 },
  ],
  spa: [
    { emoji: "💆", name: "Bali Massage", price: 250000 },
    { emoji: "✨", name: "Facial 60m", price: 200000 },
    { emoji: "🧴", name: "Body Scrub", price: 180000 },
    { emoji: "🪷", name: "Thai Massage", price: 350000 },
    { emoji: "🕯️", name: "Aromaterapi", price: 120000 },
    { emoji: "🌿", name: "Reflexology", price: 150000 },
  ],
  bengkel: [
    { emoji: "🔧", name: "Ganti Oli", price: 150000 },
    { emoji: "🛠️", name: "Tune Up", price: 350000 },
    { emoji: "⚙️", name: "Servis Rem", price: 250000 },
    { emoji: "🚗", name: "Cuci Mobil", price: 75000 },
    { emoji: "🔩", name: "Ganti Bearing", price: 400000 },
    { emoji: "🛞", name: "Spooring", price: 125000 },
  ],
  toko_sparepart: [
    { emoji: "🔧", name: "Kampas Rem", price: 185000 },
    { emoji: "🛢️", name: "Oli 5W-30", price: 285000 },
    { emoji: "🌀", name: "Filter Udara", price: 65000 },
    { emoji: "⚡", name: "Busi Iridium", price: 95000 },
    { emoji: "🔋", name: "Aki 35Ah", price: 650000 },
    { emoji: "💡", name: "Lampu LED", price: 85000 },
  ],
  toko_kain: [
    { emoji: "🧵", name: "Katun Putih", price: 25000 },
    { emoji: "🧣", name: "Batik Parang", price: 45000 },
    { emoji: "👖", name: "Denim Biru", price: 55000 },
    { emoji: "🪡", name: "Rayon", price: 30000 },
    { emoji: "🌸", name: "Sutra Motif", price: 75000 },
    { emoji: "🧶", name: "Linen", price: 40000 },
  ],
  toko_pakaian: [
    { emoji: "👔", name: "Kemeja Oxford", price: 149000 },
    { emoji: "👖", name: "Chino Slim", price: 179000 },
    { emoji: "🧥", name: "Denim Jacket", price: 259000 },
    { emoji: "👗", name: "Dress Mid", price: 229000 },
    { emoji: "👟", name: "Sneakers", price: 329000 },
    { emoji: "🧢", name: "Cap Baseball", price: 89000 },
  ],
};