import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Scissors, AlertTriangle } from "lucide-react";

export default function FabricCutting() {
  const tenantId = "demo";
  const rolls = useQuery(api.kain.listRolls, { tenantId }) ?? [];
  const cuts = useQuery(api.kain.listCuts, { tenantId }) ?? [];
  const createCut = useMutation(api.kain.createCut);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ rollId: "", requestedMeter: 2.5, extraMeter: 10, motifMatching: true, isPrecise: true });

  const save = async () => { if (!form.rollId) return; await createCut({ tenantId, ...form }); setDialogOpen(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Fabric Cutting</h1><p className="text-sm text-muted-foreground">Motif matching +extra 5-10cm • Sisa &lt;0.5m auto remnants</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Cut Baru</Button>
      </div>
      <div className="space-y-3">
        {cuts.map((c) => (
          <Card key={c._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">Roll: {c.rollId.slice(-6)}</p>
                <div className="flex items-center gap-2 text-xs"><span>Minta: {c.requestedMeter}m</span><span>→ Potong: {c.lengthActual.toFixed(2)}m</span>
                  {c.motifMatching && <Badge className="text-xs bg-purple-100 text-purple-800">Motif +{c.extraMeter}cm</Badge>}</div>
              </div>
            </div>
          </CardContent></Card>
        ))}
        {cuts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada cutting.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Fabric Cut</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Pilih Roll</label><select value={form.rollId} onChange={(e) => setForm((f) => ({ ...f, rollId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih roll...</option>{rolls.map((r) => <option key={r._id} value={r._id}>{r.rollNumber} ({r.remainingMeter}m tersisa)</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs">Minta (m)</label><Input type="number" step="0.1" value={form.requestedMeter} onChange={(e) => setForm((f) => ({ ...f, requestedMeter: +e.target.value }))} /></div><div><label className="text-xs">Extra (cm)</label><Input type="number" value={form.extraMeter} onChange={(e) => setForm((f) => ({ ...f, extraMeter: +e.target.value }))} /></div></div>
            <Button onClick={save} className="w-full">Potong</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
