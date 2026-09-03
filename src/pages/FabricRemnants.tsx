import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tag, AlertTriangle } from "lucide-react";

interface Remnant {
  id: string;
  barcode: string;
  productName: string;
  rollNumber: string;
  lengthMeter: number;
  price: number;
  discountedPrice: number;
  status: "available" | "sold";
}

const MOCK_REMNANTS: Remnant[] = [
  { id: "1", barcode: "REM-001", productName: "Kain Batik Solo 150cm", rollNumber: "RL-001", lengthMeter: 0.42, price: 50000, discountedPrice: 40000, status: "available" },
  { id: "2", barcode: "REM-002", productName: "Kain Katun Polos 115", rollNumber: "RL-003", lengthMeter: 0.35, price: 30000, discountedPrice: 24000, status: "sold" },
  { id: "3", barcode: "REM-003", productName: "Kain Sutra 150", rollNumber: "RL-008", lengthMeter: 0.48, price: 120000, discountedPrice: 96000, status: "available" },
];

export default function FabricRemnants() {
  const [remnants] = useState(MOCK_REMNANTS);
  const [search, setSearch] = useState("");

  const filtered = remnants.filter(r => !search || r.productName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fabric Remnants</h1>
        <p className="text-sm text-muted-foreground">Sisa &lt;0.5m • Barcode REM-xxx • Diskon 20% • Label Jenis/Meter/Tanggal</p>
      </div>
      <Input placeholder="Cari kain..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.filter(r => r.status === "available").map(r => (
          <Card key={r.id} className="border-dashed border-amber-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-amber-600" />
                <span className="font-mono text-xs font-bold text-amber-600">{r.barcode}</span>
                <Badge className="text-xs bg-amber-100 text-amber-800">Diskon 20%</Badge>
              </div>
              <p className="font-medium text-sm">{r.productName}</p>
              <p className="text-xs text-muted-foreground">Roll: {r.rollNumber} • Sisa: {r.lengthMeter}m</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-bold">Rp {r.discountedPrice.toLocaleString("id")}</span>
                <span className="text-xs text-muted-foreground line-through">Rp {r.price.toLocaleString("id")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
