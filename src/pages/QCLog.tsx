import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Scale, Ruler, Paintbrush, Cookie } from "lucide-react";

export default function QCLog() {
  const tenantId = "demo";
  const qcLogs = useQuery(api.bakery.listQcLogs, { tenantId }) ?? [];
  const batches = useQuery(api.bakery.listBatches, { tenantId }) ?? [];

  const paramIcon = (p: string) => {
    if (p.includes("berat")) return <Scale className="h-3 w-3" />;
    if (p.includes("ukuran")) return <Ruler className="h-3 w-3" />;
    if (p.includes("warna")) return <Paintbrush className="h-3 w-3" />;
    return <Cookie className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">QC Log — 6 Parameters</h1><p className="text-sm text-muted-foreground">Berat • Ukuran • Warna kulit kuning keemasan • Tekstur empuk berserat • Rasa • Aroma</p></div>
      <div className="space-y-3">
        {qcLogs.map((log) => {
          const batch = batches.find((b) => b._id === log.batchId);
          return (
            <Card key={log._id} className={log.result === "fail" ? "border-red-300" : "border-green-300"}><CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Batch: {log.batchId.slice(-6)} • {log.checkedBy}</span>
                <Badge variant={log.result === "pass" ? "default" : "destructive"}>{log.result === "pass" ? "✅ PASS" : "❌ FAIL"}</Badge>
              </div>
              <div className="flex items-center gap-2">{paramIcon(log.checkType)}<span className="text-sm font-medium capitalize">{log.checkType.replace(/_/g, " ")}</span><span className="text-xs text-muted-foreground">→ {log.result}</span></div>
              {log.notes && <p className="text-xs text-muted-foreground mt-1 italic">📝 {log.notes}</p>}
            </CardContent></Card>
          );
        })}
        {qcLogs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada QC log. QC dilakukan saat proses produksi.</p>}
      </div>
    </div>
  );
}
