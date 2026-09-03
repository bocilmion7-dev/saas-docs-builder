import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Palette } from "lucide-react";

export default function ColorSamples() {
  const tenantId = "demo";
  const samples = useQuery(api.tokoCat.listSamples, { tenantId }) ?? [];
  const createSample = useMutation(api.tokoCat.createSample);
  const updateStatus = useMutation(api.tokoCat.updateSampleStatus);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ colorCode: "", colorName: "", volumeMl: 250, testerPrice: 25000 });

  const save = async () => {
    if (!form.colorCode) return;
    await createSample({ tenantId, colorCode: form.colorCode, volumeMl: form.volumeMl, testerPrice: form.testerPrice });
    setDialogOpen(false);
    setForm({ colorCode: "", colorName: "", volumeMl: 250, testerPrice: 25000 });
  };
  const statusColor = (s: string) => {
    const m: Record<string, string> = { requested: "bg-gray-100 text-gray-800", mixing: "bg-blue-100 text-blue-800", ready: "bg-yellow-100 text-yellow-800", tested: "bg-purple-100 text-purple-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Color Samples</h1><p className="text-sm text-muted-foreground">Tester 100/250ml • Flow: requested → mixing → ready → tested → approved/rejected</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat Sample</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {samples.map((s) => (
          <Card key={s._id}><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Palette className="h-4 w-4" /><span className="font-mono text-xs">{s.colorCode}</span><Badge className={`text-xs capitalize ${statusColor(s.status)}`}>{s.status}</Badge></div>
            <p className="text-sm font-bold">Rp {s.testerPrice.toLocaleString("id")}</p><p className="text-xs text-muted-foreground">{s.volumeMl}ml</p>
            <div className="flex gap-1 mt-3">
              {s.status === "requested" && <Button size="sm" onClick={() => updateStatus({ id: s._id, status: "mixing" })}>Mulai Mixing</Button>}
              {s.status === "mixing" && <Button size="sm" onClick={() => updateStatus({ id: s._id, status: "ready" })}>Ready</Button>}
              {s.status === "ready" && <Button size="sm" onClick={() => updateStatus({ id: s._id, status: "tested" })}>Tested</Button>}
              {s.status === "tested" && <><Button size="sm" onClick={() => updateStatus({ id: s._id, status: "approved" })}>Approve</Button><Button size="sm" variant="destructive" onClick={() => updateStatus({ id: s._id, status: "rejected" })}>Reject</Button></>}
            </div>
          </CardContent></Card>
        ))}
      </div>
      {samples.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada color sample.</p>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Buat Color Sample</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Color Code (Nippon 4316P)" value={form.colorCode} onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs">Volume (ml)</label><select value={form.volumeMl} onChange={(e) => setForm((f) => ({ ...f, volumeMl: +e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value={100}>100ml</option><option value={250}>250ml</option></select></div><div><label className="text-xs">Harga Tester (Rp)</label><Input type="number" value={form.testerPrice} onChange={(e) => setForm((f) => ({ ...f, testerPrice: +e.target.value }))} /></div></div>
            <Button onClick={save} className="w-full">Buat Sample</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
