import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Star, User, Plus, Edit, Phone } from "lucide-react";

const SPECIALIZATIONS = ["Bali", "Thai", "Deep Tissue", "Hot Stone", "Facial", "Body Scrub", "Reflexology", "Aromatherapy"];

interface Therapist {
  id: string;
  name: string;
  gender: "pria" | "wanita";
  specializations: string[];
  rating: number;
  commissionRate: number;
  isAvailable: boolean;
  phone: string;
  experience: string;
  photo?: string;
}

const MOCK_THERAPISTS: Therapist[] = [
  { id: "1", name: "Wayan Sudarma", gender: "pria", specializations: ["Bali", "Deep Tissue", "Hot Stone"], rating: 4.9, commissionRate: 10, isAvailable: true, phone: "081234567890", experience: "8 tahun" },
  { id: "2", name: "Made Lestari", gender: "wanita", specializations: ["Thai", "Facial", "Aromatherapy"], rating: 4.7, commissionRate: 10, isAvailable: true, phone: "081234567891", experience: "5 tahun" },
  { id: "3", name: "Ketut Agung", gender: "pria", specializations: ["Deep Tissue", "Body Scrub", "Reflexology"], rating: 4.8, commissionRate: 12, isAvailable: false, phone: "081234567892", experience: "10 tahun" },
  { id: "4", name: "Ni Kadek Ayu", gender: "wanita", specializations: ["Bali", "Hot Stone", "Facial", "Aromatherapy"], rating: 5.0, commissionRate: 15, isAvailable: true, phone: "081234567893", experience: "12 tahun" },
];

export default function TherapistManagement() {
  const [therapists, setTherapists] = useState(MOCK_THERAPISTS);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Therapist | null>(null);
  const [form, setForm] = useState({ name: "", gender: "wanita" as "pria" | "wanita", specializations: [] as string[], commissionRate: 10, phone: "", experience: "" });

  const filtered = therapists.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterGender !== "all" && t.gender !== filterGender) return false;
    return true;
  });

  const toggleSpec = (spec: string) => {
    setForm(f => ({
      ...f,
      specializations: f.specializations.includes(spec) ? f.specializations.filter(s => s !== spec) : [...f.specializations, spec],
    }));
  };

  const save = () => {
    if (editing) {
      setTherapists(ts => ts.map(t => t.id === editing.id ? { ...t, ...form, rating: t.rating } : t));
    } else {
      setTherapists(ts => [...ts, { id: Date.now().toString(), ...form, rating: 0, isAvailable: true, photo: undefined }]);
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ name: "", gender: "wanita", specializations: [], commissionRate: 10, phone: "", experience: "" });
  };

  const toggleAvailability = (id: string) => {
    setTherapists(ts => ts.map(t => t.id === id ? { ...t, isAvailable: !t.isAvailable } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Therapist Management</h1>
          <p className="text-sm text-muted-foreground">Manage therapists: gender, specialization, rating, commission</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: "", gender: "wanita", specializations: [], commissionRate: 10, phone: "", experience: "" }); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Therapist
        </Button>
      </div>

      <div className="flex gap-3">
        <Input placeholder="Cari nama therapist..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">Semua Gender</option>
          <option value="pria">Pria</option>
          <option value="wanita">Wanita</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <Card key={t.id} className={`relative ${!t.isAvailable ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t.gender === "pria" ? "Pria" : "Wanita"} • {t.experience}</p>
                  </div>
                </div>
                <Badge variant={t.isAvailable ? "default" : "secondary"}>
                  {t.isAvailable ? "Available" : "Off"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{t.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground ml-auto">Commission: {t.commissionRate}%</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {t.specializations.map(s => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> {t.phone}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(t); setForm({ name: t.name, gender: t.gender, specializations: t.specializations, commissionRate: t.commissionRate, phone: t.phone, experience: t.experience }); setDialogOpen(true); }}>
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button size="sm" variant={t.isAvailable ? "destructive" : "default"} onClick={() => toggleAvailability(t.id)}>
                  {t.isAvailable ? "Off" : "On"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Therapist" : "Tambah Therapist"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nama</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama therapist" />
            </div>
            <div>
              <label className="text-sm font-medium">Gender</label>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant={form.gender === "pria" ? "default" : "outline"} onClick={() => setForm(f => ({ ...f, gender: "pria" }))}>Pria</Button>
                <Button size="sm" variant={form.gender === "wanita" ? "default" : "outline"} onClick={() => setForm(f => ({ ...f, gender: "wanita" }))}>Wanita</Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Spesialisasi</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {SPECIALIZATIONS.map(s => (
                  <Badge key={s} variant={form.specializations.includes(s) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleSpec(s)}>{s}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Commission (%)</label>
                <Input type="number" value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: +e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Pengalaman</label>
                <Input value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} placeholder="5 tahun" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Telepon</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="08123456789" />
            </div>
            <Button onClick={save} className="w-full">{editing ? "Simpan" : "Tambah"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
