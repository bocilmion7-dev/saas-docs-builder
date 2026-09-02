import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, MapPin, Plus, Phone, CheckCircle, XCircle } from "lucide-react";

const reservations = [
  { id: "R-001", customer: "Andi Wijaya", phone: "081234567890", date: "2026-09-02", time: "12:00", pax: 4, area: "Indoor", status: "confirmed", specialRequest: "Dekat jendela, ada kursi bayi", tableNumber: 3 },
  { id: "R-002", customer: "Sari Dewi", phone: "085678901234", date: "2026-09-02", time: "12:30", pax: 2, area: "Outdoor", status: "confirmed", specialRequest: "Alergi kacang", tableNumber: 5 },
  { id: "R-003", customer: "PT Maju Jaya", phone: "0215551234", date: "2026-09-02", time: "13:00", pax: 8, area: "VIP", status: "confirmed", specialRequest: "Meeting room, proyektor", tableNumber: 7 },
  { id: "R-004", customer: "Rina Marlina", phone: "087890123456", date: "2026-09-02", time: "18:00", pax: 6, area: "Outdoor", status: "confirmed", specialRequest: "Dekorasi ulang tahun", tableNumber: null },
  { id: "R-005", customer: "Budi Santoso", phone: "081345678901", date: "2026-09-02", time: "19:00", pax: 3, area: "Indoor", status: "seated", specialRequest: "", tableNumber: 10 },
  { id: "R-006", customer: "Maya Putri", phone: "085612345678", date: "2026-09-02", time: "19:30", pax: 2, area: "Indoor", status: "no_show", specialRequest: "", tableNumber: null },
];

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  confirmed: { label: "Dikonfirmasi", cls: "bg-blue-500/10 text-blue-600", icon: CheckCircle },
  seated: { label: "Duduk", cls: "bg-emerald-500/10 text-emerald-600", icon: Users },
  cancelled: { label: "Dibatalkan", cls: "bg-red-500/10 text-red-600", icon: XCircle },
  no_show: { label: "No Show", cls: "bg-muted text-muted-foreground", icon: XCircle },
};

export default function ReservationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Reservasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola reservasi meja — H-1 reminder otomatis</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Reservasi Baru</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Hari Ini", value: reservations.filter((r) => r.status === "confirmed").length, color: "text-blue-500" },
          { label: "Duduk", value: reservations.filter((r) => r.status === "seated").length, color: "text-emerald-500" },
          { label: "No Show", value: reservations.filter((r) => r.status === "no_show").length, color: "text-muted-foreground" },
          { label: "Total Pax", value: reservations.filter((r) => r.status !== "cancelled" && r.status !== "no_show").reduce((s, r) => s + r.pax, 0), color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60"><CardContent className="p-3 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {reservations.map((r) => {
              const st = statusConfig[r.status];
              return (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary text-sm font-bold font-mono">{r.id}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{r.customer}</p>
                        <Badge variant="secondary" className={st.cls}><st.icon className="size-3 mr-0.5" />{st.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarDays className="size-3" />{r.date}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" />{r.time}</span>
                        <span className="flex items-center gap-1"><Users className="size-3" />{r.pax} pax</span>
                        <span className="flex items-center gap-1"><MapPin className="size-3" />{r.area}</span>
                        {r.tableNumber && <span>Meja #{r.tableNumber}</span>}
                      </div>
                      {r.specialRequest && <p className="text-xs text-amber-600 mt-1">📝 {r.specialRequest}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {r.status === "confirmed" && <Button size="sm" className="text-[10px] h-7">Check-in</Button>}
                    {r.status === "seated" && <Button size="sm" variant="outline" className="text-[10px] h-7">Bayar</Button>}
                    {r.status === "confirmed" && <Button size="sm" variant="ghost" className="text-[10px] h-7 text-destructive">Batal</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
