import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Truck } from "lucide-react";

export default function DeliveryOrders() {
  const tenantId = "demo";
  const deliveryOrders = useQuery(api.tokoCat.listDeliveryOrders, { tenantId }) ?? [];
  const createDO = useMutation(api.tokoCat.createDeliveryOrder);
  const updateStatus = useMutation(api.tokoCat.updateDeliveryStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ doNumber: "", driverName: "", vehicleNumber: "", quantityTotal: 0 });

  const save = async () => {
    if (!form.doNumber) return;
    await createDO({ tenantId, ...form });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { prepared: "bg-yellow-100 text-yellow-800", loaded: "bg-blue-100 text-blue-800", in_transit: "bg-purple-100 text-purple-800", delivered: "bg-green-100 text-green-800" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Delivery Orders (DO)</h1><p className="text-sm text-muted-foreground">Kelola pengiriman cat ke proyek</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat DO</Button>
      </div>
      <div className="space-y-3">
        {deliveryOrders.map((d) => (
          <Card key={d._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm">{d.doNumber}</span>
                  <Badge className={`text-xs capitalize ${statusColor(d.status)}`}>{d.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{d.driverName} • {d.vehicleNumber} • Qty: {d.quantityTotal}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {d.status === "prepared" && <Button size="sm" onClick={() => updateStatus({ id: d._id, status: "loaded" })}>Load</Button>}
              {d.status === "loaded" && <Button size="sm" onClick={() => updateStatus({ id: d._id, status: "in_transit" })}>Kirim</Button>}
              {d.status === "in_transit" && <Button size="sm" onClick={() => updateStatus({ id: d._id, status: "delivered", signedBy: d.driverName })}>Selesai</Button>}
            </div>
          </CardContent></Card>
        ))}
        {deliveryOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada delivery orders.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Buat DO</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nomor DO" value={form.doNumber} onChange={(e) => setForm((f) => ({ ...f, doNumber: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2"><Input placeholder="Driver" value={form.driverName} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} /><Input placeholder="No. Kendaraan" value={form.vehicleNumber} onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))} /></div>
            <Input type="number" placeholder="Jumlah Total" value={form.quantityTotal || ""} onChange={(e) => setForm((f) => ({ ...f, quantityTotal: +e.target.value }))} />
            <Button onClick={save} className="w-full">Buat DO</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
