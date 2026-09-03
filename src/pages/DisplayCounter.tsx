import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Snowflake, Clock, Package, Plus, Edit } from "lucide-react";

interface DisplayCounter {
  id: string;
  name: string;
  type: "chiller" | "rak_roti";
  temperatureTarget: number;
  status: "active" | "inactive";
  items: CounterItem[];
}
interface CounterItem {
  id: string;
  productName: string;
  batchNumber: string;
  qtyDisplay: number;
  position: string;
  expiryDate: string;
  isFresh: boolean;
}

const MOCK_COUNTERS: DisplayCounter[] = [
  { id: "1", name: "Chiller Roti", type: "chiller", temperatureTarget: 12, status: "active", items: [
    { id: "a", productName: "Roti Tawar 400gr", batchNumber: "BAT-001", qtyDisplay: 12, position: "Front", expiryDate: "2026-09-04", isFresh: true },
    { id: "b", productName: "Croissant Butter", batchNumber: "BAT-002", qtyDisplay: 8, position: "Back", expiryDate: "2026-09-04", isFresh: true },
    { id: "c", productName: "Donat Coklat", batchNumber: "BAT-004", qtyDisplay: 6, position: "Front", expiryDate: "2026-09-03", isFresh: false },
  ]},
  { id: "2", name: "Rak Kue", type: "rak_roti", temperatureTarget: 25, status: "active", items: [
    { id: "d", productName: "Kue Lapis", batchNumber: "BAT-003", qtyDisplay: 5, position: "Top", expiryDate: "2026-09-05", isFresh: true },
    { id: "e", productName: "Nastar", batchNumber: "BAT-005", qtyDisplay: 10, position: "Middle", expiryDate: "2026-09-06", isFresh: true },
  ]},
];

export default function DisplayCounterPage() {
  const [counters, setCounters] = useState(MOCK_COUNTERS);
  const [search, setSearch] = useState("");

  const filtered = counters.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const expiringSoon = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Display Counter</h1>
          <p className="text-sm text-muted-foreground">Chiller 10-15°C • Rak roti • Rotasi baru belakang (FIFO) • Label Fresh + expiry</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Tambah Counter</Button>
      </div>
      <Input placeholder="Cari counter..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-4">
        {filtered.map(counter => (
          <Card key={counter.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${counter.type === "chiller" ? "bg-blue-100" : "bg-amber-100"}`}>
                    <Snowflake className={`h-5 w-5 ${counter.type === "chiller" ? "text-blue-600" : "text-amber-600"}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{counter.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{counter.type === "chiller" ? "Chiller" : "Rak Roti"} • Target: {counter.temperatureTarget}°C • {counter.items.length} items</p>
                  </div>
                </div>
                <Badge variant={counter.status === "active" ? "default" : "secondary"}>{counter.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {counter.items.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()).map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-2 rounded-lg ${expiringSoon(item.expiryDate) ? "bg-red-50" : "bg-gray-50"}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.productName}</span>
                        {item.isFresh && <Badge className="text-xs bg-green-100 text-green-800">Fresh</Badge>}
                        {expiringSoon(item.expiryDate) && <Badge variant="destructive" className="text-xs">Expiring!</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">Batch: {item.batchNumber} • Qty: {item.qtyDisplay} • Posisi: {item.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Expiry</p>
                      <p className={`text-xs font-medium ${expiringSoon(item.expiryDate) ? "text-red-600" : ""}`}>{item.expiryDate}</p>
                    </div>
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
