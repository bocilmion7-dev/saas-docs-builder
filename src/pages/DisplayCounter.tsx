import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Boxes, Thermometer } from "lucide-react";

export default function DisplayCounter() {
  const tenantId = useTenantId() ?? "";
  const counters = useQuery(api.bakery.listCounters, { tenantId }) ?? [];
  const createCounter = useMutation(api.bakery.createCounter);
  const updateCounter = useMutation(api.bakery.updateCounter);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "chiller", temperatureTarget: 4 });

  const save = async () => {
    if (!form.name) return;
    await createCounter({ tenantId, name: form.name, type: form.type, temperatureTarget: form.temperatureTarget, status: "active" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Display Counter & Chiller</h1><p className="text-sm text-muted-foreground">Monitor suhu dan stok display counter</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Counter</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {counters.map((c) => (
          <Card key={c._id}><CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold flex items-center gap-2"><Boxes className="h-4 w-4" />{c.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{c.type}</p>
              </div>
              <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Thermometer className="h-3 w-3" /> Target: {c.temperatureTarget}°C
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => updateCounter({ id: c._id, status: c.status === "active" ? "maintenance" : "active" })}>
                {c.status === "active" ? "Maintenance" : "Aktifkan"}
              </Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
      {counters.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada display counter.</p>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Counter</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama Counter" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="flex gap-2">
              {["chiller", "freezer", "room_temp", "shelf"].map((t) => <Button key={t} size="sm" variant={form.type === t ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, type: t }))} className="capitalize text-xs">{t.replace("_", " ")}</Button>)}
            </div>
            <Input type="number" placeholder="Target Suhu (°C)" value={form.temperatureTarget} onChange={(e) => setForm((f) => ({ ...f, temperatureTarget: +e.target.value }))} />
            <Button onClick={save} className="w-full">Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
