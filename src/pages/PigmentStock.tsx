import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Droplets } from "lucide-react";

export default function PigmentStock() {
  const tenantId = useTenantId() ?? "";
  const stock = useQuery(api.tokoCat.listPigmentStock, { tenantId }) ?? [];
  const createPigment = useMutation(api.tokoCat.createPigmentStock);
  const updatePigment = useMutation(api.tokoCat.updatePigmentStock);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [restockDialog, setRestockDialog] = useState<string | null>(null);
  const [form, setForm] = useState({ colorCode: "", quantityMl: 0 });
  const [restockQty, setRestockQty] = useState(0);

  const save = async () => {
    if (!form.colorCode) return;
    await createPigment({ tenantId, ...form });
    setDialogOpen(false);
    setForm({ colorCode: "", quantityMl: 0 });
  };

  const restock = async () => {
    if (!restockDialog || restockQty <= 0) return;
    const item = stock.find((s) => s._id === restockDialog);
    if (item) {
      await updatePigment({ id: restockDialog as any, quantityMl: item.quantityMl + restockQty });
    }
    setRestockDialog(null);
    setRestockQty(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pigment Stock</h1>
          <p className="text-sm text-muted-foreground">Stok pigment per warna (ml)</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Pigmen</Button>
      </div>
      <div className="space-y-3">
        {stock.map((s) => (
          <Card key={s._id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Droplets className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold">{s.colorCode}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.quantityMl.toLocaleString()} ml • Restock: {s.lastRestockedAt ? new Date(s.lastRestockedAt).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.quantityMl < 100 && <span className="text-xs text-destructive font-semibold">STOK MENIPIS</span>}
                <Button size="sm" variant="outline" onClick={() => { setRestockDialog(s._id); setRestockQty(0); }}>Restock</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {stock.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada data pigment stock.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Tambah Pigmen</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Color Code (e.g. RAL 9010)" value={form.colorCode} onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))} />
            <Input type="number" placeholder="Stok awal (ml)" value={form.quantityMl || ""} onChange={(e) => setForm((f) => ({ ...f, quantityMl: +e.target.value }))} />
            <Button onClick={save} className="w-full">Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restockDialog} onOpenChange={() => setRestockDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Restock Pigmen</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="number" placeholder="Jumlah tambahan (ml)" value={restockQty || ""} onChange={(e) => setRestockQty(+e.target.value)} />
            <Button onClick={restock} className="w-full">Restock</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
