import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, Droplets, Footprints, Hand, ShowerHead, Plus } from "lucide-react";

export default function TreatmentLogs() {
  const tenantId = useTenantId() ?? "";
  const logs = useQuery(api.spa.listTreatmentLogs, { tenantId }) ?? [];
  const therapists = useQuery(api.spa.listTherapists, { tenantId }) ?? [];
  const bookings = useQuery(api.spa.listBookings, { tenantId }) ?? [];
  const createLog = useMutation(api.spa.createTreatmentLog);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ bookingId: "", therapistId: "", notes: "" });
  const [search, setSearch] = useState("");

  const filtered = logs.filter((l: any) => !search || l.bookingId.toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    if (!form.bookingId || !form.therapistId) return;
    const steps = [
      { name: "Foot Ritual", done: false },
      { name: "Main Massage", done: false },
      { name: "Mid-treatment Check", done: false },
      { name: "Hydrotherapy", done: false },
      { name: "Closing", done: false },
    ];
    await createLog({ tenantId, bookingId: form.bookingId, therapistId: form.therapistId, steps, notes: form.notes });
    setDialogOpen(false);
    setForm({ bookingId: "", therapistId: "", notes: "" });
  };

  const stepIcon = (name: string) => {
    if (name.includes("Foot")) return <Footprints className="h-4 w-4" />;
    if (name.includes("Main")) return <Hand className="h-4 w-4" />;
    if (name.includes("Check")) return <CheckCircle className="h-4 w-4" />;
    if (name.includes("Hydro")) return <Droplets className="h-4 w-4" />;
    return <ShowerHead className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Treatment Logs</h1>
          <p className="text-sm text-muted-foreground">Track treatment flow: foot ritual → main massage → mid check → hydrotherapy → closing</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="size-4" /> Log Baru</Button>
      </div>
      <Input placeholder="Cari booking ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-4">
        {filtered.map((log: any) => {
          const therapist = therapists.find((t) => t._id === log.therapistId);
          const steps = Array.isArray(log.steps) ? log.steps : [];
          return (
            <Card key={log._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Booking: {log.bookingId}</CardTitle>
                    <p className="text-xs text-muted-foreground">{therapist?.name ?? "Therapist"} {log.notes && `• ${log.notes}`}</p>
                  </div>
                  <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{new Date(log.createdAt).toLocaleDateString("id-ID")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {steps.map((step: any, i: number) => (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${step.done ? "bg-green-50" : "bg-gray-50"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {stepIcon(step.name)}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${step.done ? "" : "text-muted-foreground"}`}>{step.name}</span>
                        {step.done && <CheckCircle className="inline h-3 w-3 ml-1 text-green-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada treatment logs.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Treatment Log Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Booking</label><select value={form.bookingId} onChange={(e) => setForm((f) => ({ ...f, bookingId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih booking...</option>{bookings.map((b: any) => <option key={b._id} value={b._id}>{b.time} - {b.serviceId}</option>)}</select></div>
            <div><label className="text-xs">Therapist</label><select value={form.therapistId} onChange={(e) => setForm((f) => ({ ...f, therapistId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih therapist...</option>{therapists.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
            <Input placeholder="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
