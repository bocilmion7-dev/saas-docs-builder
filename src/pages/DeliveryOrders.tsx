import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Plus, FileText } from "lucide-react";

interface DeliveryOrder {
  id: string;
  doNumber: string;
  projectName: string;
  customerName: string;
  vehicleNumber: string;
  driverName: string;
  quantityTotal: number;
  status: "prepared" | "shipped" | "received";
  signedBy?: string;
  createdAt: string;
}

const MOCK_DOS: DeliveryOrder[] = [
  { id: "1", doNumber: "DO-001", projectName: "Pengecatan Kantor Pusat", customerName: "PT Maju Jaya", vehicleNumber: "B 1234 CD", driverName: "Pak Wayan", quantityTotal: 20, status: "received", signedBy: "Manager PT Maju Jaya", createdAt: "2026-09-01" },
  { id: "2", doNumber: "DO-002", projectName: "Cat Villa Ubud", customerName: "Ibu Sarah", vehicleNumber: "DK 5678 EF", driverName: "Pak Ketut", quantityTotal: 8, status: "shipped", createdAt: "2026-09-03" },
];

export default function DeliveryOrders() {
  const [dos] = useState(MOCK_DOS);
  const [search, setSearch] = useState("");

  const filtered = dos.filter(d => !search || d.projectName.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string) => {
    const m: Record<string, string> = { prepared: "bg-yellow-100 text-yellow-800", shipped: "bg-blue-100 text-blue-800", received: "bg-green-100 text-green-800" };
    return m[s] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Orders (Surat Jalan)</h1>
          <p className="text-sm text-muted-foreground">DO Surat Jalan • Vehicle • Driver • Signed by penerima</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Buat DO</Button>
      </div>
      <Input placeholder="Cari proyek..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {dos.map(d => (
          <Card key={d.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="font-mono text-xs font-bold">{d.doNumber}</span>
                    <Badge className={`text-xs capitalize ${statusColor(d.status)}`}>{d.status}</Badge>
                  </div>
                  <p className="font-medium mt-1">{d.projectName}</p>
                  <p className="text-xs text-muted-foreground">{d.customerName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>🚗 {d.vehicleNumber}</span>
                    <span>👤 {d.driverName}</span>
                    <span>📦 {d.quantityTotal} pail/kg</span>
                    <span>📅 {d.createdAt}</span>
                  </div>
                  {d.signedBy && <p className="text-xs text-green-700 mt-1">✅ Signed: {d.signedBy}</p>}
                </div>
                {d.status === "prepared" && <Button size="sm">Ship</Button>}
                {d.status === "shipped" && <Button size="sm">Mark Received</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
