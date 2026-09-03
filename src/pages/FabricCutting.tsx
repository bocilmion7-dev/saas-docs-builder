import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Scissors } from "lucide-react";

export default function FabricCutting() {
  const tenantId = useTenantId() ?? "";
  const cuts = useQuery(api.kain.listCuts, { tenantId }) ?? [];
  const rolls = useQuery(api.kain.listRolls, { tenantId }) ?? [];
  const createCut = useMutation(api.kain.createCut);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ rollId: "", requestedMeter: 0, extraMeter: 0, motifMatching: false, isPrecise: true, notes: "" });

  const save = async () => {
    if (!form.rollId || form.requestedMeter <= 0) return;
    await createCut({ tenantId, ...form });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Fabric Cutting</h1><p className="text-sm text-muted-foreground">Potong kain — otomatis kurangi roll & buat remnants jika {"<"} 0.5m</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Potong Baru</Button>
      </div>
      <div className="space-y-3">
        {cuts.map((c: any) => {
          const roll = rolls.find((r: any) => r._id === c.rollId);
          return (
            <Card key={c._id}><CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scissors className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold">Roll: {roll?.rollNumber ?? c.rollId}</p>
                  <p className="text-xs text-muted-foreground">Minta: {c.requestedMeter}m • Actual: {c.lengthActual}m • Extra: {c.extraMeter}% {c.motifMatching ? "(motif)" : ""}</p>
                </div>
              </div>
            </CardContent></Card>
          );
        })}
        {cuts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada pemotongan.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Potong Kain</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Roll</label><select value={form.rollId} onChange={(e) => setForm((f) => ({ ...f, rollId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih roll...</option>{rolls.map((r: any) => <option key={r._id} value={r._id}>{r.rollNumber} — {r.remainingMeter}m tersisa</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs">Meter Diminta</label><Input type="number" value={form.requestedMeter || ""} onChange={(e) => setForm((f) => ({ ...f, requestedMeter: +e.target.value }))} /></div><div><label className="text-xs">Extra % (motif)</label><Input type="number" value={form.extraMeter} onChange={(e) => setForm((f) => ({ ...f, extraMeter: +e.target.value }))} /></div></div>
            <div className="flex gap-3 text-xs"><label><input type="checkbox" checked={form.motifMatching} onChange={(e) => setForm((f) => ({ ...f, motifMatching: e.target.checked }))} /> Motif matching</label><label><input type="checkbox" checked={form.isPrecise} onChange={(e) => setForm((f) => ({ ...f, isPrecise: e.target.checked }))} /> Precise cut</label></div>
            <Input placeholder="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <Button onClick={save} className="w-full">Potong</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
