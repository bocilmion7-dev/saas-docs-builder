import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Snowflake } from "lucide-react";

export default function DisplayCounterPage() {
  const tenantId = "demo";
  const counters = useQuery(api.bakery.listCounters, { tenantId }) ?? [];
  const createCounter = useMutation(api.bakery.createCounter);
  const updateCounter = useMutation(api.bakery.updateCounter);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "chiller", temperatureTarget: 12 });

  const save = async () => { await createCounter({ tenantId, ...form, status: "active" }); setDialogOpen(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Display Counter</h1><p className="text-sm text-muted-foreground">Chiller 10-15°C • Rak roti • FIFO rotation</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Counter</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {counters.map((c) => (
          <Card key={c._id}><CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Snowflake className={`h-5 w-5 ${c.type === "chiller" ? "text-blue-600" : "text-amber-600"}`} /><div><p className="font-semibold">{c.name}</p><p className="text-xs text-muted-foreground">{c.type} • Target: {c.temperatureTarget}°C</p></div></div>
              <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={() => updateCounter({ id: c._id, status: c.status === "active" ? "inactive" : "active" })}>{c.status === "active" ? "Nonaktifkan" : "Aktifkan"}</Button>
          </CardContent></Card>
        ))}
      </div>
      {counters.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada display counter.</p>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Counter</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama counter" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, temperatureTarget: e.target.value === "chiller" ? 12 : 25 }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="chiller">Chiller</option><option value="rak_roti">Rak Roti</option></select>
            <div><label className="text-xs">Target Suhu (°C)</label><Input type="number" value={form.temperatureTarget} onChange={(e) => setForm((f) => ({ ...f, temperatureTarget: +e.target.value }))} /></div>
            <Button onClick={save} className="w-full">Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
