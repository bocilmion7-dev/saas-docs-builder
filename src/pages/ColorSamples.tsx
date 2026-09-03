import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Paintbrush, Trash2 } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function ColorSamples() {
  const tenantId = useTenantId() ?? "";
  const samples = useQuery(api.tokoCat.listSamples, { tenantId }) ?? [];
  const createSample = useMutation(api.tokoCat.createSample);
  const updateStatus = useMutation(api.tokoCat.updateSampleStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ colorCode: "", volumeMl: 100, testerPrice: 5000 });

  const save = async () => {
    if (!form.colorCode) return;
    await createSample({ tenantId, colorCode: form.colorCode, volumeMl: form.volumeMl, testerPrice: form.testerPrice });
    setDialogOpen(false);
    setForm({ colorCode: "", volumeMl: 100, testerPrice: 5000 });
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { requested: "bg-yellow-100 text-yellow-800", mixed: "bg-blue-100 text-blue-800", ready: "bg-green-100 text-green-800", delivered: "bg-gray-100 text-gray-800" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Color Samples</h1><p className="text-sm text-muted-foreground">Kelola sampel warna untuk customer</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat Sample</Button>
      </div>
      <div className="space-y-3">
        {samples.map((s) => (
          <Card key={s._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Paintbrush className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-semibold font-mono">{s.colorCode}</p>
                <p className="text-xs text-muted-foreground">{s.volumeMl}ml • {formatRp(s.testerPrice)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs capitalize ${statusColor(s.status)}`}>{s.status}</Badge>
              {s.status === "requested" && <Button size="sm" onClick={() => updateStatus({ id: s._id, status: "mixed" })}>Mix</Button>}
              {s.status === "mixed" && <Button size="sm" onClick={() => updateStatus({ id: s._id, status: "ready" })}>Ready</Button>}
            </div>
          </CardContent></Card>
        ))}
        {samples.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada color samples.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Buat Color Sample</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Color Code (N-1, C-15)" value={form.colorCode} onChange={(e) => setForm((f) => ({ ...f, colorCode: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs">Volume (ml)</label><Input type="number" value={form.volumeMl} onChange={(e) => setForm((f) => ({ ...f, volumeMl: +e.target.value }))} /></div>
              <div><label className="text-xs">Harga Tester (Rp)</label><Input type="number" value={form.testerPrice} onChange={(e) => setForm((f) => ({ ...f, testerPrice: +e.target.value }))} /></div>
            </div>
            <Button onClick={save} className="w-full">Buat</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
