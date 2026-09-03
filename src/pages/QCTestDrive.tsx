import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Route, Plus } from "lucide-react";

export default function QCTestDrive() {
  const tenantId = useTenantId() ?? "";
  const drives = useQuery(api.bengkel.listTestDrives, { tenantId }) ?? [];
  const workOrders = useQuery(api.bengkel.listWorkOrders, { tenantId }) ?? [];
  const createDrive = useMutation(api.bengkel.createTestDrive);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ workOrderId: "", kmStart: 0, kmEnd: 0, complaintResolved: true, abnormalNoise: false, vibration: false, leakage: false, notes: "" });

  const save = async () => {
    await createDrive({ tenantId, ...form, foremanId: "foreman", result: form.complaintResolved && !form.abnormalNoise && !form.vibration && !form.leakage ? "pass" : "rework" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">QC Test Drive</h1><p className="text-sm text-muted-foreground">1-5KM • Keluhan hilang, suara, getaran, kebocoran</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Test Drive Baru</Button>
      </div>
      <div className="space-y-3">
        {drives.map((d) => (
          <Card key={d._id} className={d.result === "rework" ? "border-amber-300" : "border-green-300"}><CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant={d.result === "pass" ? "default" : "destructive"}>{d.result === "pass" ? "✅ PASS" : "❌ REWORK"}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Route className="h-3 w-3" /> {d.kmStart}→{d.kmEnd} KM ({d.kmEnd - d.kmStart}m)</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className={`p-1 rounded text-xs text-center ${d.complaintResolved ? "bg-green-50" : "bg-red-50"}`}>{d.complaintResolved ? "✓ Keluhan Hilang" : "✗ Masih Ada"}</div>
              <div className={`p-1 rounded text-xs text-center ${!d.abnormalNoise ? "bg-green-50" : "bg-red-50"}`}>{!d.abnormalNoise ? "✓ Suara OK" : "✗ Ada Suara"}</div>
              <div className={`p-1 rounded text-xs text-center ${!d.leakage ? "bg-green-50" : "bg-red-50"}`}>{!d.leakage ? "✓ Tidak Bocor" : "✗ Bocor"}</div>
            </div>
            {d.notes && <p className="text-xs text-muted-foreground mt-2 italic">{d.notes}</p>}
          </CardContent></Card>
        ))}
        {drives.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada test drive.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>QC Test Drive</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Work Order</label><select value={form.workOrderId} onChange={(e) => setForm((f) => ({ ...f, workOrderId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih WO...</option>{workOrders.map((w) => <option key={w._id} value={w._id}>{w.woNumber}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs">KM Start</label><Input type="number" value={form.kmStart} onChange={(e) => setForm((f) => ({ ...f, kmStart: +e.target.value }))} /></div><div><label className="text-xs">KM End</label><Input type="number" value={form.kmEnd} onChange={(e) => setForm((f) => ({ ...f, kmEnd: +e.target.value }))} /></div></div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <label className="flex items-center gap-1"><input type="checkbox" checked={form.complaintResolved} onChange={(e) => setForm((f) => ({ ...f, complaintResolved: e.target.checked }))} /> Keluhan Hilang</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={!form.abnormalNoise} onChange={(e) => setForm((f) => ({ ...f, abnormalNoise: !e.target.checked }))} /> Suara OK</label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={!form.leakage} onChange={(e) => setForm((f) => ({ ...f, leakage: !e.target.checked }))} /> Tidak Bocor</label>
            </div>
            <Input placeholder="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <Button onClick={save} className="w-full">Submit QC</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
