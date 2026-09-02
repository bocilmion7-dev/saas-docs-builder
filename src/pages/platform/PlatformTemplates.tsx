import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layout, Eye, Upload, Edit, Star, Palette } from "lucide-react";

const CATEGORIES = [
  { id: "cafe", name: "Cafe", icon: "☕" },
  { id: "restoran", name: "Restoran", icon: "🍽️" },
  { id: "toko_retail", name: "Retail", icon: "🛍️" },
  { id: "toko_cat", name: "Toko Cat", icon: "🎨" },
  { id: "spa", name: "Spa", icon: "💆" },
  { id: "bakery", name: "Bakery", icon: "🍞" },
  { id: "bengkel", name: "Bengkel", icon: "🔧" },
  { id: "toko_sparepart", name: "Sparepart", icon: "🚗" },
  { id: "toko_kain", name: "Kain", icon: "🧵" },
];

const TEMPLATES: Record<string, { name: string; description: string; style: string; colors: string; preview: string }[]> = {
  cafe: [
    { name: "Minimalist Coffee", description: "Dark, modern, clean lines", style: "Dark Mode", colors: "#1a1a1a, #d4a574, #ffffff", preview: "☕" },
    { name: "Warm Bakery", description: "Cream tones, friendly feel", style: "Warm", colors: "#f5e6d3, #8b6914, #ffffff", preview: "🥐" },
    { name: "Premium Lounge", description: "Elegant, sophisticated", style: "Premium", colors: "#0d0d0d, #c9a96e, #f0f0f0", preview: "✨" },
  ],
  restoran: [
    { name: "Traditional Feast", description: "Heritage colors, warm", style: "Heritage", colors: "#8b2500, #ffd700, #fff8dc", preview: "🍲" },
    { name: "Modern Dine", description: "Sleek, contemporary", style: "Modern", colors: "#2d2d2d, #e74c3c, #ffffff", preview: "🍽️" },
    { name: "Garden Restaurant", description: "Natural, fresh feel", style: "Natural", colors: "#2d5016, #90b77d, #fafafa", preview: "🌿" },
  ],
  toko_retail: [
    { name: "Minimal Store", description: "Clean, product-focused", style: "Clean", colors: "#ffffff, #000000, #f5f5f5", preview: "🏪" },
    { name: "Supermarket", description: "Grid heavy, vibrant", style: "Vibrant", colors: "#1a5276, #2ecc71, #ffffff", preview: "🛒" },
    { name: "Fashion Boutique", description: "Visual, lifestyle feel", style: "Lifestyle", colors: "#2c2c2c, #d4a574, #f9f6f1", preview: "👗" },
  ],
  toko_cat: [
    { name: "Color Studio", description: "Visualizer, bold colors", style: "Bold", colors: "#ffffff, #e74c3c, #3498db", preview: "🎨" },
    { name: "Industrial Paint", description: "Catalog heavy, professional", style: "Industrial", colors: "#4a4a4a, #ff6b35, #ffffff", preview: "🏭" },
    { name: "Contractor Pro", description: "Project gallery, trust", style: "Professional", colors: "#1a365d, #2b6cb0, #ffffff", preview: "👷" },
  ],
  spa: [
    { name: "Luxury Zen", description: "Gold accents, dark luxury", style: "Luxury", colors: "#1a1a2e, #c9a96e, #f0e6d3", preview: "🧘" },
    { name: "Bali Retreat", description: "Tropical, natural, calm", style: "Tropical", colors: "#2d5016, #deb887, #f5f5dc", preview: "🌴" },
    { name: "Modern Wellness", description: "Clean, modern, spa vibe", style: "Modern", colors: "#ffffff, #6b9d8c, #f0f7f4", preview: "💆" },
  ],
  bakery: [
    { name: "Sweet Morning", description: "Pastel, inviting, warm", style: "Pastel", colors: "#fff5e6, #e6a05c, #5c3d2e", preview: "🧁" },
    { name: "Artisan Bread", description: "Rustic, authentic", style: "Rustic", colors: "#8b6914, #d4a574, #f5f0e6", preview: "🥖" },
    { name: "Custom Cake Studio", description: "Colorful, creative", style: "Creative", colors: "#ff69b4, #9b59b6, #ffffff", preview: "🎂" },
  ],
  bengkel: [
    { name: "Auto Service Pro", description: "Industrial, trustworthy", style: "Industrial", colors: "#2c3e50, #e67e22, #ecf0f1", preview: "🔧" },
    { name: "Quick Fix", description: "Fast, efficient, clean", style: "Clean", colors: "#27ae60, #2c3e50, #ffffff", preview: "⚡" },
    { name: "Premium Garage", description: "High-end, luxury service", style: "Premium", colors: "#1a1a1a, #c0c0c0, #ffffff", preview: "🏎️" },
  ],
  toko_sparepart: [
    { name: "Part Finder", description: "Search-focused, VIN lookup", style: "Search", colors: "#1a365d, #3182ce, #ffffff", preview: "🔍" },
    { name: "Garage Store", description: "Industrial, part-heavy", style: "Industrial", colors: "#4a4a4a, #ff6b35, #ffffff", preview: "🔩" },
    { name: "OEM Catalog", description: "Professional, catalog grid", style: "Professional", colors: "#2d3748, #4299e1, #ffffff", preview: "📋" },
  ],
  toko_kain: [
    { name: "Batik Gallery", description: "Motif gallery, cultural", style: "Cultural", colors: "#5c2d00, #d4a574, #f5f0e6", preview: "🎭" },
    { name: "Textile Wholesale", description: "Roll management, bulk", style: "Wholesale", colors: "#2d3748, #68d391, #ffffff", preview: "🧵" },
    { name: "Fashion Fabric", description: "Visual, trend-focused", style: "Trendy", colors: "#ff6b9d, #6c5ce7, #ffffff", preview: "✂️" },
  ],
};

