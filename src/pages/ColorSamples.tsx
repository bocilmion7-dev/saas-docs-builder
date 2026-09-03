import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Plus } from "lucide-react";

interface ColorSample {
  id: string;
  colorCode: string;
  colorName: string;
  customerName: string;
  volumeMl: number;
  testerPrice: number;
  status: "requested" | "mixing" | "ready" | "tested" | "approved" | "rejected";
  createdAt: string;
}

const MOCK_SAMPLES: ColorSample[] = [
  { id: "1", colorCode: "Nippon 4316P", colorName: "Putih Tulang", customerName: "Pak Joko", volumeMl: 250, testerPrice: 25000, status: "approved", createdAt: "2026-09-01" },
  { id: "2", colorCode: "Dulux 0Y97-1", colorName: "Krem Gading", customerName: "Bu Rina", volumeMl: 100, testerPrice: 15000, status: "mixing", createdAt: "2026-09-02" },
  { id: "3", colorCode: "Nippon 1052P", colorName: "Abu-abu Dove", customerName: "Budi", volumeMl: 250, testerPrice: 25000, status: "requested", createdAt: "2026-09-03" },
];

export default function ColorSamples() {
  const [samples] = useState(MOCK_SAMPLES);
  const [search, setSearch] = useState("");

  const filtered = samples.filter(s => !search || s.colorName.toLowerCase().includes(search.toLowerCase()) || s.customerName.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string) => {
    const m: Record<string, string> = { requested: "bg-gray-100 text-gray-800", mixing: "bg-blue-100 text-blue-800", ready: "bg-yellow-100 text-yellow-800", tested: "bg-purple-100 text-purple-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };
    return m[s] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Color Samples</h1>
          <p className="text-sm text-muted-foreground">Tester 100/250ml • Status flow: requested → mixing → ready → tested → approved/rejected</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Buat Sample</Button>
      </div>
      <Input placeholder="Cari warna/customer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(s => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4" />
                <span className="font-mono text-xs">{s.colorCode}</span>
                <Badge className={`text-xs capitalize ${statusColor(s.status)}`}>{s.status}</Badge>
              </div>
              <p className="font-medium">{s.colorName}</p>
              <p className="text-xs text-muted-foreground">{s.customerName} • {s.volumeMl}ml</p>
              <p className="text-sm font-bold mt-2">Rp {s.testerPrice.toLocaleString("id")}</p>
              <div className="flex gap-1 mt-3">
                {s.status === "requested" && <Button size="sm" className="text-xs">Mulai Mixing</Button>}
                {s.status === "mixing" && <Button size="sm" className="text-xs">Mark Ready</Button>}
                {s.status === "ready" && <Button size="sm" className="text-xs">Mark Tested</Button>}
                {s.status === "tested" && <><Button size="sm" className="text-xs bg-green-600">Approve</Button><Button size="sm" variant="destructive" className="text-xs">Reject</Button></>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
