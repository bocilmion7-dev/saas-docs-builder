import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Shield } from "lucide-react";

export default function PartWarranty() {
  const tenantId = "demo";
  const warranties = useQuery(api.sparepart.listWarranties, { tenantId }) ?? [];
  const productsResult = useQuery(api.products.list, { tenantId });
  const products = (productsResult && typeof productsResult === 'object' && 'items' in productsResult) ? productsResult.items : [];
  const createWarranty = useMutation(api.sparepart.createWarranty);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", warrantyType: "replacement", durationMonths: 6, kmLimit: 20000 });

  const save = async () => {
    if (!form.productId) return;
    await createWarranty({ tenantId, ...form });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Warranty & Claims</h1><p className="text-sm text-muted-foreground">Kelola garansi part</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Garansi</Button>
      </div>
      <div className="space-y-3">
        {warranties.map((w: any) => (
          <Card key={w._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold">Product: {w.productId}</p>
                <p className="text-xs text-muted-foreground">{w.warrantyType} • {w.durationMonths} bulan • {w.kmLimit?.toLocaleString()} km</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs capitalize">{w.warrantyType}</Badge>
          </CardContent></Card>
        ))}
        {warranties.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada data garansi.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Garansi</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Product</label><select value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih produk...</option>{products.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
            <div><label className="text-xs">Tipe Garansi</label><select value={form.warrantyType} onChange={(e) => setForm((f) => ({ ...f, warrantyType: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="replacement">Replacement</option><option value="repair">Repair</option><option value="refund">Refund</option></select></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs">Durasi (bulan)</label><Input type="number" value={form.durationMonths} onChange={(e) => setForm((f) => ({ ...f, durationMonths: +e.target.value }))} /></div><div><label className="text-xs">Limit KM</label><Input type="number" value={form.kmLimit} onChange={(e) => setForm((f) => ({ ...f, kmLimit: +e.target.value }))} /></div></div>
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
