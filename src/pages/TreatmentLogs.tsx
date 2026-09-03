import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, Droplets, Footprints, Hand, ShowerHead } from "lucide-react";

interface TreatmentLog {
  id: string;
  bookingId: string;
  customerName: string;
  therapist: string;
  service: string;
  room: string;
  steps: { name: string; done: boolean; notes?: string; duration?: string }[];
  midCheck: boolean;
  status: "in_progress" | "completed";
  startTime: string;
  endTime?: string;
}

const MOCK_LOGS: TreatmentLog[] = [
  { id: "1", bookingId: "BK-001", customerName: "Siti Nurhaliza", therapist: "Wayan Sudarma", service: "Massage Bali 90m", room: "Melati Room", steps: [
    { name: "Foot Ritual", done: true, notes: "Foot bath garam 5 menit", duration: "5m" },
    { name: "Main Massage", done: true, notes: "Effleurage + kneading punggung & bahu", duration: "65m" },
    { name: "Mid-treatment Check", done: true, notes: "Tekanan nyaman: Ya" },
    { name: "Hydrotherapy", done: false },
    { name: "Closing", done: false },
  ], midCheck: true, status: "in_progress", startTime: "10:00" },
  { id: "2", bookingId: "BK-002", customerName: "Budi Santoso", therapist: "Ketut Agung", service: "Deep Tissue 60m", room: "Seroja Suite", steps: [
    { name: "Foot Ritual", done: true, notes: "Foot bath air hangat", duration: "5m" },
    { name: "Main Massage", done: true, notes: "Deep tissue kaki", duration: "50m" },
    { name: "Mid-treatment Check", done: true, notes: "Tekanan ringan, kaki kiri fokus" },
    { name: "Closing", done: true, notes: "Aftercare instruction", duration: "5m" },
  ], midCheck: true, status: "completed", startTime: "14:00", endTime: "15:00" },
];

export default function TreatmentLogs() {
  const [logs] = useState(MOCK_LOGS);
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l => !search || l.customerName.toLowerCase().includes(search.toLowerCase()));

  const stepIcon = (name: string) => {
    if (name.includes("Foot")) return <Footprints className="h-4 w-4" />;
    if (name.includes("Main")) return <Hand className="h-4 w-4" />;
    if (name.includes("Check")) return <CheckCircle className="h-4 w-4" />;
    if (name.includes("Hydro")) return <Droplets className="h-4 w-4" />;
    return <ShowerHead className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Treatment Logs</h1>
        <p className="text-sm text-muted-foreground">Track treatment flow: foot ritual → main massage → mid check → hydrotherapy → closing</p>
      </div>
      <Input placeholder="Cari nama customer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-4">
        {filtered.map(log => (
          <Card key={log.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{log.customerName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{log.service} • {log.therapist} • {log.room}</p>
                </div>
                <Badge variant={log.status === "completed" ? "default" : "secondary"}>
                  {log.status === "completed" ? "Selesai" : "In Progress"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Clock className="h-3 w-3" /> Mulai: {log.startTime} {log.endTime && `• Selesai: ${log.endTime}`}
              </div>
              <div className="space-y-2">
                {log.steps.map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${step.done ? "bg-green-50" : "bg-gray-50"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {stepIcon(step.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${step.done ? "" : "text-muted-foreground"}`}>{step.name}</span>
                        {step.done && <CheckCircle className="h-3 w-3 text-green-600" />}
                        {step.duration && <Badge variant="outline" className="text-xs">{step.duration}</Badge>}
                      </div>
                      {step.notes && <p className="text-xs text-muted-foreground mt-0.5">{step.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
