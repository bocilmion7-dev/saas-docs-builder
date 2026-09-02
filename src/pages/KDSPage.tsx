import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const stations = [
  { id: "bar", name: "Bar / Coffee", icon: "☕" },
  { id: "kitchen", name: "Main Kitchen", icon: "🍳" },
  { id: "cold", name: "Cold Kitchen", icon: "🥗" },
  { id: "pastry", name: "Pastry", icon: "🥐" },
];

const tickets = [
  { id: "T-001", table: 2, items: [{ name: "Kopi Susu Gula Aren", qty: 2, modifier: "Extra shot, Less sugar" }, { name: "Es Teh Manis", qty: 1, modifier: "" }], priority: "normal", status: "queue", station: "bar", since: "10:18", mins: 12 },
  { id: "T-002", table: 4, items: [{ name: "Nasi Goreng Spesial", qty: 2, modifier: "Pedas level 3, Extra telur" }, { name: "Chicken Katsu", qty: 1, modifier: "" }], priority: "rush", status: "in_progress", station: "kitchen", since: "10:12", mins: 18 },
  { id: "T-003", table: 7, items: [{ name: "Cappuccino Hot", qty: 3, modifier: "Normal sugar" }, { name: "Americano", qty: 1, modifier: "Hot" }], priority: "normal", status: "queue", station: "bar", since: "10:20", mins: 10 },
  { id: "T-004", table: 4, items: [{ name: "Matcha Latte", qty: 1, modifier: "Oat milk" }], priority: "normal", status: "ready", station: "bar", since: "10:05", mins: 25 },
  { id: "T-005", table: 7, items: [{ name: "Croissant Butter", qty: 2, modifier: "" }, { name: "Roti Gandum", qty: 1, modifier: "" }], priority: "normal", status: "queue", station: "pastry", since: "10:22", mins: 8 },
  { id: "T-006", table: 11, items: [{ name: "Fresh Orange", qty: 2, modifier: "Less ice" }], priority: "normal", status: "in_progress", station: "cold", since: "10:15", mins: 15 },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  queue: { label: "Antrian", cls: "bg-amber-500/10 text-amber-600 border-amber-300" },
  in_progress: { label: "Dikerjakan", cls: "bg-blue-500/10 text-blue-600 border-blue-300" },
  ready: { label: "Siap", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
};

export default function KDSPage() {
  const [activeStation, setActiveStation] = useState("all");
  const filtered = activeStation === "all" ? tickets : tickets.filter((t) => t.station === activeStation);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Kitchen Display System</h1>
          <p className="text-sm text-muted-foreground mt-1">4 stasiun — Bar, Kitchen, Cold, Pastry</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" />
          <span className="font-bold text-foreground">{new Date().toLocaleTimeString("id-ID")}</span>
        </div>
      </div>

      {/* Station Tabs */}
      <div className="flex gap-1.5 overflow-x-auto">
        <button onClick={() => setActiveStation("all")} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${activeStation === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          Semua ({tickets.length})
        </button>
        {stations.map((s) => (
          <button key={s.id} onClick={() => setActiveStation(s.id)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${activeStation === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {s.icon} {s.name} ({tickets.filter((t) => t.station === s.id).length})
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <Card key={t.id} className={`border-2 ${statusConfig[t.status].cls}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="font-mono text-muted-foreground">{t.id}</span>
                  Meja {t.table}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {t.priority === "rush" && <Badge className="bg-red-500 text-white text-[10px]">RUSH</Badge>}
                  <Badge variant="secondary" className={statusConfig[t.status].cls}>{statusConfig[t.status].label}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 mb-3">
                {t.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-bold text-primary">{item.qty}x</span>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.modifier && <p className="text-xs text-muted-foreground italic">{item.modifier}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" /> {t.mins} menit
                </span>
                <div className="flex gap-1">
                  {t.status === "queue" && <Button size="sm" className="text-[10px] h-7">Mulai</Button>}
                  {t.status === "in_progress" && <Button size="sm" className="text-[10px] h-7 bg-emerald-500 hover:bg-emerald-600">Selesai</Button>}
                  {t.status === "ready" && <Button size="sm" variant="outline" className="text-[10px] h-7">Bump</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
