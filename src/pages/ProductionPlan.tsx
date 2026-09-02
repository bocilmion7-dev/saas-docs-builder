import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, FlaskConical, Thermometer, CheckCircle, Clock, AlertTriangle, Plus } from "lucide-react";

const batches = [
  { id: "PB-001", product: "Roti Tawar 400gr", planDate: "2026-09-02", batchSize: 50, status: "completed", proofingTemp: 36, bakingTemp: 185, startedAt: "05:00", completedAt: "07:30", qcPassed: true },
  { id: "PB-002", product: "Croissant Butter", planDate: "2026-09-02", batchSize: 30, status: "baking", proofingTemp: 37, bakingTemp: 190, startedAt: "06:00", completedAt: null, qcPassed: null },
  { id: "PB-003", product: "Kue Lapis", planDate: "2026-09-02", batchSize: 20, status: "proofing", proofingTemp: 35, bakingTemp: 170, startedAt: "07:00", completedAt: null, qcPassed: null },
  { id: "PB-004", product: "Donat Kampung", planDate: "2026-09-02", batchSize: 100, status: "mixing", proofingTemp: null, bakingTemp: null, startedAt: "08:00", completedAt: null, qcPassed: null },
  { id: "PB-005", product: "Custom Cake Ultah", planDate: "2026-09-03", batchSize: 1, status: "confirmed", proofingTemp: null, bakingTemp: null, startedAt: null, completedAt: null, qcPassed: null },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-blue-500/10 text-blue-600" },
  mixing: { label: "Mixing", cls: "bg-purple-500/10 text-purple-600" },
  proofing: { label: "Proofing 35-38°C", cls: "bg-amber-500/10 text-amber-600" },
  baking: { label: "Baking 180-200°C", cls: "bg-red-500/10 text-red-600" },
  cooling: { label: "Cooling", cls: "bg-cyan-500/10 text-cyan-600" },
  qc: { label: "QC Check", cls: "bg-indigo-500/10 text-indigo-600" },
  completed: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600" },
};

export default function ProductionPlan() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Production Plan & Batch</h1>
          <p className="text-sm text-muted-foreground mt-1">Jadwal produksi roti pagi, kue siang — tracking batch real-time</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Batch Baru</Button>
      </div>

      {/* QC Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Batch Hari Ini", value: batches.length, color: "text-foreground" },
          { label: "Selesai", value: batches.filter((b) => b.status === "completed").length, color: "text-emerald-500" },
          { label: "Dikerjakan", value: batches.filter((b) => !["completed", "confirmed"].includes(b.status)).length, color: "text-amber-500" },
          { label: "Target Day-Old", value: "20:00", color: "text-purple-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60"><CardContent className="p-3 text-center">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Batches */}
      <div className="space-y-3">
        {batches.map((b) => {
          const st = statusConfig[b.status];
          return (
            <Card key={b.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary font-mono text-xs font-bold">{b.id}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">{b.product}</p>
                        <Badge className={st.cls}>{st.label}</Badge>
                        <span className="text-xs text-muted-foreground">Qty: {b.batchSize}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {b.proofingTemp && <span className="flex items-center gap-1"><Thermometer className="size-3" />Proofing {b.proofingTemp}°C</span>}
                        {b.bakingTemp && <span className="flex items-center gap-1"><FlaskConical className="size-3" />Baking {b.bakingTemp}°C</span>}
                        {b.startedAt && <span className="flex items-center gap-1"><Clock className="size-3" />Mulai {b.startedAt}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {b.status === "mixing" && <Button size="sm" className="text-[10px] h-7">→ Proofing</Button>}
                    {b.status === "proofing" && <Button size="sm" className="text-[10px] h-7">→ Baking</Button>}
                    {b.status === "baking" && <Button size="sm" className="text-[10px] h-7">→ Cooling</Button>}
                    {b.status === "cooling" && <Button size="sm" className="text-[10px] h-7">QC Check</Button>}
                    {b.status === "completed" && <Badge className="bg-emerald-500/10 text-emerald-600"><CheckCircle className="size-3 mr-1" /> QC Pass</Badge>}
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
