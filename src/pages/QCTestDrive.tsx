import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, AlertTriangle, Route, MessageSquare } from "lucide-react";

interface QCTestDrive {
  id: string;
  woNumber: string;
  vehicle: string;
  foreman: string;
  kmStart: number;
  kmEnd: number;
  keluhanHilang: boolean;
  suaraGetaran: boolean;
  kebocoran: boolean;
  result: "pass" | "rework";
  notes: string;
  completedAt: string;
}

const MOCK_DRIVES: QCTestDrive[] = [
  { id: "1", woNumber: "WO-001", vehicle: "B1234CD Toyota Avanza", foreman: "Supervisor Agung", kmStart: 50000, kmEnd: 50003, keluhanHilang: true, suaraGetaran: false, kebocoran: false, result: "pass", notes: "Ganti oli OK, tidak ada kebocoran, suara mesin halus", completedAt: "2026-09-03 12:00" },
  { id: "2", woNumber: "WO-005", vehicle: "F7890KL Honda Jazz", foreman: "Supervisor Agung", kmStart: 35000, kmEnd: 35004, keluhanHilang: false, suaraGetaran: true, kebocoran: false, result: "rework", notes: "Masih ada getaran di steering, perlu cek ball joint", completedAt: "2026-09-03 14:30" },
];

export default function QCTestDrive() {
  const [drives] = useState(MOCK_DRIVES);
  const [search, setSearch] = useState("");

  const filtered = drives.filter(d => !search || d.vehicle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QC Test Drive</h1>
        <p className="text-sm text-muted-foreground">Foreman QC: cek torque + cairan + kebocoran + test drive 1-5KM • Keluhan hilang, suara, getaran, kebocoran</p>
      </div>
      <Input placeholder="Cari kendaraan..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-4">
        {filtered.map(drive => (
          <Card key={drive.id} className={drive.result === "rework" ? "border-amber-300" : "border-green-300"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{drive.vehicle}</CardTitle>
                  <p className="text-xs text-muted-foreground">{drive.woNumber} • Foreman: {drive.foreman} • {drive.completedAt}</p>
                </div>
                <Badge variant={drive.result === "pass" ? "default" : "destructive"}>
                  {drive.result === "pass" ? <><CheckCircle className="mr-1 h-3 w-3" /> PASS</> : <><XCircle className="mr-1 h-3 w-3" /> REWORK</>}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Route className="h-3 w-3" /> {drive.kmStart} → {drive.kmEnd} KM ({drive.kmEnd - drive.kmStart} KM)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className={`flex items-center gap-2 p-2 rounded ${drive.keluhanHilang ? "bg-green-50" : "bg-red-50"}`}>
                  {drive.keluhanHilang ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                  <span className="text-xs">Keluhan Hilang</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${!drive.suaraGetaran ? "bg-green-50" : "bg-red-50"}`}>
                  {!drive.suaraGetaran ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                  <span className="text-xs">Suara OK</span>
                </div>
                <div className={`flex items-center gap-2 p-2 rounded ${!drive.kebocoran ? "bg-green-50" : "bg-red-50"}`}>
                  {!drive.kebocoran ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                  <span className="text-xs">Tidak Bocor</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3 mt-0.5" /> <span>{drive.notes}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
