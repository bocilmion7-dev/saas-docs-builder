import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Car, MessageSquare, CheckCircle, Send } from "lucide-react";

interface ServiceReminder {
  id: string;
  vehicle: string;
  customer: string;
  phone: string;
  lastServiceKm: number;
  lastServiceDate: string;
  nextServiceKm: number;
  nextServiceDate: string;
  reminderH7: boolean;
  reminderH1: boolean;
  status: "pending" | "sent" | "booked";
}

const MOCK_REMINDERS: ServiceReminder[] = [
  { id: "1", vehicle: "B1234CD Toyota Avanza", customer: "Budi Santoso", phone: "081234567890", lastServiceKm: 47000, lastServiceDate: "2026-05-15", nextServiceKm: 50000, nextServiceDate: "2026-09-10", reminderH7: true, reminderH1: false, status: "sent" },
  { id: "2", vehicle: "D5678EF Honda Civic", customer: "Andi Wijaya", phone: "081234567891", lastServiceKm: 32000, lastServiceDate: "2026-06-01", nextServiceKm: 35000, nextServiceDate: "2026-09-15", reminderH7: false, reminderH1: false, status: "pending" },
  { id: "3", vehicle: "F7890KL Honda Jazz", customer: "Rina Melati", phone: "081234567892", lastServiceKm: 34500, lastServiceDate: "2026-08-01", nextServiceKm: 37500, nextServiceDate: "2026-12-01", reminderH7: false, reminderH1: false, status: "pending" },
];

export default function ServiceReminders() {
  const [reminders] = useState(MOCK_REMINDERS);
  const [search, setSearch] = useState("");

  const filtered = reminders.filter(r => !search || r.vehicle.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase()));

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Service Reminders</h1>
        <p className="text-sm text-muted-foreground">KM+3000-5000 atau 3-6 bulan • H-7 WA reminder • H-1 reminder</p>
      </div>
      <Input placeholder="Cari kendaraan/customer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map(r => {
          const days = daysUntil(r.nextServiceDate);
          return (
            <Card key={r.id} className={days <= 7 && r.status !== "booked" ? "border-amber-300" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{r.vehicle}</span>
                      <Badge variant={r.status === "booked" ? "default" : r.status === "sent" ? "secondary" : "outline"}>
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{r.customer} • {r.phone}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Last: {r.lastServiceKm} KM ({r.lastServiceDate})</span>
                      <span>→ Next: {r.nextServiceKm} KM ({r.nextServiceDate})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className={r.reminderH7 ? "text-green-600" : "text-gray-400"}>{r.reminderH7 ? "✅" : "⬜"} H-7 WA</span>
                      <span className={r.reminderH1 ? "text-green-600" : "text-gray-400"}>{r.reminderH1 ? "✅" : "⬜"} H-1 WA</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${days <= 7 ? "text-amber-600" : days <= 30 ? "text-blue-600" : "text-muted-foreground"}`}>
                      {days > 0 ? `${days} hari lagi` : "Overdue!"}
                    </p>
                    {days <= 14 && r.status === "pending" && (
                      <Button size="sm" className="mt-2" onClick={() => {}}>
                        <Send className="mr-1 h-3 w-3" /> Kirim Reminder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
