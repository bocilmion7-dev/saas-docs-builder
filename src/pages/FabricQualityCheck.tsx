import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, AlertTriangle, Ruler } from "lucide-react";

interface QualityCheck {
  id: string;
  rollNumber: string;
  productName: string;
  checkTypes: string[];
  result: "pass" | "fail";
  selisihPanjangPercent?: number;
  isClaimed: boolean;
  checkedBy: string;
  checkedAt: string;
  notes?: string;
}

const MOCK_CHECKS: QualityCheck[] = [
  { id: "1", rollNumber: "RL-001", productName: "Kain Batik Solo 150cm", checkTypes: ["panjang", "noda", "gramasi", "bau"], result: "pass", selisihPanjangPercent: 0.5, isClaimed: false, checkedBy: "Staff Gudang", checkedAt: "2026-09-03" },
  { id: "2", rollNumber: "RL-009", productName: "Kain Denim 150", checkTypes: ["panjang", "robek", "gramasi"], result: "fail", selisihPanjangPercent: 3.2, isClaimed: true, checkedBy: "Staff Gudang", checkedAt: "2026-09-03", notes: "Selisih panjang >2%, klaim ke supplier" },
  { id: "3", rollNumber: "RL-010", productName: "Kain Katun 115", checkTypes: ["noda", "bau", "lubang"], result: "pass", isClaimed: false, checkedBy: "Staff Gudang", checkedAt: "2026-09-03" },
];

export default function FabricQualityCheck() {
  const [checks] = useState(MOCK_CHECKS);
  const [search, setSearch] = useState("");

  const filtered = checks.filter(c => !search || c.productName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fabric Quality Check</h1>
        <p className="text-sm text-muted-foreground">Cek panjang roll • Selisih {'>'}2% klaim supplier • Noda/robek/lubang/bau apek/gramasi timbang sample</p>
      </div>
      <Input placeholder="Cari roll/kain..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map(qc => (
          <Card key={qc.id} className={qc.result === "fail" ? "border-red-200" : "border-green-200"}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {qc.result === "pass" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                    <span className="font-semibold">{qc.productName}</span>
                    <Badge variant={qc.result === "pass" ? "default" : "destructive"}>
                      {qc.result === "pass" ? "PASS" : "FAIL"}
                    </Badge>
                    {qc.isClaimed && <Badge className="bg-amber-100 text-amber-800 text-xs">Klaim Dikirim</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">Roll: {qc.rollNumber} • {qc.checkedAt} • {qc.checkedBy}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {qc.checkTypes.map(t => (
                      <Badge key={t} variant="outline" className="text-xs capitalize">{t}</Badge>
                    ))}
                  </div>
                  {qc.selisihPanjangPercent !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${qc.selisihPanjangPercent > 2 ? "text-red-600" : "text-green-600"}`}>
                      <Ruler className="h-3 w-3" />
                      Selisih: {qc.selisihPanjangPercent}% {qc.selisihPanjangPercent > 2 && "Klaim ke supplier!"}
                    </div>
                  )}
                  {qc.notes && <p className="text-xs text-muted-foreground mt-2 italic">📝 {qc.notes}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
