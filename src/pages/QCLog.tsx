import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Scale, Ruler, Paintbrush, Cookie, Thermometer, Cherry } from "lucide-react";

interface QCLog {
  id: string;
  batchNumber: string;
  productName: string;
  checks: { param: string; value: string; pass: boolean }[];
  overallPass: boolean;
  checkedBy: string;
  checkedAt: string;
  notes?: string;
}

const MOCK_LOGS: QCLog[] = [
  { id: "1", batchNumber: "BAT-001", productName: "Roti Tawar 400gr", checks: [
    { param: "Berat", value: "398gr", pass: true },
    { param: "Ukuran", value: "20cm", pass: true },
    { param: "Warna Kulit", value: "Kuning keemasan", pass: true },
    { param: "Tekstur", value: "Empuk berserat", pass: true },
    { param: "Rasa", value: "Manis pas", pass: true },
    { param: "Aroma", value: "Wangi tepung", pass: true },
  ], overallPass: true, checkedBy: "Head Baker", checkedAt: "2026-09-03 06:30" },
  { id: "2", batchNumber: "BAT-002", productName: "Croissant Butter", checks: [
    { param: "Berat", value: "120gr", pass: true },
    { param: "Ukuran", value: "12cm", pass: true },
    { param: "Warna Kulit", value: "Coklat keemasan", pass: true },
    { param: "Tekstur", value: "Layered", pass: true },
    { param: "Rasa", value: "Butter rich", pass: true },
    { param: "Aroma", value: "Wangi butter", pass: true },
  ], overallPass: true, checkedBy: "Head Baker", checkedAt: "2026-09-03 07:00" },
  { id: "3", batchNumber: "BAT-003", productName: "Kue Lapis", checks: [
    { param: "Berat", value: "250gr", pass: true },
    { param: "Ukuran", value: "15cm", pass: true },
    { param: "Warna Kulit", value: "Kuning pucat", pass: false },
    { param: "Tekstur", value: "Lembut", pass: true },
    { param: "Rasa", value: "Manis", pass: true },
    { param: "Aroma", value: "Santan", pass: true },
  ], overallPass: false, checkedBy: "Head Baker", checkedAt: "2026-09-03 08:00", notes: "Warna kurang kuning, oven mungkin perlu kalibrasi" },
];

export default function QCLog() {
  const [logs] = useState(MOCK_LOGS);
  const [search, setSearch] = useState("");

  const filtered = logs.filter(l => !search || l.productName.toLowerCase().includes(search.toLowerCase()));

  const paramIcon = (p: string) => {
    if (p.includes("Berat")) return <Scale className="h-3 w-3" />;
    if (p.includes("Ukuran")) return <Ruler className="h-3 w-3" />;
    if (p.includes("Warna")) return <Paintbrush className="h-3 w-3" />;
    if (p.includes("Tekstur") || p.includes("Rasa")) return <Cookie className="h-3 w-3" />;
    return <Cherry className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QC Log — 6 Parameters</h1>
        <p className="text-sm text-muted-foreground">Quality control: berat, ukuran, warna kulit kuning keemasan, tekstur empuk berserat, rasa, aroma, suhu</p>
      </div>
      <Input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-4">
        {filtered.map(log => (
          <Card key={log.id} className={!log.overallPass ? "border-red-300" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{log.productName}</CardTitle>
                  <p className="text-xs text-muted-foreground">Batch: {log.batchNumber} • {log.checkedAt} • {log.checkedBy}</p>
                </div>
                <Badge variant={log.overallPass ? "default" : "destructive"}>
                  {log.overallPass ? <><CheckCircle className="mr-1 h-3 w-3" /> PASS</> : <><XCircle className="mr-1 h-3 w-3" /> FAIL</>}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {log.checks.map((c, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${c.pass ? "bg-green-50" : "bg-red-50"}`}>
                    <span className={c.pass ? "text-green-600" : "text-red-600"}>{paramIcon(c.param)}</span>
                    <div>
                      <p className="text-xs font-medium">{c.param}</p>
                      <p className={`text-xs ${c.pass ? "text-green-700" : "text-red-700"}`}>{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {log.notes && <p className="text-xs text-muted-foreground mt-3 italic">📝 {log.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
