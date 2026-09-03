import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, CalendarDays, Clock, User } from "lucide-react";

export default function SpaBookings() {
  const tenantId = "demo";
  const bookings = useQuery(api.spa.listBookings, { tenantId }) ?? [];
  const createBooking = useMutation(api.spa.createBooking);
  const updateStatus = useMutation(api.spa.updateBookingStatus);

  const therapists = useQuery(api.spa.listTherapists, { tenantId }) ?? [];
  const rooms = useQuery(api.spa.listRooms, { tenantId }) ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ serviceId: "", therapistId: "", roomId: "", time: "10:00", durationMinutes: 60, specialRequest: "" });

  const save = async () => {
    if (!form.serviceId) return;
    await createBooking({ tenantId, ...form, date: Date.now(), status: "booked" });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { booked: "bg-blue-100 text-blue-800", confirmed: "bg-indigo-100 text-indigo-800", checked_in: "bg-amber-100 text-amber-800", in_service: "bg-purple-100 text-purple-800", completed: "bg-green-100 text-green-800", cancelled: "bg-gray-100 text-gray-800" };
    return m[s] ?? "";
  };

  const nextStatus = (s: string) => {
    const flow: Record<string, string> = { booked: "confirmed", confirmed: "checked_in", checked_in: "in_service", in_service: "completed" };
    return flow[s] ?? null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Spa Bookings</h1><p className="text-sm text-muted-foreground">Booking Calendar • Therapist assignment • Room allocation</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Booking Baru</Button>
      </div>
      <div className="space-y-3">
        {bookings.map((b) => {
          const therapist = therapists.find((t) => t._id === b.therapistId);
          const room = rooms.find((r) => r._id === b.roomId);
          const ns = nextStatus(b.status);
          return (
            <Card key={b._id}><CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="flex items-center gap-2"><Badge className={`text-xs ${statusColor(b.status)}`}>{b.status.replace("_", " ")}</Badge></div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.time} ({b.durationMinutes}m)</span>
                    {therapist && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {therapist.name}</span>}
                    {room && <span>🚪 {room.name}</span>}
                  </div>
                  {b.specialRequest && <p className="text-xs text-muted-foreground italic mt-1">📝 {b.specialRequest}</p>}
                </div>
              </div>
              {ns && <Button size="sm" onClick={() => updateStatus({ id: b._id, status: ns })}>→ {ns.replace("_", " ")}</Button>}
            </CardContent></Card>
          );
        })}
        {bookings.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada booking.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Booking Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Service ID" value={form.serviceId} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))} />
            <div><label className="text-xs">Therapist</label><select value={form.therapistId} onChange={(e) => setForm((f) => ({ ...f, therapistId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih...</option>{therapists.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.specialization?.join(", ")})</option>)}</select></div>
            <div><label className="text-xs">Room</label><select value={form.roomId} onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih...</option>{rooms.map((r) => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2"><Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} /><select value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: +e.target.value }))} className="border rounded-md px-2 text-sm"><option value={60}>60m</option><option value={90}>90m</option><option value={120}>120m</option></select></div>
            <Input placeholder="Special request" value={form.specialRequest} onChange={(e) => setForm((f) => ({ ...f, specialRequest: e.target.value }))} />
            <Button onClick={save} className="w-full">Buat Booking</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
