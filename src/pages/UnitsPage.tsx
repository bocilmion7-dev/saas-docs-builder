import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Ruler, Trash2 } from "lucide-react";

export default function UnitsPage() {
  const tenantId = useTenantId() ?? "";
  const units = useQuery(api.units.list, { tenantId }) ?? [];
  const createUnit = useMutation(api.units.create);
  const removeUnit = useMutation(api.units.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", symbol: "" });

  const save = async () => {
    if (!form.name || !form.symbol) return;
    await createUnit({ tenantId, name: form.name, symbol: form.symbol });
    setForm({ name: "", symbol: "" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Units</h1><p className="text-sm text-muted-foreground">pcs, liter, kg, meter, yard, roll, pail, kaleng, dus</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Unit</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {units.map((u) => (
          <Card key={u._id}><CardContent className="p-4 text-center relative group">
            <Ruler className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="font-semibold">{u.name}</p>
            <p className="text-xs font-mono text-muted-foreground">({u.symbol})</p>
            <Button size="sm" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => removeUnit({ id: u._id })}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
      </div>
      {units.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada unit.</p>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Unit</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama (contoh: Liter)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Simbol (contoh: L)" value={form.symbol} onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
