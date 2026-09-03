import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layout, Eye, Edit, Palette, Plus, Loader2 } from "lucide-react";

const CATEGORIES = [
  { id: "cafe" as const, name: "Cafe", icon: "☕" },
  { id: "restoran" as const, name: "Restoran", icon: "🍽️" },
  { id: "toko_retail" as const, name: "Retail", icon: "🛍️" },
  { id: "bengkel" as const, name: "Bengkel", icon: "🔧" },
  { id: "bakery" as const, name: "Bakery", icon: "🍞" },
  { id: "toko_cat" as const, name: "Toko Cat", icon: "🎨" },
  { id: "spa" as const, name: "Spa", icon: "💆" },
  { id: "toko_sparepart" as const, name: "Sparepart", icon: "🚗" },
  { id: "toko_kain" as const, name: "Kain", icon: "🧵" },
  { id: "toko_pakaian" as const, name: "Toko Pakaian", icon: "👕" },
];

export default function PlatformTemplates() {
  const [activeTab, setActiveTab] = useState("cafe");
  const [showPreview, setShowPreview] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", category: "cafe" as string, previewUrl: "", configJson: '{"colors":["#ffffff"],"layout":"default","sections":["hero","products"]}' });

  const templates = useQuery(api.templates.list, { category: activeTab as any });
  const allTemplates = useQuery(api.templates.list, {});
  const createTemplate = useMutation(api.templates.create);
  const removeTemplate = useMutation(api.templates.remove);

  const handleCreate = async () => {
    setSaving(true);
    try {
      let configJson;
      try { configJson = JSON.parse(form.configJson); } catch { configJson = {}; }
      await createTemplate({ name: form.name, slug: form.slug, category: form.category as any, previewUrl: form.previewUrl || undefined, configJson });
      setOpen(false);
      setForm({ name: "", slug: "", category: activeTab, previewUrl: "", configJson: '{"colors":["#ffffff"],"layout":"default","sections":["hero","products"]}' });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const catInfo = CATEGORIES.find((c) => c.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Layout className="size-6" /> Template Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">27 templates (3 per kategori) — Kelola template storefront</p>
        </div>
        <Button onClick={() => { setForm(f => ({ ...f, category: activeTab })); setOpen(true); }} className="gap-2">
          <Plus className="size-4" /> Upload Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-extrabold">{allTemplates?.length ?? 0}</div>
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
            <div className="text-3xl font-extrabold">{templates?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Template ({catInfo?.name})</div>
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
            {!templates && <div className="col-span-3 text-center py-8 text-muted-foreground">Memuat...</div>}
            {templates?.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                Belum ada template untuk {catInfo?.name}. Klik "Upload Template" untuk menambah.
              </div>
            )}
            {templates?.map((t) => (
              <Card key={t._id} className="border-border/60 overflow-hidden hover:shadow-lg transition-all group">
                <div className="h-40 relative bg-gradient-to-br from-muted/40 to-muted/20">
                  {t.previewUrl ? (
                    <img src={t.previewUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                      {catInfo?.icon}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Badge variant={t.isActive ? "default" : "secondary"} className="text-[10px]">{t.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Slug: {t.slug}</div>
                  <div className="mt-3 p-2 bg-muted/50 rounded text-[10px] font-mono text-muted-foreground overflow-hidden">
                    {JSON.stringify(t.configJson).substring(0, 80)}...
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowPreview(t)}>
                      <Eye className="size-3 mr-1" /> Preview
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => { if (confirm(`Hapus template ${t.name}?`)) removeTemplate({ id: t._id }); }}>
                      Hapus
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
            <DialogTitle>Preview: {showPreview?.name}</DialogTitle>
            <DialogDescription>Storefront preview dengan template ini</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center">
              <div className="text-5xl mb-4">{catInfo?.icon}</div>
              <h2 className="text-2xl font-extrabold">Toko Demo</h2>
              <p className="text-sm text-muted-foreground mt-1">Template: {showPreview?.name}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload Template Baru</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nama Template</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Minimalist Coffee" /></div>
            <div className="grid gap-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="minimalist-coffee" /></div>
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button key={c.id} type="button" onClick={() => setForm(f => ({ ...f, category: c.id }))} className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${form.category === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2"><Label>Preview URL (opsional)</Label><Input value={form.previewUrl} onChange={(e) => setForm(f => ({ ...f, previewUrl: e.target.value }))} placeholder="https://..." /></div>
            <div className="grid gap-2">
              <Label>Config JSON</Label>
              <textarea value={form.configJson} onChange={(e) => setForm(f => ({ ...f, configJson: e.target.value }))} className="w-full h-24 rounded-md border border-border bg-muted px-3 py-2 text-xs font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={saving || !form.name || !form.slug}>
              {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : null} Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
