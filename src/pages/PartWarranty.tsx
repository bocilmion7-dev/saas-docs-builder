import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Plus } from "lucide-react";

export default function PartWarranty() {
  const tenantId = "demo";
  const warranties = useQuery(api.sparepart.listWarranties, { tenantId }) ?? [];
  const createWarranty = useMutation(api.sparepart.createWarranty);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", warrantyType: "original", durationMonths: 6, kmLimit: 20000 });

  const save = async () => { await createWarranty({ tenantId, ...form }); setDialogOpen(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Part Warranty</h1><p className="text-sm text-muted-foreground">Original/OEM 3-6 bulan 10-20K KM • Aftermarket 1-3 bulan</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah</Button>
      </div>
      <div className="space-y-3">
        {warranties.map((w) => (
          <Card key={w._id}><CardContent className="p-3 flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" /><div><p className="font-semibold capitalize">{w.warrantyType}</p><p className="text-xs text-muted-foreground">{w.durationMonths} bulan / {w.kmLimit.toLocaleString()} KM</p></div>
          </CardContent></Card>
        ))}
        {warranties.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada warranty.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Warranty</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Product ID" value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} />
            <select value={form.warrantyType} onChange={(e) => setForm((f) => ({ ...f, warrantyType: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option>original</option><option>oem</option><option>aftermarket</option><option>body</option><option>oli</option></select>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs">Bulan</label><Input type="number" value={form.durationMonths} onChange={(e) => setForm((f) => ({ ...f, durationMonths: +e.target.value }))} /></div><div><label className="text-xs">KM Limit</label><Input type="number" value={form.kmLimit} onChange={(e) => setForm((f) => ({ ...f, kmLimit: +e.target.value }))} /></div></div>
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
