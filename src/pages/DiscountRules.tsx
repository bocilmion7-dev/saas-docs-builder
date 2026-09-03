import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Percent, Trash2 } from "lucide-react";

export default function DiscountRules() {
  const tenantId = "demo";
  const rules = useQuery(api.bakery.listDiscountRules, { tenantId }) ?? [];
  const createRule = useMutation(api.bakery.createDiscountRule);
  const updateRule = useMutation(api.bakery.updateDiscountRule);
  const removeRule = useMutation(api.bakery.removeDiscountRule);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "percent", value: 10, timeStart: "", timeEnd: "", minPurchase: 0 });

  const save = async () => {
    if (!form.name) return;
    await createRule({
      tenantId,
      name: form.name,
      type: form.type,
      value: form.value,
      timeStart: form.timeStart || undefined,
      timeEnd: form.timeEnd || undefined,
      minPurchase: form.minPurchase,
    });
    setDialogOpen(false);
    setForm({ name: "", type: "percent", value: 10, timeStart: "", timeEnd: "", minPurchase: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discount Rules</h1>
          <p className="text-sm text-muted-foreground">Aturan diskon otomatis berdasarkan waktu & minimal belanja</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Aturan</Button>
      </div>
      <div className="space-y-3">
        {rules.map((r) => (
          <Card key={r._id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Percent className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.type === "percent" ? `${r.value}%` : `Rp${r.value.toLocaleString()}`}
                    {r.minPurchase > 0 && ` • Min. Rp${r.minPurchase.toLocaleString()}`}
                    {r.timeStart && r.timeEnd && ` • ${r.timeStart}-${r.timeEnd}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={r.isActive ? "default" : "secondary"} className="text-xs">{r.isActive ? "Aktif" : "Nonaktif"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => updateRule({ id: r._id, isActive: !r.isActive })}>
                  {r.isActive ? "Off" : "On"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeRule({ id: r._id })}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {rules.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada aturan diskon.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Aturan Diskon Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama aturan" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs">Tipe</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="percent">Persen (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label className="text-xs">Nilai</label>
                <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: +e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs">Jam Mulai</label><Input type="time" value={form.timeStart} onChange={(e) => setForm((f) => ({ ...f, timeStart: e.target.value }))} /></div>
              <div><label className="text-xs">Jam Selesai</label><Input type="time" value={form.timeEnd} onChange={(e) => setForm((f) => ({ ...f, timeEnd: e.target.value }))} /></div>
            </div>
            <div><label className="text-xs">Minimal Belanja (Rp)</label><Input type="number" value={form.minPurchase} onChange={(e) => setForm((f) => ({ ...f, minPurchase: +e.target.value }))} /></div>
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
