import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

export default function PlatformBanners() {
  const banners = useQuery(api.marketplace.listBanners);
  const createBanner = useMutation(api.marketplace.createBanner);
  const updateBanner = useMutation(api.marketplace.updateBanner);
  const deleteBanner = useMutation(api.marketplace.deleteBanner);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<any>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", bgColor: "from-primary/20 to-amber-50/20", sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditBanner(null);
    setForm({
      title: "", subtitle: "", imageUrl: "", linkUrl: "",
      bgColor: "from-primary/20 to-amber-50/20",
      sortOrder: (banners?.length ?? 0),
    });
    setDialogOpen(true);
  };

  const openEdit = (b: any) => {
    setEditBanner(b);
    setForm({
      title: b.title ?? "",
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl ?? "",
      linkUrl: b.linkUrl ?? "",
      bgColor: b.bgColor ?? "from-primary/20 to-amber-50/20",
      sortOrder: b.sortOrder ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editBanner) {
        await updateBanner({ id: editBanner._id, ...form });
      } else {
        await createBanner({ ...form });
      }
      setDialogOpen(false);
    } catch (e) {
      alert("Gagal menyimpan: " + (e as Error).message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus banner ini?")) await deleteBanner({ id });
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await updateBanner({ id, isActive: !isActive });
  };

  const moveUp = async (banner: any) => {
    const sorted = [...(banners ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((b) => b._id === banner._id);
    if (idx > 0) {
      const prev = sorted[idx - 1];
      await updateBanner({ id: banner._id, sortOrder: prev.sortOrder });
      await updateBanner({ id: prev._id, sortOrder: banner.sortOrder });
    }
  };

  const moveDown = async (banner: any) => {
    const sorted = [...(banners ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((b) => b._id === banner._id);
    if (idx < sorted.length - 1) {
      const next = sorted[idx + 1];
      await updateBanner({ id: banner._id, sortOrder: next.sortOrder });
      await updateBanner({ id: next._id, sortOrder: banner.sortOrder });
    }
  };

  const BG_PRESETS = [
    { label: "Primary", value: "from-primary/20 to-amber-50/20" },
    { label: "Green", value: "from-emerald-500/20 to-green-50/20" },
    { label: "Blue", value: "from-blue-500/20 to-sky-50/20" },
    { label: "Pink", value: "from-pink-500/20 to-rose-50/20" },
    { label: "Purple", value: "from-purple-500/20 to-violet-50/20" },
    { label: "Amber", value: "from-amber-500/20 to-yellow-50/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Banner Marketplace</h1>
          <p className="text-sm text-muted-foreground">Kelola slide banner promosi di halaman utama marketplace (maks. 5 banner aktif)</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Buat Banner
        </Button>
      </div>

      <div className="space-y-3">
        {banners && banners.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Image className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada banner. Klik "Buat Banner" untuk menambah.</p>
            </CardContent>
          </Card>
        )}
        {banners?.sort((a, b) => a.sortOrder - b.sortOrder).map((b: any) => (
          <Card key={b._id} className={!b.isActive ? "opacity-60" : ""}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveUp(b)}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveDown(b)}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              <div className={`size-20 rounded-lg bg-gradient-to-r ${b.bgColor ?? "from-primary/20 to-amber-50/20"} flex items-center justify-center shrink-0 overflow-hidden`}>
                {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" /> : <Image className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{b.title}</p>
                {b.subtitle && <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>}
                {b.linkUrl && <p className="text-[10px] text-primary mt-1 truncate">{b.linkUrl}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={b.isActive ? "default" : "secondary"} className="text-xs">{b.isActive ? "Aktif" : "Nonaktif"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(b._id, b.isActive)}>
                  {b.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(b)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(b._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editBanner ? "Edit Banner" : "Banner Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Judul Banner</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Flash Sale 50% Off!" />
            </div>
            <div>
              <Label className="text-xs">Subtitle (opsional)</Label>
              <Input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Berlaku hingga 30 September" />
            </div>
            <div>
              <Label className="text-xs">URL Gambar Banner (opsional)</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Link CTA (opsional)</Label>
              <Input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} placeholder="/marketplace/category/toko_retail" />
            </div>
            <div>
              <Label className="text-xs">Warna Background</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {BG_PRESETS.map((preset) => (
                  <button key={preset.value} onClick={() => setForm((f) => ({ ...f, bgColor: preset.value }))}
                    className={`w-full h-8 rounded-lg bg-gradient-to-r ${preset.value} border-2 transition-all ${form.bgColor === preset.value ? "border-primary" : "border-border/60"}`}>
                    <span className="text-[9px] font-semibold">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving || !form.title.trim()}>
              {saving ? "Menyimpan..." : editBanner ? "Simpan Perubahan" : "Buat Banner"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}