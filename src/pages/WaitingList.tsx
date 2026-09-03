import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Users, Phone, Clock } from "lucide-react";

export default function WaitingList() {
  const tenantId = useTenantId() ?? "";
  const entries = useQuery(api.cafeResto.listWaiting, { tenantId }) ?? [];
  const createWaiting = useMutation(api.cafeResto.createWaiting);
  const updateStatus = useMutation(api.cafeResto.updateWaitingStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ customerName: "", phone: "", guestCount: 2, estimatedWaitMinutes: 15 });
  const waitingCount = entries.filter((e) => e.status === "waiting").length;

  const save = async () => {
    await createWaiting({ tenantId, ...form });
    setDialogOpen(false);
    setForm({ customerName: "", phone: "", guestCount: 2, estimatedWaitMinutes: 15 });
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { waiting: "bg-yellow-100 text-yellow-800", called: "bg-blue-100 text-blue-800", seated: "bg-green-100 text-green-800", cancelled: "bg-gray-100 text-gray-800" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Waiting List</h1><p className="text-sm text-muted-foreground">{waitingCount} menunggu meja</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Antrian</Button>
      </div>
      <div className="space-y-3">
        {entries.map((e, idx) => (
          <Card key={e._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-800">{idx + 1}</div>
              <div>
                <p className="font-semibold">{e.customerName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {e.guestCount} pax</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {e.phone}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> est. {e.estimatedWaitMinutes}m</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs capitalize ${statusColor(e.status)}`}>{e.status}</Badge>
              {e.status === "waiting" && <Button size="sm" onClick={() => updateStatus({ id: e._id, status: "called" })}>Panggil</Button>}
              {e.status === "called" && <Button size="sm" onClick={() => updateStatus({ id: e._id, status: "seated" })}>Dudukkan</Button>}
            </div>
          </CardContent></Card>
        ))}
        {entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Tidak ada antrian.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Antrian</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama customer" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
            <Input placeholder="Telepon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs">Pax</label><Input type="number" value={form.guestCount} onChange={(e) => setForm((f) => ({ ...f, guestCount: +e.target.value }))} /></div>
              <div><label className="text-xs">Est. tunggu (m)</label><Input type="number" value={form.estimatedWaitMinutes} onChange={(e) => setForm((f) => ({ ...f, estimatedWaitMinutes: +e.target.value }))} /></div>
            </div>
            <Button onClick={save} className="w-full">Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
