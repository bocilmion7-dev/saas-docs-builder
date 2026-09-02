import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Grid3X3, Users, Clock, AlertCircle, CheckCircle, Wrench, ArrowRight,
} from "lucide-react";

const statusConfig: Record<string, { label: string; cls: string; color: string }> = {
  available: { label: "Tersedia", cls: "bg-emerald-500/10 text-emerald-600", color: "border-emerald-400 bg-emerald-50" },
  reserved: { label: "Direservasi", cls: "bg-blue-500/10 text-blue-600", color: "border-blue-400 bg-blue-50" },
  occupied: { label: "Terisi", cls: "bg-amber-500/10 text-amber-600", color: "border-amber-400 bg-amber-50" },
  waiting_payment: { label: "Bayar", cls: "bg-purple-500/10 text-purple-600", color: "border-purple-400 bg-purple-50" },
  cleaning: { label: "Bersihkan", cls: "bg-orange-500/10 text-orange-600", color: "border-orange-400 bg-orange-50" },
  out_of_service: { label: "Out of Service", cls: "bg-muted text-muted-foreground", color: "border-gray-300 bg-gray-50" },
};

const tables = [
  { id: "1", number: 1, capacity: 2, area: "Indoor", status: "available", session: null },
  { id: "2", number: 2, capacity: 2, area: "Indoor", status: "occupied", session: { customer: "Andi", guests: 2, since: "10:15" } },
  { id: "3", number: 3, capacity: 4, area: "Indoor", status: "reserved", session: { customer: "Sari", time: "11:00", pax: 3 } },
  { id: "4", number: 4, capacity: 4, area: "Indoor", status: "occupied", session: { customer: "Budi", guests: 4, since: "09:45" } },
  { id: "5", number: 5, capacity: 6, area: "Outdoor", status: "available", session: null },
  { id: "6", number: 6, capacity: 6, area: "Outdoor", status: "cleaning", session: null },
  { id: "7", number: 7, capacity: 8, area: "VIP", status: "occupied", session: { customer: "Rina", guests: 6, since: "09:30" } },
  { id: "8", number: 8, capacity: 2, area: "Indoor", status: "waiting_payment", session: { customer: "Dedi", guests: 2, since: "10:00" } },
  { id: "9", number: 9, capacity: 4, area: "Outdoor", status: "out_of_service", session: null },
  { id: "10", number: 10, capacity: 4, area: "Indoor", status: "available", session: null },
  { id: "11", number: 11, capacity: 2, area: "Indoor", status: "reserved", session: { customer: "Maya", time: "12:00", pax: 2 } },
  { id: "12", number: 12, capacity: 6, area: "VIP", status: "available", session: null },
];

export default function TableManagement() {
  const [filter, setFilter] = useState("all");
  const areas = ["all", "Indoor", "Outdoor", "VIP"];
  const filtered = filter === "all" ? tables : tables.filter((t) => t.area === filter);

  const statusCounts = tables.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manajemen Meja</h1>
          <p className="text-sm text-muted-foreground mt-1">Visual status meja restoran — 6 status real-time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">+ Tambah Meja</Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className={`rounded-lg p-3 text-center border ${cfg.color}`}>
            <p className="text-lg font-extrabold">{statusCounts[key] || 0}</p>
            <p className="text-[10px] font-medium">{cfg.label}</p>
          </div>
        ))}
      </div>

      {/* Area Filter */}
      <div className="flex gap-1.5">
        {areas.map((a) => (
          <button key={a} onClick={() => setFilter(a)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === a ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {a === "all" ? "Semua" : a}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((t) => {
          const st = statusConfig[t.status];
          return (
            <Card key={t.id} className={`border-2 ${st.color} hover:shadow-md transition-all cursor-pointer`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-extrabold">#{t.number}</span>
                  <Badge variant="secondary" className={st.cls}>{st.label}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Users className="size-3" /> {t.capacity} kursi · {t.area}
                </div>
                {t.session && (
                  <div className="rounded-lg bg-background/80 p-2 text-xs space-y-0.5">
                    <p className="font-medium">{t.session.customer}</p>
                    {t.session.guests && <p className="text-muted-foreground">{t.session.guests} orang · sejak {t.session.since}</p>}
                    {t.session.time && <p className="text-muted-foreground">Jam {t.session.time} · {t.session.pax} pax</p>}
                  </div>
                )}
                <div className="mt-3 flex gap-1">
                  {t.status === "available" && <Button size="sm" className="w-full text-[10px] h-7">Scan QR</Button>}
                  {t.status === "occupied" && <Button size="sm" variant="outline" className="w-full text-[10px] h-7">Tambah Order</Button>}
                  {t.status === "waiting_payment" && <Button size="sm" className="w-full text-[10px] h-7 bg-purple-500 hover:bg-purple-600">Bayar</Button>}
                  {t.status === "cleaning" && <Button size="sm" variant="outline" className="w-full text-[10px] h-7">Selesai</Button>}
                  {t.status === "reserved" && <Button size="sm" variant="outline" className="w-full text-[10px] h-7">Check-in</Button>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
