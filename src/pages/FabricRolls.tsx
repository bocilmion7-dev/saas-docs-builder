import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Scissors, AlertTriangle, Search } from "lucide-react";

export default function FabricRolls() {
  const tenantId = "demo";
  const [search, setSearch] = useState("");
  const rolls = useQuery(api.kain.listRolls, { tenantId, search: search || undefined }) ?? [];
  const createRoll = useMutation(api.kain.createRoll);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", rollNumber: "", totalMeter: 25, widthCm: 150 });

  const save = async () => {
    if (!form.rollNumber) return;
    await createRoll({ tenantId, ...form });
    setDialogOpen(false);
    setForm({ productId: "", rollNumber: "", totalMeter: 25, widthCm: 150 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Fabric Rolls</h1><p className="text-sm text-muted-foreground">Roll 25-100m • Lebar 115/150/240cm • Remaining meter tracking</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Roll</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari roll number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
      <div className="space-y-2">
        {rolls.map((r) => {
          const pct = r.totalMeter > 0 ? (r.remainingMeter / r.totalMeter) * 100 : 0;
          return (
            <Card key={r._id}><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Scissors className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{r.rollNumber}</span>
                      {r.remainingMeter < 0.5 && <Badge variant="destructive" className="text-xs">Remnant!</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">Width: {r.widthCm}cm • Total: {r.totalMeter}m</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{r.remainingMeter.toFixed(1)}m <span className="text-xs text-muted-foreground">tersisa</span></p>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1"><div className={`h-1.5 rounded-full ${pct > 30 ? "bg-green-500" : pct > 10 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} /></div>
                </div>
              </div>
            </CardContent></Card>
          );
        })}
        {rolls.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada roll kain.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Roll</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Roll Number</label><Input value={form.rollNumber} onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))} placeholder="RL-001" /></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-medium">Total Meter</label><Input type="number" value={form.totalMeter} onChange={(e) => setForm((f) => ({ ...f, totalMeter: +e.target.value }))} /></div><div><label className="text-xs font-medium">Lebar (cm)</label><Input type="number" value={form.widthCm} onChange={(e) => setForm((f) => ({ ...f, widthCm: +e.target.value }))} /></div></div>
            <Button onClick={save} className="w-full">Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
