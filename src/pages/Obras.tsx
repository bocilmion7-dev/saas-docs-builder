import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scissors, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const obrasOrders = [
  { id: "OB-001", customer: "Andi Wijaya", fabric: "Kain Katun Putih 3.1m", sisi: "Semua sisi", benangWarna: "Senada (Putih)", biayaPerMeter: 3000, totalMeter: 3.1, biayaTotal: 9300, status: "completed", qcPassed: true },
  { id: "OB-002", customer: "Sari Dewi", fabric: "Kain Batik Parang 2.5m", sisi: "Sisi tertentu", benangWarna: "Kontras (Coklat)", biayaPerMeter: 4000, totalMeter: 2.5, biayaTotal: 10000, status: "in_progress", qcPassed: null },
  { id: "OB-003", customer: "Maya Putri", fabric: "Kain Sutra Sogan 1.8m", sisi: "Semua sisi", benangWarna: "Senada (Sogan)", biayaPerMeter: 5000, totalMeter: 1.8, biayaTotal: 9000, status: "pending", qcPassed: null },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function Obras() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Obras Service</h1>
          <p className="text-sm text-muted-foreground mt-1">Overlock Rp2-5k/meter — sisi semua/sisi tertentu — QC tidak kusut</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Pesanan Obras Baru</Button>
      </div>

      <div className="space-y-3">
        {obrasOrders.map((o) => (
          <Card key={o.id} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Scissors className="size-5" /></div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                      <p className="font-bold text-sm">{o.customer}</p>
                      <Badge variant="secondary" className={o.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : o.status === "in_progress" ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"}>
                        {o.status === "completed" ? "Selesai" : o.status === "in_progress" ? "Dikerjakan" : "Menunggu"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{o.fabric}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Sisi: {o.sisi}</span>
                      <span>Benang: {o.benangWarna}</span>
                      <span>{o.totalMeter}m × {formatRp(o.biayaPerMeter)}/m</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold">{formatRp(o.biayaTotal)}</p>
                  {o.status === "in_progress" && <Button size="sm" className="text-[10px] h-7 mt-1">Selesai → QC</Button>}
                  {o.status === "completed" && o.qcPassed && <Badge className="bg-emerald-500/10 text-emerald-600"><CheckCircle className="size-3 mr-1" />QC Pass</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
