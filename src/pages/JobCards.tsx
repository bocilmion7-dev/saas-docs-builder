import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Car, User, Clock, Plus } from "lucide-react";

const AREAS = ["mesin", "kelistrikan", "underchassis", "body_paint"] as const;

export default function JobCards() {
  const tenantId = "demo";
  const jobCards = useQuery(api.bengkel.listJobCards, { tenantId }) ?? [];
  const vehicles = useQuery(api.bengkel.listVehicles, { tenantId }) ?? [];
  const mechanics = useQuery(api.bengkel.listMechanics, { tenantId }) ?? [];
  const createJobCard = useMutation(api.bengkel.createJobCard);
  const updateJobCard = useMutation(api.bengkel.updateJobCard);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ workOrderId: "", area: "mesin", title: "", mechanicId: "" });

  const save = async () => {
    if (!form.title) return;
    await createJobCard({ tenantId, ...form, status: "queue" });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { queue: "bg-gray-100", in_progress: "bg-blue-100 text-blue-800", waiting_parts: "bg-yellow-100 text-yellow-800", finished: "bg-green-100 text-green-800", rework: "bg-red-100 text-red-800" };
    return m[s] ?? "";
  };
  const areaColor = (a: string) => {
    const m: Record<string, string> = { mesin: "bg-red-100 text-red-800", kelistrikan: "bg-yellow-100 text-yellow-800", underchassis: "bg-blue-100 text-blue-800", body_paint: "bg-purple-100 text-purple-800" };
    return m[a] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Job Cards</h1><p className="text-sm text-muted-foreground">Mesin • Kelistrikan • Underchassis • Body Paint</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat Job Card</Button>
      </div>
      <div className="space-y-3">
        {jobCards.map((jc) => {
          const mech = mechanics.find((m) => m._id === jc.mechanicId);
          return (
            <Card key={jc._id}><CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs capitalize ${areaColor(jc.area)}`}>{jc.area.replace("_", " ")}</Badge>
                  <Badge className={`text-xs capitalize ${statusColor(jc.status)}`}>{jc.status.replace("_", " ")}</Badge>
                </div>
                <p className="font-semibold mt-1">{jc.title}</p>
                {mech && <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> {mech.name}</p>}
              </div>
              <div className="flex gap-1">
                {!mech && jc.status === "queue" && <Button size="sm" variant="outline" onClick={() => updateJobCard({ id: jc._id, status: "in_progress" })}>Mulai</Button>}
                {jc.status === "in_progress" && <Button size="sm" onClick={() => updateJobCard({ id: jc._id, status: "finished" })}>Selesai</Button>}
              </div>
            </CardContent></Card>
          );
        })}
        {jobCards.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada job card.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Buat Job Card</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Work Order</label><select value={form.workOrderId} onChange={(e) => setForm((f) => ({ ...f, workOrderId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih WO...</option></select></div>
            <div><label className="text-xs">Area</label><div className="flex flex-wrap gap-1 mt-1">{AREAS.map((a) => <Badge key={a} variant={form.area === a ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setForm((f) => ({ ...f, area: a }))}>{a.replace("_", " ")}</Badge>)}</div></div>
            <Input placeholder="Judul pekerjaan" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <div><label className="text-xs">Assign Mekanik</label><select value={form.mechanicId} onChange={(e) => setForm((f) => ({ ...f, mechanicId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Belum ditugaskan</option>{mechanics.map((m) => <option key={m._id} value={m._id}>{m.name} ({m.specialization})</option>)}</select></div>
            <Button onClick={save} className="w-full">Buat</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
