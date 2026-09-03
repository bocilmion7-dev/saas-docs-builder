import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wrench, Clock, DollarSign } from "lucide-react";

const WO_STATUSES = ["draft", "waiting_approval", "approved", "queue", "in_progress", "waiting_parts", "qc", "test_drive", "finished", "delivered"];

export default function WorkOrders() {
  const tenantId = "demo";
  const workOrders = useQuery(api.bengkel.listWorkOrders, { tenantId }) ?? [];
  const vehicles = useQuery(api.bengkel.listVehicles, { tenantId }) ?? [];
  const createWorkOrder = useMutation(api.bengkel.createWorkOrder);
  const updateStatus = useMutation(api.bengkel.updateWorkOrderStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ vehicleId: "", complaint: "", type: "ringan", estimatedCostPart: 0, estimatedCostJasa: 0, estimatedTimeHours: 1 });

  const filtered = filter === "all" ? workOrders : workOrders.filter((w) => w.status === filter);

  const save = async () => {
    if (!form.vehicleId || !form.complaint) return;
    const woCount = workOrders.length + 1;
    await createWorkOrder({ tenantId, woNumber: `WO-${String(woCount).padStart(3, "0")}`, ...form, status: "draft" });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { draft: "bg-gray-100", waiting_approval: "bg-yellow-100", approved: "bg-blue-100", queue: "bg-purple-100", in_progress: "bg-blue-100 text-blue-800", waiting_parts: "bg-amber-100 text-amber-800", qc: "bg-indigo-100", test_drive: "bg-cyan-100", finished: "bg-green-100 text-green-800", delivered: "bg-green-200" };
    return m[s] ?? "";
  };

  const nextStatus = (s: string) => { const i = WO_STATUSES.indexOf(s); return i < WO_STATUSES.length - 1 ? WO_STATUSES[i + 1] : null; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Work Orders</h1><p className="text-sm text-muted-foreground">WO → diagnosis → approval → queue → in progress → QC → test drive → finished</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat WO</Button>
      </div>
      <div className="flex flex-wrap gap-1">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
        {["in_progress", "waiting_parts", "finished"].map((s) => <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize text-xs">{s.replace("_", " ")}</Button>)}
      </div>
      <div className="space-y-3">
        {filtered.map((wo) => {
          const vehicle = vehicles.find((v) => v._id === wo.vehicleId);
          const ns = nextStatus(wo.status);
          return (
            <Card key={wo._id}><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold">{wo.woNumber}</span>
                    <Badge className={`text-xs ${statusColor(wo.status)}`}>{wo.status.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline" className="text-xs">{wo.type}</Badge>
                  </div>
                  <p className="font-medium mt-1">{wo.complaint}</p>
                  <p className="text-xs text-muted-foreground mt-1">{vehicle?.plateNumber} {vehicle?.brand} {vehicle?.model}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Part: Rp {wo.estimatedCostPart.toLocaleString("id")}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Jasa: Rp {wo.estimatedCostJasa.toLocaleString("id")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Est: {wo.estimatedTimeHours}h</span>
                  </div>
                </div>
                {ns && <Button size="sm" onClick={() => updateStatus({ id: wo._id, status: ns })}>→ {ns.replace(/_/g, " ")}</Button>}
              </div>
            </CardContent></Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Tidak ada work order.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Buat Work Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Kendaraan</label><select value={form.vehicleId} onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih kendaraan...</option>{vehicles.map((v) => <option key={v._id} value={v._id}>{v.plateNumber} - {v.brand} {v.model}</option>)}</select></div>
            <div><label className="text-xs font-medium">Keluhan</label><Input value={form.complaint} onChange={(e) => setForm((f) => ({ ...f, complaint: e.target.value }))} placeholder="Deskripsi keluhan" /></div>
            <div><label className="text-xs font-medium">Tipe Servis</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option>ringan</option><option>sedang</option><option>berat</option></select></div>
            <div className="grid grid-cols-3 gap-2"><div><label className="text-xs">Est. Part (Rp)</label><Input type="number" value={form.estimatedCostPart} onChange={(e) => setForm((f) => ({ ...f, estimatedCostPart: +e.target.value }))} /></div><div><label className="text-xs">Est. Jasa (Rp)</label><Input type="number" value={form.estimatedCostJasa} onChange={(e) => setForm((f) => ({ ...f, estimatedCostJasa: +e.target.value }))} /></div><div><label className="text-xs">Est. Jam</label><Input type="number" value={form.estimatedTimeHours} onChange={(e) => setForm((f) => ({ ...f, estimatedTimeHours: +e.target.value }))} /></div></div>
            <Button onClick={save} className="w-full">Buat WO</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
