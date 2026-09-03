import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Settings, GripVertical, Trash2 } from "lucide-react";

const typeColors: Record<string, string> = {
  sugar: "bg-pink-500/10 text-pink-600", ice: "bg-cyan-500/10 text-cyan-600",
  milk: "bg-amber-500/10 text-amber-600", extra: "bg-purple-500/10 text-purple-600",
  topping: "bg-orange-500/10 text-orange-600", temp: "bg-red-500/10 text-red-600",
  pedas: "bg-rose-500/10 text-rose-600", doneness: "bg-emerald-500/10 text-emerald-600",
};

export default function ModifiersPage() {
  const tenantId = useTenantId() ?? "";
  const modifiers = useQuery(api.cafeResto.listModifiers, { tenantId }) ?? [];
  const createModifier = useMutation(api.cafeResto.createModifier);
  const removeModifier = useMutation(api.cafeResto.removeModifier);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "sugar", optionsText: "Normal:0,Less Sugar:0,No Sugar:0" });

  const save = async () => {
    if (!form.name) return;
    const options = form.optionsText.split(",").map((o) => {
      const [name, price] = o.split(":");
      return { name: name.trim(), price: Number(price) || 0 };
    }).filter((o) => o.name);
    await createModifier({ tenantId, name: form.name, type: form.type, options });
    setDialogOpen(false);
    setForm({ name: "", type: "sugar", optionsText: "Normal:0,Less Sugar:0,No Sugar:0" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Modifier Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola opsi modifikasi menu (sugar, ice, milk, topping, dll)</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="size-4" /> Modifier Baru</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modifiers.map((m) => (
          <Card key={m._id} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="size-4 text-muted-foreground" />
                  {m.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={typeColors[m.type] ?? "bg-muted text-muted-foreground"}>{m.type}</Badge>
                  <button className="text-muted-foreground hover:text-destructive" onClick={() => removeModifier({ id: m._id })}><Trash2 className="size-3" /></button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {(m.options ?? []).map((o: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-3 text-muted-foreground" />
                      <span>{o.name}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {o.price > 0 ? `+Rp ${o.price.toLocaleString("id-ID")}` : "Gratis"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modifiers.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada modifier. Klik "Modifier Baru" untuk menambah.</p>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Modifier</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Nama</label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Contoh: Sugar Level" /></div>
            <div><label className="text-xs font-medium">Tipe</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                {Object.keys(typeColors).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium">Opsi (Nama:Harga per koma)</label><Input value={form.optionsText} onChange={(e) => setForm((f) => ({ ...f, optionsText: e.target.value }))} placeholder="Normal:0,Less Sugar:0,No Sugar:0" /></div>
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
