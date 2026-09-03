import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Bed, Thermometer } from "lucide-react";

const ROOM_TYPES = ["single", "couple", "vip", "hydrotherapy", "suite"] as const;
const FACILITIES = ["jacuzzi", "sauna", "steam", "private_jacuzzi", "champagne", "heated_bed", "dimmer", "diffuser"];

export default function RoomManagement() {
  const tenantId = useTenantId() ?? "";
  const rooms = useQuery(api.spa.listRooms, { tenantId }) ?? [];
  const createRoom = useMutation(api.spa.createRoom);
  const updateRoom = useMutation(api.spa.updateRoom);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "single" as string, capacity: 1, facilities: [] as string[] });

  const toggleFacility = (f: string) => setForm((fr) => ({ ...fr, facilities: fr.facilities.includes(f) ? fr.facilities.filter((x) => x !== f) : [...fr.facilities, f] }));
  const save = async () => { if (!form.name) return; await createRoom({ tenantId, name: form.name, type: form.type, capacity: form.capacity, facilities: form.facilities, status: "available" }); setDialogOpen(false); };

  const statusColor = (s: string) => s === "available" ? "bg-green-100 text-green-800" : s === "occupied" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Room Management</h1><p className="text-sm text-muted-foreground">Single / Couple / VIP / Hydrotherapy / Suite</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Room</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r) => (
          <Card key={r._id}><CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div><p className="font-semibold">{r.name}</p><p className="text-xs text-muted-foreground capitalize">{r.type} • {r.capacity} pax</p></div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Thermometer className="h-3 w-3" /> {r.temperature ?? 25}°C</div>
            <div className="flex flex-wrap gap-1">{(r.facilities ?? []).map((f: string) => <Badge key={f} variant="outline" className="text-xs capitalize">{f.replace("_", " ")}</Badge>)}</div>
            <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => updateRoom({ id: r._id, status: r.status === "available" ? "occupied" : r.status === "occupied" ? "cleaning" : "available" })}>
              {r.status === "available" ? "Set Occupied" : r.status === "occupied" ? "Set Cleaning" : "Set Available"}
            </Button>
          </CardContent></Card>
        ))}
      </div>
      {rooms.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada room.</p>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Tambah Room</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama room" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div><label className="text-xs">Tipe</label><div className="flex flex-wrap gap-1 mt-1">{ROOM_TYPES.map((t) => <Badge key={t} variant={form.type === t ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setForm((f) => ({ ...f, type: t, capacity: t === "suite" ? 4 : t === "single" ? 1 : 2 }))}>{t}</Badge>)}</div></div>
            <div><label className="text-xs">Fasilitas</label><div className="flex flex-wrap gap-1 mt-1">{FACILITIES.map((f) => <Badge key={f} variant={form.facilities.includes(f) ? "default" : "outline"} className="cursor-pointer text-xs capitalize" onClick={() => toggleFacility(f)}>{f.replace("_", " ")}</Badge>)}</div></div>
            <Button onClick={save} className="w-full">Tambah</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