export default function PlatformTemplates() {
  const [activeTab, setActiveTab] = useState("cafe");
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<string | null>(null);

  const templates = TEMPLATES[activeTab] || [];
  const catInfo = CATEGORIES.find((c) => c.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Layout className="size-6" /> Template Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">27 templates (3 per kategori) — Konfigurasi warna, layout, sections</p>
        </div>
        <Button><Upload className="size-4 mr-2" /> Upload Template Baru</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-extrabold">27</div>
            <div className="text-xs text-muted-foreground mt-1">Total Templates</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-extrabold">9</div>
            <div className="text-xs text-muted-foreground mt-1">Kategori Aktif</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-extrabold">3</div>
            <div className="text-xs text-muted-foreground mt-1">Template per Kategori</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex overflow-x-auto h-auto flex-wrap">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
              {cat.icon} {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {templates.map((t, i) => (
              <Card key={i} className="border-border/60 overflow-hidden hover:shadow-lg transition-all group">
                {/* Preview area */}
                <div className="h-40 relative" style={{ background: t.colors.split(",")[0] + "22" }}>
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {t.preview}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Badge variant="secondary" className="text-[10px]">{t.style}</Badge>
                    {i === 0 && <Badge className="text-[10px] bg-primary text-primary-foreground">Default</Badge>}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                  {/* Color swatches */}
                  <div className="flex gap-1 mt-3">
                    {t.colors.split(", ").map((color, ci) => (
                      <div key={ci} className="w-5 h-5 rounded-full border border-border/60" style={{ background: color }} title={color} />
                    ))}
                  </div>
                  {/* Config JSON preview */}
                  <div className="mt-3 p-2 bg-muted/50 rounded text-[10px] font-mono text-muted-foreground">
                    {JSON.stringify({ colors: t.colors.split(", "), layout: t.style.toLowerCase(), sections: ["hero", "products", "about", "contact"], font: "Inter", radius: "12px" }, null, 0).substring(0, 80)}...
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowPreview(t.name)}>
                      <Eye className="size-3 mr-1" /> Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowEdit(t.name)}>
                      <Edit className="size-3 mr-1" /> Edit Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!showPreview} onOpenChange={() => setShowPreview(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {showPreview}</DialogTitle>
            <DialogDescription>Storefront preview dengan template ini</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center">
              <div className="text-5xl mb-4">{catInfo?.icon}</div>
              <h2 className="text-2xl font-extrabold">Toko Demo</h2>
              <p className="text-sm text-muted-foreground mt-1">Powered by TokoBuilder AI — Template: {showPreview}</p>
            </div>
            <div className="p-6">
              <h3 className="font-bold mb-3">Produk Terbaru</h3>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-lg bg-muted/40 p-3 text-center">
                    <div className="h-20 bg-muted rounded mb-2" />
                    <div className="text-xs font-semibold">Produk {n}</div>
                    <div className="text-xs text-primary font-bold">Rp50.000</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Config Dialog */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Palette className="size-4" /> Edit Template Config</DialogTitle>
            <DialogDescription>{showEdit}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold">Primary Color</label>
              <div className="flex gap-2 mt-1">
                <Input type="color" defaultValue="#d4a574" className="w-12 h-8 p-1" />
                <Input defaultValue="#d4a574" className="font-mono text-xs" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Secondary Color</label>
              <div className="flex gap-2 mt-1">
                <Input type="color" defaultValue="#1a1a1a" className="w-12 h-8 p-1" />
                <Input defaultValue="#1a1a1a" className="font-mono text-xs" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Background Color</label>
              <div className="flex gap-2 mt-1">
                <Input type="color" defaultValue="#ffffff" className="w-12 h-8 p-1" />
                <Input defaultValue="#ffffff" className="font-mono text-xs" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Homepage Sections (drag to reorder)</label>
              <div className="space-y-1 mt-1">
                {["Hero Banner", "Featured Products", "Categories", "About Us", "Testimonials", "Contact & Map"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted/40 rounded text-xs">
                    <span className="text-muted-foreground">☰</span> {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Font Family</label>
              <Input defaultValue="Inter" className="mt-1 text-xs" />
            </div>
            <div>
              <label className="text-xs font-semibold">Border Radius (px)</label>
              <Input type="number" defaultValue={12} className="mt-1 text-xs" />
            </div>
            <Button className="w-full" onClick={() => setShowEdit(null)}>Simpan Konfigurasi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
