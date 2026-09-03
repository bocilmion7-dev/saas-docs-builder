import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Car, Wrench, Plus, Clock, AlertTriangle, CheckCircle, User } from "lucide-react";

const AREAS = ["mesin", "kelistrikan", "underchassis", "body_paint"] as const;
const JC_STATUSES = ["queue", "in_progress", "waiting_parts", "finished", "rework"] as const;

interface JobCard {
  id: string;
  woNumber: string;
  vehicle: string;
  area: typeof AREAS[number];
  title: string;
  mechanic: string;
  status: typeof JC_STATUSES[number];
  findings: string;
  estimatedHours: number;
  actualHours?: number;
}

const MOCK_CARDS: JobCard[] = [
  { id: "1", woNumber: "WO-001", vehicle: "B1234CD Toyota Avanza", area: "mesin", title: "Ganti Oli + Filter", mechanic: "Kadek Mechanical", status: "finished", findings: "Oli hitam, filter kotor", estimatedHours: 1, actualHours: 0.5 },
  { id: "2", woNumber: "WO-002", vehicle: "D5678EF Honda Civic", area: "kelistrikan", title: "Service AC + Spul", mechanic: "Made Electrical", status: "in_progress", findings: "Spul lemah, Freon kurang", estimatedHours: 3 },
  { id: "3", woNumber: "WO-003", vehicle: "B9012GH Yamaha Mio", area: "underchassis", title: "Ganti Kampas Rem", mechanic: "Unknown", status: "waiting_parts", findings: "Kampas rem tipis, shock bocor", estimatedHours: 2 },
  { id: "4", woNumber: "WO-004", vehicle: "E3456IJ Toyota Avanza", area: "body_paint", title: "Touch Up Cat Baret", mechanic: "Unknown", status: "queue", findings: "Baret di pintu kiri", estimatedHours: 4 },
];

export default function JobCards() {
  const [cards, setCards] = useState(MOCK_CARDS);
  const [filterArea, setFilterArea] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = cards.filter(c => {
    if (filterArea !== "all" && c.area !== filterArea) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

  const statusColor = (s: string) => {
    const m: Record<string, string> = { queue: "bg-gray-100 text-gray-800", in_progress: "bg-blue-100 text-blue-800", waiting_parts: "bg-yellow-100 text-yellow-800", finished: "bg-green-100 text-green-800", rework: "bg-red-100 text-red-800" };
    return m[s] || "bg-gray-100";
  };

  const areaColor = (a: string) => {
    const m: Record<string, string> = { mesin: "bg-red-100 text-red-800", kelistrikan: "bg-yellow-100 text-yellow-800", underchassis: "bg-blue-100 text-blue-800", body_paint: "bg-purple-100 text-purple-800" };
    return m[a] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Cards</h1>
          <p className="text-sm text-muted-foreground">Per spesialisasi: mesin, kelistrikan, underchassis, body paint • Assign mekanik</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat Job Card</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">Semua Area</option>
          {AREAS.map(a => <option key={a} value={a}>{a.replace("_", " ")}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">Semua Status</option>
          {JC_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(card => (
          <Card key={card.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{card.woNumber}</span>
                    <Badge className={`text-xs capitalize ${areaColor(card.area)}`}>{card.area.replace("_", " ")}</Badge>
                    <Badge className={`text-xs capitalize ${statusColor(card.status)}`}>{card.status.replace("_", " ")}</Badge>
                  </div>
                  <h3 className="font-semibold mt-1">{card.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Car className="h-3 w-3" /> {card.vehicle}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Findings: {card.findings}</p>
                  {card.mechanic !== "Unknown" && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <User className="h-3 w-3" /> {card.mechanic}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> Est: {card.estimatedHours}h</div>
                  {card.actualHours && <div className="text-green-600 mt-1">Actual: {card.actualHours}h</div>}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {card.status !== "finished" && card.status !== "rework" && card.mechanic === "Unknown" && (
                  <Button size="sm" variant="outline">Assign Mekanik</Button>
                )}
                {card.status === "in_progress" && (
                  <Button size="sm" variant="outline">Mark Finished</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Buat Job Card Baru</DialogTitle></DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">Job Card dibuat otomatis dari Work Order yang approved. Pilih area spesialisasi dan assign mekanik.</p>
            <Button onClick={() => setDialogOpen(false)} className="w-full">Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
