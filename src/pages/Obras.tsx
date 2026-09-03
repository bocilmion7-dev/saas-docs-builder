import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Scissors } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const SIDES = ["atas", "bawah", "kiri", "kanan", "semua"];

export default function Obras() {
  const tenantId = "demo";
  const obras = useQuery(api.kain.listObras, { tenantId }) ?? [];
  const createObras = useMutation(api.kain.createObras);
  const updateStatus = useMutation(api.kain.updateObrasStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ sisi: "atas", benangWarna: "putih", biayaPerMeter: 2000 });

  const save = async () => {
    await createObras({ tenantId, ...form });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Obras Service</h1><p className="text-sm text-muted-foreground">Kelola jasa obras kain</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Obras Baru</Button>
      </div>
      <div className="space-y-3">
        {obras.map((o: any) => (
          <Card key={o._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scissors className="h-5 w-5 text-amber-600" />
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs capitalize">{o.sisi}</Badge>
                  <Badge variant="outline" className="text-xs">{o.benangWarna}</Badge>
                  <Badge variant={o.status === "completed" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{formatRp(o.biayaPerMeter)}/m {o.qcPassed !== undefined && (o.qcPassed ? "• ✓ QC Pass" : "• ✗ QC Fail")}</p>
              </div>
            </div>
            {o.status === "pending" && <Button size="sm" onClick={() => updateStatus({ id: o._id, status: "in_progress" })}>Mulai</Button>}
            {o.status === "in_progress" && <div className="flex gap-1"><Button size="sm" onClick={() => updateStatus({ id: o._id, status: "completed", qcPassed: true })}>QC Pass</Button><Button size="sm" variant="destructive" onClick={() => updateStatus({ id: o._id, status: "completed", qcPassed: false })}>QC Fail</Button></div>}
          </CardContent></Card>
        ))}
        {obras.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada obras service.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Obras Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Sisi</label><div className="flex flex-wrap gap-1 mt-1">{SIDES.map((s) => <Button key={s} size="sm" variant={form.sisi === s ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, sisi: s }))} className="text-xs capitalize">{s}</Button>)}</div></div>
            <Input placeholder="Warna Benang" value={form.benangWarna} onChange={(e) => setForm((f) => ({ ...f, benangWarna: e.target.value }))} />
            <Input type="number" placeholder="Biaya per meter (Rp)" value={form.biayaPerMeter} onChange={(e) => setForm((f) => ({ ...f, biayaPerMeter: +e.target.value }))} />
            <Button onClick={save} className="w-full">Buat</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
