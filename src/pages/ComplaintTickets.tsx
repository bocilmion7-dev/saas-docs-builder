import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, AlertTriangle } from "lucide-react";

export default function ComplaintTickets() {
  const tenantId = "demo";
  const tickets = useQuery(api.tokoCat.listComplaints, { tenantId }) ?? [];
  const createTicket = useMutation(api.tokoCat.createComplaint);
  const updateTicket = useMutation(api.tokoCat.updateComplaint);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: "warna_tidak_sesuai", description: "" });

  const save = async () => {
    if (!form.description) return;
    await createTicket({ tenantId, type: form.type, description: form.description });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { open: "bg-red-100 text-red-800", investigating: "bg-yellow-100 text-yellow-800", resolved: "bg-green-100 text-green-800", closed: "bg-gray-100 text-gray-800" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Complaint Tickets</h1><p className="text-sm text-muted-foreground">Kelola komplain pelanggan</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Ticket Baru</Button>
      </div>
      <div className="space-y-3">
        {tickets.map((t) => (
          <Card key={t._id}><CardContent className="p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <Badge className={`text-xs capitalize ${statusColor(t.status)}`}>{t.status}</Badge>
                <span className="text-xs text-muted-foreground capitalize">{t.type.replace(/_/g, " ")}</span>
              </div>
              <p className="text-sm mt-1">{t.description}</p>
              {t.resolution && <p className="text-xs text-green-700 mt-1">✓ {t.resolution}</p>}
            </div>
            {t.status === "open" && <Button size="sm" onClick={() => updateTicket({ id: t._id, status: "investigating" })}>Investigate</Button>}
            {t.status === "investigating" && <Button size="sm" onClick={() => updateTicket({ id: t._id, status: "resolved", resolution: "Ditindaklanjuti" })}>Resolve</Button>}
          </CardContent></Card>
        ))}
        {tickets.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada complaint tickets.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Ticket Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="warna_tidak_sesuai">Warna Tidak Sesuai</option>
              <option value="kualitas_cat">Kualitas Cat</option>
              <option value="pengiriman">Pengiriman</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <Input placeholder="Deskripsi komplain" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Button onClick={save} className="w-full">Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
