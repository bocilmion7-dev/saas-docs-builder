import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Shield } from "lucide-react";

const QC_TYPES = ["berat", "ukuran", "warna", "tekstur", "rasa", "aroma"];

export default function QCLog() {
  const tenantId = "demo";
  const qcLogs = useQuery(api.bakery.listQcLogs, { tenantId }) ?? [];
  const batches = useQuery(api.bakery.listBatches, { tenantId }) ?? [];
  const createLog = useMutation(api.bakery.createQcLog);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ batchId: "", checkType: "berat", result: "pass", notes: "" });

  const save = async () => {
    if (!form.batchId) return;
    await createLog({ tenantId, ...form });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => s === "pass" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">QC Log (6 Parameter)</h1><p className="text-sm text-muted-foreground">Berat, Ukuran, Warna, Tekstur, Rasa, Aroma</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Catat QC</Button>
      </div>
      <div className="space-y-3">
        {qcLogs.map((l) => {
          const batch = batches.find((b) => b._id === l.batchId);
          return (
            <Card key={l._id}><CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs capitalize">{l.checkType}</Badge>
                    <Badge className={`text-xs capitalize ${statusColor(l.result)}`}>{l.result}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Batch: {l.batchId} {l.notes && `• ${l.notes}`}</p>
                </div>
              </div>
            </CardContent></Card>
          );
        })}
        {qcLogs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada QC log.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Catat QC</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Batch</label><select value={form.batchId} onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih batch...</option>{batches.map((b) => <option key={b._id} value={b._id}>Batch-{b._id.slice(-4)} ({b.status})</option>)}</select></div>
            <div><label className="text-xs">Parameter</label><select value={form.checkType} onChange={(e) => setForm((f) => ({ ...f, checkType: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">{QC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="flex gap-2">
              <Button size="sm" variant={form.result === "pass" ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, result: "pass" }))}>✓ Pass</Button>
              <Button size="sm" variant={form.result === "fail" ? "destructive" : "outline"} onClick={() => setForm((f) => ({ ...f, result: "fail" }))}>✗ Fail</Button>
            </div>
            <Input placeholder="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
