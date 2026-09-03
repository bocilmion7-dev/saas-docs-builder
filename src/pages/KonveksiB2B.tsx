import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileText } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function KonveksiB2B() {
  const tenantId = "demo";
  const orders = useQuery(api.kain.listKonveksi, { tenantId }) ?? [];
  const customers = useQuery(api.customers.list, { tenantId }) ?? [];
  const createOrder = useMutation(api.kain.createKonveksi);
  const updateStatus = useMutation(api.kain.updateKonveksiStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ customerId: "", totalRoll: 0, totalMeter: 0, hargaGrosirPerRoll: 0, paymentType: "cash" });

  const save = async () => {
    if (!form.customerId || form.totalRoll <= 0) return;
    const orderCount = orders.length + 1;
    await createOrder({ tenantId, orderNumber: `KVX-${String(orderCount).padStart(3, "0")}`, ...form });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { inquiry: "bg-gray-100 text-gray-800", confirmed: "bg-blue-100 text-blue-800", processing: "bg-yellow-100 text-yellow-800", shipped: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800" };
    return m[s] ?? "";
  };

  const nextStatus = (s: string) => {
    const flow: Record<string, string> = { inquiry: "confirmed", confirmed: "processing", processing: "shipped", shipped: "completed" };
    return flow[s] ?? null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Konveksi B2B</h1><p className="text-sm text-muted-foreground">Order grosir kain untuk konveksi — piutang & termin</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Order Baru</Button>
      </div>
      <div className="space-y-3">
        {orders.map((o: any) => {
          const customer = customers.find((c: any) => c._id === o.customerId);
          const ns = nextStatus(o.status);
          return (
            <Card key={o._id}><CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm">{o.orderNumber}</span>
                    <Badge className={`text-xs capitalize ${statusColor(o.status)}`}>{o.status}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{o.paymentType}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{customer?.name ?? o.customerId} • {o.totalRoll} roll • {o.totalMeter}m • {formatRp(o.hargaGrosirPerRoll)}/roll</p>
                  {o.piutangStatus && <p className="text-xs text-amber-600 mt-1">Piutang: {o.piutangStatus}</p>}
                </div>
              </div>
              {ns && <Button size="sm" onClick={() => updateStatus({ id: o._id, status: ns })}>→ {ns}</Button>}
            </CardContent></Card>
          );
        })}
        {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada konveksi orders.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Order Konveksi Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Customer</label><select value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih customer...</option>{customers.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
            <div className="grid grid-cols-3 gap-2"><div><label className="text-xs">Total Roll</label><Input type="number" value={form.totalRoll || ""} onChange={(e) => setForm((f) => ({ ...f, totalRoll: +e.target.value }))} /></div><div><label className="text-xs">Total Meter</label><Input type="number" value={form.totalMeter || ""} onChange={(e) => setForm((f) => ({ ...f, totalMeter: +e.target.value }))} /></div><div><label className="text-xs">Harga/Roll</label><Input type="number" value={form.hargaGrosirPerRoll || ""} onChange={(e) => setForm((f) => ({ ...f, hargaGrosirPerRoll: +e.target.value }))} /></div></div>
            <div><label className="text-xs">Tipe Pembayaran</label><div className="flex gap-2 mt-1">{["cash", "tempo", "termin"].map((t) => <Button key={t} size="sm" variant={form.paymentType === t ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, paymentType: t }))} className="text-xs capitalize">{t}</Button>)}</div></div>
            <Button onClick={save} className="w-full">Buat Order</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
