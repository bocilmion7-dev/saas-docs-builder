import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Scissors, CheckCircle } from "lucide-react";

export default function Obras() {
  const tenantId = "demo";
  const obras = useQuery(api.kain.listObras, { tenantId }) ?? [];
  const createObras = useMutation(api.kain.createObras);
  const updateStatus = useMutation(api.kain.updateObrasStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ sisi: "semua_sisi", benangWarna: "sesuai", biayaPerMeter: 3000 });

  const save = async () => {
    await createObras({ tenantId, ...form });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: "bg-gray-100", in_progress: "bg-blue-100 text-blue-800", completed: "bg-green-100 text-green-800" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Obras Service</h1><p className="text-sm text-muted-foreground">Overlock Rp2-5k/meter • Sisi semua/sisi tertentu • QC tidak kusut</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Obras</Button>
      </div>
      <div className="space-y-2">
        {obras.map((o) => (
          <Card key={o._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scissors className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Obras {o.sisi.replace("_", " ")}</p>
                <p className="text-xs text-muted-foreground">Benang: {o.benangWarna} • Rp {o.biayaPerMeter.toLocaleString("id")}/m</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs capitalize ${statusColor(o.status)}`}>{o.status.replace("_", " ")}</Badge>
              {o.status === "in_progress" && <Button size="sm" onClick={() => updateStatus({ id: o._id, status: "completed", qcPassed: true })}><CheckCircle className="h-3 w-3 mr-1" /> Selesai</Button>}
            </div>
          </CardContent></Card>
        ))}
        {obras.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada order obras.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Obras</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Sisi</label><select value={form.sisi} onChange={(e) => setForm((f) => ({ ...f, sisi: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="semua_sisi">Semua sisi</option><option value="sisi_tertentu">Sisi tertentu</option></select></div>
            <div><label className="text-xs font-medium">Warna Benang</label><select value={form.benangWarna} onChange={(e) => setForm((f) => ({ ...f, benangWarna: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="sesuai">Sesuai warna kain</option><option value="kontras">Kontras</option></select></div>
            <div><label className="text-xs font-medium">Biaya per meter (Rp)</label><Input type="number" value={form.biayaPerMeter} onChange={(e) => setForm((f) => ({ ...f, biayaPerMeter: +e.target.value }))} /></div>
            <Button onClick={save} className="w-full">Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
