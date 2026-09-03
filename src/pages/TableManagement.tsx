import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Grid3X3, Trash2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800", reserved: "bg-blue-100 text-blue-800",
  occupied: "bg-red-100 text-red-800", waiting_payment: "bg-amber-100 text-amber-800",
  cleaning: "bg-yellow-100 text-yellow-800", out_of_service: "bg-gray-100 text-gray-800",
};
const STATUS_CYCLE = ["available", "occupied", "waiting_payment", "cleaning", "available"];

export default function TableManagement() {
  const tenantId = useTenantId() ?? "";
  const tables = useQuery(api.cafeResto.listTables, { tenantId }) ?? [];
  const createTable = useMutation(api.cafeResto.createTable);
  const updateStatus = useMutation(api.cafeResto.updateTableStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ number: 1, capacity: 4, area: "indoor" });

  const save = async () => {
    await createTable({ tenantId, ...form });
    setDialogOpen(false);
    setForm({ number: tables.length + 1, capacity: 4, area: "indoor" });
  };

  const cycleStatus = async (table: any) => {
    const idx = STATUS_CYCLE.indexOf(table.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    await updateStatus({ id: table._id, status: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Table Management</h1><p className="text-sm text-muted-foreground">6 status: available → occupied → waiting_payment → cleaning → available</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Meja</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tables.map((t) => (
          <Card key={t._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => cycleStatus(t)}>
            <CardContent className="p-4 text-center">
              <Grid3X3 className={`h-8 w-8 mx-auto mb-2 ${t.status === "available" ? "text-green-600" : t.status === "occupied" ? "text-red-600" : "text-amber-600"}`} />
              <p className="text-2xl font-bold">#{t.number}</p>
              <p className="text-xs text-muted-foreground">{t.capacity} pax • {t.area}</p>
              <Badge className={`mt-2 text-xs capitalize ${STATUS_COLORS[t.status] ?? ""}`}>{t.status.replace("_", " ")}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      {tables.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada meja. Klik "Tambah Meja" untuk menambah.</p>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Meja</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Nomor Meja</label><Input type="number" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: +e.target.value }))} /></div>
            <div><label className="text-xs font-medium">Kapasitas</label><Input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: +e.target.value }))} /></div>
            <div><label className="text-xs font-medium">Area</label><select value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
              <option>indoor</option><option>outdoor</option><option>non_smoking</option><option>vip_room</option>
            </select></div>
            <Button onClick={save} className="w-full">Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
