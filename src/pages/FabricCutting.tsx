import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scissors, Plus, AlertTriangle } from "lucide-react";

interface FabricCut {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  rollNumber: string;
  lengthRequested: number;
  lengthActual: number;
  isMotifMatching: boolean;
  extraCm: number;
  remainingAfter: number;
  isPresisi: boolean;
  cutBy: string;
  status: "completed" | "in_progress";
}

const MOCK_CUTS: FabricCut[] = [
  { id: "1", orderNumber: "ORD-K001", customerName: "Ibu Sari", productName: "Kain Batik Solo 150cm", rollNumber: "RL-001", lengthRequested: 3, lengthActual: 3.08, isMotifMatching: true, extraCm: 8, remainingAfter: 21.92, isPresisi: true, cutBy: "Staff Sales", status: "completed" },
  { id: "2", orderNumber: "ORD-K002", customerName: "Pak Joko", productName: "Kain Denim Lebar 150", rollNumber: "RL-005", lengthRequested: 1.5, lengthActual: 1.5, isMotifMatching: false, extraCm: 0, remainingAfter: 13.5, isPresisi: true, cutBy: "Staff Sales", status: "completed" },
  { id: "3", orderNumber: "ORD-K003", customerName: "Toko Gamis Ayu", productName: "Kain Katun Polos 115", rollNumber: "RL-003", lengthRequested: 2.5, lengthActual: 2.6, isMotifMatching: true, extraCm: 10, remainingAfter: 4.4, isPresisi: false, cutBy: "Staff Sales", status: "completed" },
];

export default function FabricCutting() {
  const [cuts] = useState(MOCK_CUTS);
  const [search, setSearch] = useState("");

  const filtered = cuts.filter(c => !search || c.customerName.toLowerCase().includes(search.toLowerCase()) || c.productName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fabric Cutting</h1>
          <p className="text-sm text-muted-foreground">Cutting presisi • Motif matching +extra 5-10cm • Sisa &lt;0.5m auto remnants barcode REM-xxx diskon 20%</p>
        </div>
        <Button><Scissors className="mr-2 h-4 w-4" /> Cut Baru</Button>
      </div>
      <Input placeholder="Cari order/customer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map(cut => (
          <Card key={cut.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    <span className="font-semibold">{cut.productName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{cut.orderNumber} • {cut.customerName} • Roll: {cut.rollNumber}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span>Minta: <strong>{cut.lengthRequested}m</strong></span>
                    <span>→ Potong: <strong>{cut.lengthActual}m</strong></span>
                    {cut.isMotifMatching && <Badge className="text-xs bg-purple-100 text-purple-800">Motif Matching +{cut.extraCm}cm</Badge>}
                    <span>Sisa roll: <strong>{cut.remainingAfter}m</strong></span>
                  </div>
                  {cut.remainingAfter < 0.5 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" /> Sisa &lt;0.5m → auto create Remnants (REM-xxx, diskon 20%)
                    </div>
                  )}
                </div>
                <Badge variant={cut.status === "completed" ? "default" : "secondary"}>{cut.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
