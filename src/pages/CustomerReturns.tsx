import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, AlertTriangle } from "lucide-react";

export default function CustomerReturns() {
  const tenantId = useTenantId() ?? "";
  const returns = useQuery(api.sparepart.listReturns, { tenantId }) ?? [];
  const createReturn = useMutation(api.sparepart.createReturn);
  const updateStatus = useMutation(api.sparepart.updateReturnStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ orderId: "", productId: "", reason: "", condition: "rusak", withinThreeDays: true, refundMethod: "tunai" });

  const save = async () => {
    if (!form.orderId || !form.productId || !form.reason) return;
    await createReturn({ tenantId, ...form });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", approved: "bg-blue-100 text-blue-800", refunded: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Customer Returns</h1><p className="text-sm text-muted-foreground">Retur part dari pelanggan ({'<'} 3 hari, kondisi, metode refund)</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Retur Baru</Button>
      </div>
      <div className="space-y-3">
        {returns.map((r: any) => (
          <Card key={r._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs capitalize ${statusColor(r.status)}`}>{r.status}</Badge>
                  {r.withinThreeDays && <Badge variant="outline" className="text-xs bg-green-100 text-green-800">{"< 3 hari"}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{r.reason} • Kondisi: {r.condition} • Refund: {r.refundMethod}</p>
              </div>
            </div>
            {r.status === "pending" && (
              <div className="flex gap-1">
                <Button size="sm" onClick={() => updateStatus({ id: r._id, status: "approved" })}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus({ id: r._id, status: "rejected" })}>Reject</Button>
              </div>
            )}
            {r.status === "approved" && <Button size="sm" onClick={() => updateStatus({ id: r._id, status: "refunded" })}>Refund</Button>}
          </CardContent></Card>
        ))}
        {returns.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada retur.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Retur Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Order ID" value={form.orderId} onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))} />
            <Input placeholder="Product ID" value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} />
            <Input placeholder="Alasan retur" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
            <div className="flex gap-2">{["rusak", "cacat", "salah_kirim"].map((c) => <Button key={c} size="sm" variant={form.condition === c ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, condition: c }))} className="text-xs capitalize">{c.replace("_", " ")}</Button>)}</div>
            <div className="flex gap-2">{["tunai", "tukar_barang", "kredit"].map((m) => <Button key={m} size="sm" variant={form.refundMethod === m ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, refundMethod: m }))} className="text-xs capitalize">{m.replace("_", " ")}</Button>)}</div>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.withinThreeDays} onChange={(e) => setForm((f) => ({ ...f, withinThreeDays: e.target.checked }))} /> Dalam 3 hari</label>
            <Button onClick={save} className="w-full">Submit Retur</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
