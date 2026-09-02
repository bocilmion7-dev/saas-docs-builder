import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Users, Heart, Star, Plus, Bed } from "lucide-react";

const bookings = [
  { id: "SB-001", customer: "Andi Wijaya", service: "Massage Bali 60m", therapist: "Wayan S.", room: "VIP Suite", date: "2026-09-02", time: "10:00", duration: 60, status: "confirmed", payment: "QRIS" },
  { id: "SB-002", customer: "Sari Dewi", service: "Facial Treatment 90m", therapist: "Putri L.", room: "Couple Room", date: "2026-09-02", time: "11:00", duration: 90, status: "in_progress", payment: "Tunai" },
  { id: "SB-003", customer: "Maya Putri", service: "Thai Massage 120m", therapist: "Nisa A.", room: "Room 3", date: "2026-09-02", time: "13:00", duration: 120, status: "confirmed", payment: "Kartu" },
  { id: "SB-004", customer: "Rina Marlina", service: "Body Scrub 90m", therapist: "Putri L.", room: "Room 2", date: "2026-09-02", time: "14:00", duration: 90, status: "confirmed", payment: "Tunai" },
];

const therapists = [
  { name: "Wayan S.", specialization: ["Bali", "Deep Tissue"], rating: 4.9, available: true },
  { name: "Putri L.", specialization: ["Facial", "Body Scrub", "Bali"], rating: 4.7, available: false },
  { name: "Nisa A.", specialization: ["Thai", "Hot Stone"], rating: 4.8, available: true },
];

const rooms = [
  { name: "Room 1", type: "single", facilities: ["Shower", "Heated Bed"], status: "available", temperature: 25 },
  { name: "Room 2", type: "single", facilities: ["Shower", "Jacuzzi"], status: "available", temperature: 26 },
  { name: "Room 3", type: "couple", facilities: ["Shower", "Heated Bed", "Diffuser"], status: "occupied", temperature: 24 },
  { name: "VIP Suite", type: "vip", facilities: ["Private Jacuzzi", "Sauna", "Champagne"], status: "occupied", temperature: 25 },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Dikonfirmasi", cls: "bg-blue-500/10 text-blue-600" },
  in_progress: { label: "Sedang Treatment", cls: "bg-emerald-500/10 text-emerald-600" },
  completed: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600" },
  cancelled: { label: "Dibatalkan", cls: "bg-muted text-muted-foreground" },
};

export default function SpaBookings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Spa Booking</h1>
          <p className="text-sm text-muted-foreground mt-1">Kalender booking, therapist, room management</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Booking Baru</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Bookings List */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="size-4" /> Booking Hari Ini</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                          <p className="font-medium text-sm">{b.customer}</p>
                          <Badge variant="secondary" className={statusConfig[b.status].cls}>{statusConfig[b.status].label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{b.service} · {b.therapist} · {b.room}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="size-3" />{b.time} ({b.duration}m)</span>
                          <span>{b.payment}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {b.status === "confirmed" && <Button size="sm" className="text-[10px] h-7">Mulai</Button>}
                        {b.status === "in_progress" && <Button size="sm" variant="outline" className="text-[10px] h-7">Selesai</Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Therapists */}
          <Card className="border-border/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="size-4" /> Therapist Hari Ini</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {therapists.map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.specialization.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-xs"><Star className="size-3 text-amber-500 fill-amber-500" />{t.rating}</span>
                    <Badge variant="secondary" className={t.available ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}>
                      {t.available ? "Available" : "Busy"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rooms */}
          <Card className="border-border/60">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bed className="size-4" /> Room Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {rooms.map((r) => (
                <div key={r.name} className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.type} · {r.facilities.join(", ")}</p>
                  </div>
                  <Badge variant="secondary" className={r.status === "available" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                    {r.status === "available" ? "Tersedia" : "Terisi"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
