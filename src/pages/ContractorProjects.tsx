import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, HardHat } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const PROJECT_STATUSES = ["survey", "quoting", "confirmed", "in_progress", "completed"];

export default function ContractorProjects() {
  const tenantId = "demo";
  const projects = useQuery(api.tokoCat.listContractorProjects, { tenantId }) ?? [];
  const createProject = useMutation(api.tokoCat.createContractorProject);
  const updateStatus = useMutation(api.tokoCat.updateProjectStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", luasTotalM2: 0, totalValue: 0, paymentType: "cash" });

  const save = async () => {
    if (!form.name) return;
    await createProject({ tenantId, name: form.name, location: form.location || undefined, luasTotalM2: form.luasTotalM2, totalValue: form.totalValue, paymentType: form.paymentType });
    setDialogOpen(false);
  };

  const nextStatus = (s: string) => { const i = PROJECT_STATUSES.indexOf(s); return i < PROJECT_STATUSES.length - 1 ? PROJECT_STATUSES[i + 1] : null; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Proyek Kontraktor</h1><p className="text-sm text-muted-foreground">Kelola proyek pengecatan kontraktor</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Proyek Baru</Button>
      </div>
      <div className="space-y-3">
        {projects.map((p) => {
          const ns = nextStatus(p.status);
          return (
            <Card key={p._id}><CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{p.name}</span>
                  <Badge className="text-xs capitalize">{p.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{p.location} • {p.luasTotalM2}m² • {formatRp(p.totalValue)} • {p.paymentType}</p>
              </div>
              {ns && <Button size="sm" onClick={() => updateStatus({ id: p._id, status: ns })}>→ {ns.replace("_", " ")}</Button>}
            </CardContent></Card>
          );
        })}
        {projects.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada proyek.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Proyek Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama Proyek" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Lokasi" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2"><Input type="number" placeholder="Luas (m²)" value={form.luasTotalM2 || ""} onChange={(e) => setForm((f) => ({ ...f, luasTotalM2: +e.target.value }))} /><Input type="number" placeholder="Total Value (Rp)" value={form.totalValue || ""} onChange={(e) => setForm((f) => ({ ...f, totalValue: +e.target.value }))} /></div>
            <select value={form.paymentType} onChange={(e) => setForm((f) => ({ ...f, paymentType: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="cash">Cash</option><option value="tempo">Tempo</option><option value="termin">Termin</option></select>
            <Button onClick={save} className="w-full">Buat Proyek</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
