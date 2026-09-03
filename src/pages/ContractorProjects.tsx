import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";

export default function ContractorProjects() {
  const tenantId = "demo";
  const projects = useQuery(api.tokoCat.listContractorProjects, { tenantId }) ?? [];
  const createProject = useMutation(api.tokoCat.createContractorProject);
  const updateStatus = useMutation(api.tokoCat.updateProjectStatus);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", customerName: "", luasTotalM2: 100, totalValue: 10000000, paymentType: "termin" });

  const save = async () => { await createProject({ tenantId, name: form.name, luasTotalM2: form.luasTotalM2, totalValue: form.totalValue, paymentType: form.paymentType }); setDialogOpen(false); };
  const statusColor = (s: string) => { const m: Record<string, string> = { survey: "bg-gray-100", penawaran: "bg-yellow-100", approved: "bg-blue-100 text-blue-800", pengerjaan: "bg-purple-100 text-purple-800", selesai: "bg-green-100 text-green-800", termin: "bg-amber-100 text-amber-800" }; return m[s] ?? ""; };
  const nextStatus = (s: string) => { const flow: Record<string, string> = { survey: "penawaran", penawaran: "approved", approved: "pengerjaan", pengerjaan: "selesai", selesai: "termin" }; return flow[s] ?? null; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Contractor Projects</h1><p className="text-sm text-muted-foreground">Survey → Penawaran → Approved → Pengerjaan → Termin Net30/60</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Proyek Baru</Button>
      </div>
      <div className="space-y-3">
        {projects.map((p) => {
          const ns = nextStatus(p.status);
          return (
            <Card key={p._id}><CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4" /><Badge className={`text-xs capitalize ${statusColor(p.status)}`}>{p.status}</Badge><Badge variant="outline" className="text-xs capitalize">{p.paymentType}</Badge></div>
                <p className="font-semibold mt-1">{p.name}</p>
                <p className="text-xs text-muted-foreground">Luas: {p.luasTotalM2}m² • Total: Rp {p.totalValue.toLocaleString("id")}</p>
              </div>
              {ns && <Button size="sm" onClick={() => updateStatus({ id: p._id, status: ns })}>→ {ns}</Button>}
            </CardContent></Card>
          );
        })}
        {projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada proyek.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Proyek Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama proyek" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs">Luas (m²)</label><Input type="number" value={form.luasTotalM2} onChange={(e) => setForm((f) => ({ ...f, luasTotalM2: +e.target.value }))} /></div><div><label className="text-xs">Total (Rp)</label><Input type="number" value={form.totalValue} onChange={(e) => setForm((f) => ({ ...f, totalValue: +e.target.value }))} /></div></div>
            <select value={form.paymentType} onChange={(e) => setForm((f) => ({ ...f, paymentType: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option>tunai</option><option>termin</option><option>tempo</option></select>
            <Button onClick={save} className="w-full">Buat Proyek</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
