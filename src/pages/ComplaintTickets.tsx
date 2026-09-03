import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export default function ComplaintTickets() {
  const tenantId = "demo";
  const tickets = useQuery(api.tokoCat.listComplaints, { tenantId }) ?? [];
  const createComplaint = useMutation(api.tokoCat.createComplaint);
  const updateComplaint = useMutation(api.tokoCat.updateComplaint);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: "warna_tidak_sesuai", description: "" });

  const save = async () => { await createComplaint({ tenantId, ...form }); setDialogOpen(false); setForm({ type: "warna_tidak_sesuai", description: "" }); };
  const statusColor = (s: string) => { const m: Record<string, string> = { open: "bg-red-100 text-red-800", investigating: "bg-yellow-100 text-yellow-800", approved_rts: "bg-blue-100 text-blue-800", rejected: "bg-gray-100 text-gray-800", replaced: "bg-green-100 text-green-800", refunded: "bg-purple-100 text-purple-800" }; return m[s] ?? ""; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Complaint Tickets</h1><p className="text-sm text-muted-foreground">Warna tidak sesuai • Cat menggumpal • Kemasan rusak</p></div>
        <Button onClick={() => setDialogOpen(true)}>Buat Tiket</Button>
      </div>
      <div className="space-y-3">
        {tickets.map((t) => (
          <Card key={t._id} className="border-l-4 border-l-amber-400"><CardContent className="p-3">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><Badge className={`text-xs capitalize ${statusColor(t.status)}`}>{t.status.replace(/_/g, " ")}</Badge><Badge variant="outline" className="text-xs">{t.type.replace(/_/g, " ")}</Badge></div>
            <p className="text-sm mt-2">{t.description}</p>
            {t.investigationResult && <p className="text-xs text-muted-foreground mt-1">🔍 {t.investigationResult}</p>}
            {t.resolution && <p className="text-xs text-green-700 mt-1">✅ {t.resolution}</p>}
            <div className="flex gap-1 mt-2">
              {t.status === "open" && <Button size="sm" variant="outline" onClick={() => updateComplaint({ id: t._id, status: "investigating" })}>Investigate</Button>}
              {t.status === "investigating" && <><Button size="sm" onClick={() => updateComplaint({ id: t._id, status: "replaced", resolution: "Ganti baru gratis" })}>Approve</Button><Button size="sm" variant="destructive" onClick={() => updateComplaint({ id: t._id, status: "rejected" })}>Reject</Button></>}
            </div>
          </CardContent></Card>
        ))}
        {tickets.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada complaint.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Buat Complaint</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="warna_tidak_sesuai">Warna tidak sesuai</option><option value="cat_menggumpal">Cat menggumpal</option><option value="tidak_menutup">Tidak menutup</option><option value="kemasan_rusak">Kemasan rusak</option></select>
            <Input placeholder="Deskripsi keluhan" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
