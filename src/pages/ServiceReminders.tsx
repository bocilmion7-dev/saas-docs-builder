import { useTenantId } from "@/hooks/use-tenant";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Car, Send } from "lucide-react";

export default function ServiceReminders() {
  const tenantId = useTenantId() ?? "";
  const reminders = useQuery(api.bengkel.listServiceReminders, { tenantId }) ?? [];
  const vehicles = useQuery(api.bengkel.listVehicles, { tenantId }) ?? [];
  const markSent = useMutation(api.bengkel.markReminderSent);

  const daysUntil = (date?: number) => date ? Math.ceil((date - Date.now()) / (1000 * 60 * 60 * 24)) : 999;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Service Reminders</h1><p className="text-sm text-muted-foreground">KM+3000-5000 • H-7 WA reminder • H-1 reminder</p></div>
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
        {reminders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada reminder.</p>}
      </div>
    </div>
  );
}
