import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bell, Car, Plus, Send } from "lucide-react";

export default function ServiceReminders() {
  const tenantId = useTenantId() ?? "";
  const reminders = useQuery(api.bengkel.listServiceReminders, { tenantId }) ?? [];
  const vehicles = useQuery(api.bengkel.listVehicles, { tenantId }) ?? [];
  const markSent = useMutation(api.bengkel.markReminderSent);
  const createReminder = useMutation(api.bengkel.createServiceReminder);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", kmLast: "" });

  const vehiclesWithoutReminder = vehicles.filter((v) => !reminders.some((r) => r.vehicleId === v._id));

  const save = async () => {
    if (!form.vehicleId) return;
    const km = Number(form.kmLast) || 0;
    await createReminder({
      tenantId,
      vehicleId: form.vehicleId,
      lastServiceKm: km || undefined,
      lastServiceDate: Date.now(),
      nextServiceKm: km ? km + 4000 : undefined,
      nextServiceDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
    });
    setDialogOpen(false);
    setForm({ vehicleId: "", kmLast: "" });
  };

  const daysUntil = (date?: number) => date ? Math.ceil((date - Date.now()) / (1000 * 60 * 60 * 24)) : 999;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Service Reminders</h1><p className="text-sm text-muted-foreground">KM+3000-5000 • H-7 WA reminder • H-1 reminder</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Buat Reminder</Button>
      </div>
      <div className="space-y-3">
        {reminders.map((r) => {
          const vehicle = vehicles.find((v) => v._id === r.vehicleId);
          const days = daysUntil(r.nextServiceDate);
          return (
            <Card key={r._id} className={days <= 7 && r.status !== "booked" ? "border-amber-300" : ""}><CardContent className="p-3 flex items-center justify-between">
              <div><div className="flex items-center gap-2"><Car className="h-4 w-4" /><span className="font-semibold">{vehicle?.plateNumber} {vehicle?.brand}</span><Badge variant={r.status === "booked" ? "default" : "secondary"}>{r.status}</Badge></div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1"><span>Next: {r.nextServiceKm?.toLocaleString()} KM</span><span>{r.nextServiceDate ? new Date(r.nextServiceDate).toLocaleDateString("id") : "-"}</span></div></div>
              <div className="text-right">
                <p className={`text-sm font-bold ${days <= 7 ? "text-amber-600" : "text-muted-foreground"}`}>{days > 0 ? `${days} hari` : "Overdue"}</p>
                {!r.reminderH7Sent && days <= 14 && <Button size="sm" onClick={() => markSent({ id: r._id, type: "h7" })}><Send className="h-3 w-3 mr-1" /> H-7</Button>}
              </div>
            </CardContent></Card>
          );
        })}
        {reminders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada reminder. Klik "Buat Reminder" atau buat kendaraan baru (reminder otomatis dibuat).</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Buat Service Reminder</DialogTitle>
            <DialogDescription>Reminder otomatis untuk servis berikutnya (+4000 KM / +6 bulan).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <select
              value={form.vehicleId}
              onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Pilih kendaraan…</option>
              {(vehiclesWithoutReminder.length > 0 ? vehiclesWithoutReminder : vehicles).map((v: any) => (
                <option key={v._id} value={v._id}>{v.plateNumber} — {v.brand} {v.model}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="KM terakhir servis (opsional)"
              value={form.kmLast}
              onChange={(e) => setForm((f) => ({ ...f, kmLast: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button className="w-full" onClick={save} disabled={!form.vehicleId}>Simpan Reminder</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
