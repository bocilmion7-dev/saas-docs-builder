import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Car, Edit, Trash2, Search } from "lucide-react";

export default function VehicleDB() {
  const tenantId = "demo";
  const [search, setSearch] = useState("");
  const vehicles = useQuery(api.bengkel.listVehicles, { tenantId, search: search || undefined }) ?? [];
  const createVehicle = useMutation(api.bengkel.createVehicle);
  const updateVehicle = useMutation(api.bengkel.updateVehicle);
  const removeVehicle = useMutation(api.bengkel.removeVehicle);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ plateNumber: "", brand: "", model: "", year: 2020, engineType: "", vinNumber: "", kmLast: 0 });

  const openNew = () => { setEditing(null); setForm({ plateNumber: "", brand: "", model: "", year: 2020, engineType: "", vinNumber: "", kmLast: 0 }); setDialogOpen(true); };
  const openEdit = (v: any) => { setEditing(v); setForm({ plateNumber: v.plateNumber, brand: v.brand, model: v.model, year: v.year, engineType: v.engineType ?? "", vinNumber: v.vinNumber ?? "", kmLast: v.kmLast ?? 0 }); setDialogOpen(true); };

  const save = async () => {
    if (!form.plateNumber || !form.brand) return;
    if (editing) { await updateVehicle({ id: editing._id, ...form }); }
    else { await createVehicle({ tenantId, ...form }); }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Vehicle Database</h1><p className="text-sm text-muted-foreground">Plat unik per tenant • VIN • KM last service</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Tambah Kendaraan</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari plat/brand/model..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
      <div className="space-y-2">
        {vehicles.map((v) => (
          <Card key={v._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Car className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="font-semibold font-mono">{v.plateNumber}</p>
                <p className="text-xs text-muted-foreground">{v.brand} {v.model} {v.year} • {v.engineType} • KM: {v.kmLast?.toLocaleString()}</p>
                {v.vinNumber && <p className="text-xs text-muted-foreground font-mono">VIN: {v.vinNumber}</p>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => openEdit(v)}><Edit className="h-3 w-3" /></Button>
              <Button size="sm" variant="destructive" onClick={() => removeVehicle({ id: v._id })}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {vehicles.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada kendaraan terdaftar.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Kendaraan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Plat Nomor</label><Input value={form.plateNumber} onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value.toUpperCase() }))} placeholder="B1234CD" /></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-medium">Brand</label><Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Toyota" /></div><div><label className="text-xs font-medium">Model</label><Input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="Avanza" /></div></div>
            <div className="grid grid-cols-3 gap-2"><div><label className="text-xs font-medium">Tahun</label><Input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))} /></div><div><label className="text-xs font-medium">Mesin</label><Input value={form.engineType} onChange={(e) => setForm((f) => ({ ...f, engineType: e.target.value }))} placeholder="1.5L" /></div><div><label className="text-xs font-medium">KM</label><Input type="number" value={form.kmLast} onChange={(e) => setForm((f) => ({ ...f, kmLast: +e.target.value }))} /></div></div>
            <div><label className="text-xs font-medium">VIN (opsional)</label><Input value={form.vinNumber} onChange={(e) => setForm((f) => ({ ...f, vinNumber: e.target.value }))} /></div>
            <Button onClick={save} className="w-full">{editing ? "Simpan" : "Tambah"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
