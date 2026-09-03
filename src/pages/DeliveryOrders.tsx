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
  const dos = useQuery(api.tokoCat.listDeliveryOrders, { tenantId }) ?? [];
  const createDO = useMutation(api.tokoCat.createDeliveryOrder);
  const updateStatus = useMutation(api.tokoCat.updateDeliveryStatus);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ doNumber: "", vehicleNumber: "", driverName: "", quantityTotal: 0 });

  const save = async () => { await createDO({ tenantId, ...form }); setDialogOpen(false); setForm({ doNumber: "", vehicleNumber: "", driverName: "", quantityTotal: 0 }); };
  const statusColor = (s: string) => { const m: Record<string, string> = { prepared: "bg-yellow-100 text-yellow-800", shipped: "bg-blue-100 text-blue-800", received: "bg-green-100 text-green-800" }; return m[s] ?? ""; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Delivery Orders</h1><p className="text-sm text-muted-foreground">DO Surat Jalan • Vehicle • Driver • Signed by</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat DO</Button>
      </div>
      <div className="space-y-3">
        {dos.map((d) => (
          <Card key={d._id}><CardContent className="p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4" /><span className="font-mono text-xs font-bold">{d.doNumber}</span><Badge className={`text-xs ${statusColor(d.status)}`}>{d.status}</Badge></div>
              <p className="text-xs text-muted-foreground mt-1">🚗 {d.vehicleNumber} • 👤 {d.driverName} • 📦 {d.quantityTotal} pail/kg</p>
              {d.signedBy && <p className="text-xs text-green-700">✅ Signed: {d.signedBy}</p>}
            </div>
            {d.status === "prepared" && <Button size="sm" onClick={() => updateStatus({ id: d._id, status: "shipped" })}>Ship</Button>}
            {d.status === "shipped" && <Button size="sm" onClick={() => updateStatus({ id: d._id, status: "received", signedBy: "Penerima" })}>Received</Button>}
          </CardContent></Card>
        ))}
        {dos.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada delivery order.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Buat DO</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="DO Number" value={form.doNumber} onChange={(e) => setForm((f) => ({ ...f, doNumber: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2"><Input placeholder="Nomor kendaraan" value={form.vehicleNumber} onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))} /><Input placeholder="Nama driver" value={form.driverName} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} /></div>
            <Input type="number" placeholder="Jumlah total" value={form.quantityTotal || ""} onChange={(e) => setForm((f) => ({ ...f, quantityTotal: +e.target.value }))} />
            <Button onClick={save} className="w-full">Buat DO</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
