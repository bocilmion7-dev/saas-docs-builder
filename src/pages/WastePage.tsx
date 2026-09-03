import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";


export default function WastePage() {
  const tenantId = useTenantId() ?? "";
  const waste = useQuery(api.waste.list, { tenantId }) ?? [];
  const wasteStats = useQuery(api.waste.stats, { tenantId });
  const createWaste = useMutation(api.waste.create);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ category: "bakery", item: "", qty: 0, unit: "pcs", type: "expired", cost: 0, note: "" });

  const save = async () => {
    if (!form.item || form.qty <= 0) return;
    await createWaste({ tenantId, ...form });
    setDialogOpen(false);
    setForm({ category: "bakery", item: "", qty: 0, unit: "pcs", type: "expired", cost: 0, note: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Waste Log</h1>
          <p className="text-sm text-muted-foreground">{wasteStats?.totalItems ?? 0} total waste • {wasteStats?.todayCount ?? 0} hari ini</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Catat Waste</Button>
      </div>
      <div className="space-y-3">
        {waste.map((w: any) => (
          <Card key={w._id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-semibold">{w.note ?? w.item ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{w.qty} {w.unit} • {w.type} • {new Date(w.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs capitalize">{w._source ?? w.reason ?? "-"}</Badge>
            </CardContent>
          </Card>
        ))}
        {waste.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada waste log.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Catat Waste</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Kategori</Label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="bakery">Bakery</option><option value="cat">Toko Cat</option><option value="cafe">Cafe</option>
              </select>
            </div>
            <div><Label className="text-xs">Item</Label><Input value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))} placeholder="Nama item" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Qty</Label><Input type="number" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: +e.target.value }))} /></div>
              <div><Label className="text-xs">Unit</Label><Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} /></div>
            </div>
            <div>
              <Label className="text-xs">Tipe</Label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="expired">Expired</option><option value="spill">Spill</option><option value="overbrew">Overbrew</option><option value="damage">Damage</option>
              </select>
            </div>
            <div><Label className="text-xs">Catatan</Label><Input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Catatan" /></div>
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
