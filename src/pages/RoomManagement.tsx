import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bed, Plus, Edit, Thermometer, Droplets } from "lucide-react";

const ROOM_TYPES = ["single", "couple", "vip", "hydrotherapy", "suite"] as const;
const FACILITIES = ["jacuzzi", "sauna", "steam", "private_jacuzzi", "champagne", "heated_bed", "dimmer", "diffuser", "minibar", "shower"];

interface SpaRoom {
  id: string;
  name: string;
  type: typeof ROOM_TYPES[number];
  capacity: number;
  facilities: string[];
  status: "available" | "occupied" | "cleaning";
  temperature: number;
}

const MOCK_ROOMS: SpaRoom[] = [
  { id: "1", name: "Melati Room", type: "single", capacity: 1, facilities: ["heated_bed", "dimmer", "diffuser"], status: "available", temperature: 25 },
  { id: "2", name: "Seroja Suite", type: "couple", capacity: 2, facilities: ["heated_bed", "dimmer", "diffuser", "champagne", "minibar"], status: "occupied", temperature: 24 },
  { id: "3", name: "Lotus VIP", type: "vip", capacity: 2, facilities: ["heated_bed", "dimmer", "diffuser", "champagne", "private_jacuzzi", "minibar"], status: "available", temperature: 26 },
  { id: "4", name: "Kamboja Hydro", type: "hydrotherapy", capacity: 2, facilities: ["jacuzzi", "sauna", "steam", "heated_bed"], status: "cleaning", temperature: 28 },
  { id: "5", name: "Raffles Suite", type: "suite", capacity: 4, facilities: ["jacuzzi", "sauna", "steam", "private_jacuzzi", "champagne", "heated_bed", "dimmer", "minibar"], status: "available", temperature: 24 },
];

export default function RoomManagement() {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SpaRoom | null>(null);
  const [form, setForm] = useState({ name: "", type: "single" as typeof ROOM_TYPES[number], capacity: 1, facilities: [] as string[] });

  const filtered = rooms.filter(r => filter === "all" || r.status === filter);

  const statusColor = (s: string) => s === "available" ? "bg-green-100 text-green-800" : s === "occupied" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

  const toggleFacility = (f: string) => {
    setForm(fr => ({ ...fr, facilities: fr.facilities.includes(f) ? fr.facilities.filter(x => x !== f) : [...fr.facilities, f] }));
  };

  const save = () => {
    if (editing) {
      setRooms(rs => rs.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      setRooms(rs => [...rs, { id: Date.now().toString(), ...form, status: "available", temperature: 25 }]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Room Management</h1>
          <p className="text-sm text-muted-foreground">Manage spa rooms: type, facilities, status, temperature</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: "", type: "single", capacity: 1, facilities: [] }); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Room
        </Button>
      </div>

      <div className="flex gap-2">
        {["all", "available", "occupied", "cleaning"].map(s => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({s === "all" ? rooms.length : rooms.filter(r => r.status === s).length})
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(room => (
          <Card key={room.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{room.name}</CardTitle>
                  <p className="text-xs text-muted-foreground capitalize">{room.type} • Capacity {room.capacity} pax</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(room.status)}`}>{room.status}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {room.temperature}°C</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {room.facilities.map(f => (
                  <Badge key={f} variant="outline" className="text-xs capitalize">{f.replace("_", " ")}</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(room); setForm({ name: room.name, type: room.type, capacity: room.capacity, facilities: room.facilities }); setDialogOpen(true); }}>
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRooms(rs => rs.map(r => r.id === room.id ? { ...r, status: r.status === "available" ? "occupied" : r.status === "occupied" ? "cleaning" : "available" } : r))}>
                  {room.status === "available" ? "Set Occupied" : room.status === "occupied" ? "Set Cleaning" : "Set Available"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Room" : "Tambah Room"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nama Room</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Tipe</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {ROOM_TYPES.map(t => (
                  <Badge key={t} variant={form.type === t ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setForm(f => ({ ...f, type: t, capacity: t === "suite" ? 4 : t === "single" ? 1 : 2 }))}>{t}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Fasilitas</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {FACILITIES.map(f => (
                  <Badge key={f} variant={form.facilities.includes(f) ? "default" : "outline"} className="cursor-pointer text-xs capitalize" onClick={() => toggleFacility(f)}>{f.replace("_", " ")}</Badge>
                ))}
              </div>
            </div>
            <Button onClick={save} className="w-full">{editing ? "Simpan" : "Tambah"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
