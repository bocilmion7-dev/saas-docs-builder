import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Search, Plus } from "lucide-react";

interface CrossRef {
  id: string;
  oemNumber: string;
  productName: string;
  references: { brand: string; number: string; type: "original" | "oem" | "aftermarket" | "kw_super" }[];
  category: string;
  vehicle: string;
}

const MOCK_REFS: CrossRef[] = [
  { id: "1", oemNumber: "90915-YZZD4", productName: "Oil Filter Toyota", category: "Mesin", vehicle: "Avanza 1.3/1.5, Xenia", references: [
    { brand: "Toyota", number: "90915-YZZD4", type: "original" },
    { brand: "NGK", number: "NFR-6H11", type: "oem" },
    { brand: "Denso", number: "DXE-1004", type: "oem" },
    { brand: "Bosch", number: "F026407044", type: "aftermarket" },
  ]},
  { id: "2", oemNumber: "90080-91180", productName: "Spark Plug", category: "Mesin", vehicle: "Avanza 1.3, Agya", references: [
    { brand: "Denso", number: "SK20R11", type: "original" },
    { brand: "NGK", number: "ILKAR7B-11", type: "oem" },
    { brand: "Bosch", number: "FR7HI332", type: "aftermarket" },
  ]},
  { id: "3", oemNumber: "04465-48160", productName: "Kampas Rem Depan", category: "Rem", vehicle: "Avanza/Xenia 2012-2021", references: [
    { brand: "Toyota", number: "04465-48160", type: "original" },
    { brand: "Akebono", number: "ACT1233", type: "oem" },
    { brand: "Aspira", number: "PHC-1233", type: "aftermarket" },
    { brand: "KW Super", number: "KR-04465", type: "kw_super" },
  ]},
];

export default function CrossReference() {
  const [refs] = useState(MOCK_REFS);
  const [search, setSearch] = useState("");

  const filtered = refs.filter(r => {
    const q = search.toLowerCase();
    return !q || r.oemNumber.toLowerCase().includes(q) || r.productName.toLowerCase().includes(q) || r.vehicle.toLowerCase().includes(q) || r.references.some(ref => ref.number.toLowerCase().includes(q));
  });

  const typeColor = (t: string) => {
    const m: Record<string, string> = { original: "bg-blue-100 text-blue-800", oem: "bg-green-100 text-green-800", aftermarket: "bg-orange-100 text-orange-800", kw_super: "bg-gray-100 text-gray-800" };
    return m[t] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Part Cross-Reference</h1>
          <p className="text-sm text-muted-foreground">OEM / Aftermarket / KW Super — NGK, Denso, Bosch, Akebono</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Tambah Cross-Ref</Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nomor part, nama, kendaraan..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-4">
        {filtered.map(ref => (
          <Card key={ref.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{ref.productName}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">OEM: {ref.oemNumber} • {ref.vehicle}</p>
                </div>
                <Badge variant="outline">{ref.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {ref.references.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded bg-gray-50">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono font-medium w-20">{r.brand}</span>
                    <span className="text-xs font-mono flex-1">{r.number}</span>
                    <Badge className={`text-xs capitalize ${typeColor(r.type)}`}>{r.type.replace("_", " ")}</Badge>
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
