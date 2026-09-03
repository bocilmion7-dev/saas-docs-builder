import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, User, Star, Phone, Edit } from "lucide-react";

const SPEC_OPTIONS = ["Bali", "Thai", "Deep Tissue", "Hot Stone", "Facial", "Body Scrub", "Reflexology", "Aromatherapy"];

export default function TherapistManagement() {
  const tenantId = useTenantId() ?? "";
  const therapists = useQuery(api.spa.listTherapists, { tenantId }) ?? [];
  const createTherapist = useMutation(api.spa.createTherapist);
  const updateTherapist = useMutation(api.spa.updateTherapist);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", gender: "wanita" as "pria" | "wanita", specialization: [] as string[], commissionRate: 10, phone: "" });

  const toggleSpec = (s: string) => setForm((f) => ({ ...f, specialization: f.specialization.includes(s) ? f.specialization.filter((x) => x !== s) : [...f.specialization, s] }));
  const openNew = () => { setEditing(null); setForm({ name: "", gender: "wanita", specialization: [], commissionRate: 10, phone: "" }); setDialogOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ name: t.name, gender: t.gender, specialization: t.specialization ?? [], commissionRate: t.commissionRate, phone: t.phone ?? "" }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name) return;
    if (editing) { await updateTherapist({ id: editing._id, name: form.name, gender: form.gender, specialization: form.specialization, commissionRate: form.commissionRate }); }
    else { await createTherapist({ tenantId, name: form.name, gender: form.gender, specialization: form.specialization, rating: 0, isAvailable: true, commissionRate: form.commissionRate }); }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Therapist Management</h1><p className="text-sm text-muted-foreground">Gender • Spesialisasi • Rating • Commission</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Tambah Therapist</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {therapists.map((t) => (
          <Card key={t._id}><CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"><User className="h-6 w-6 text-amber-700" /></div>
                <div><p className="font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.gender === "pria" ? "Pria" : "Wanita"}</p></div>
              </div>
              <Badge variant={t.isAvailable ? "default" : "secondary"}>{t.isAvailable ? "Available" : "Off"}</Badge>
            </div>
            <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-semibold">{t.rating.toFixed(1)}</span><span className="text-xs text-muted-foreground ml-auto">Commission: {t.commissionRate}%</span></div>
            <div className="flex flex-wrap gap-1">{(t.specialization ?? []).map((s: string) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => openEdit(t)}><Edit className="mr-1 h-3 w-3" /> Edit</Button>
          </CardContent></Card>
        ))}
      </div>
      {therapists.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada therapist.</p>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Therapist</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <div className="flex gap-2"><Button size="sm" variant={form.gender === "pria" ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, gender: "pria" }))}>Pria</Button><Button size="sm" variant={form.gender === "wanita" ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, gender: "wanita" }))}>Wanita</Button></div>
            <div className="flex flex-wrap gap-1">{SPEC_OPTIONS.map((s) => <Badge key={s} variant={form.specialization.includes(s) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleSpec(s)}>{s}</Badge>)}</div>
            <div><label className="text-xs font-medium">Commission (%)</label><Input type="number" value={form.commissionRate} onChange={(e) => setForm((f) => ({ ...f, commissionRate: +e.target.value }))} /></div>
            <Button onClick={save} className="w-full">{editing ? "Simpan" : "Tambah"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
