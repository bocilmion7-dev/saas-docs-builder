import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Clock, AlertTriangle, Plus } from "lucide-react";

interface PreOrder {
  id: string;
  customerName: string;
  productName: string;
  oemNumber: string;
  brand: string;
  quantity: number;
  deposit: number;
  depositPercent: number;
  totalPrice: number;
  estimatedArrival: string;
  status: "pending" | "ordered" | "arrived" | "ready_pickup" | "completed";
}

const MOCK_ORDERS: PreOrder[] = [
  { id: "1", customerName: "Budi Santoso", productName: "ECU Toyota Avanza", oemNumber: "89110-BZ080", brand: "Toyota", quantity: 1, deposit: 2500000, depositPercent: 50, totalPrice: 5000000, estimatedArrival: "2026-09-05", status: "ordered" },
  { id: "2", customerName: "Andi Wijaya", productName: "Alternator Honda Civic", oemNumber: "31100-5AA-A01", brand: "Denso", quantity: 1, deposit: 1750000, depositPercent: 100, totalPrice: 1750000, estimatedArrival: "2026-09-04", status: "arrived" },
];

export default function PreOrder() {
  const [orders] = useState(MOCK_ORDERS);
  const [search, setSearch] = useState("");

  const filtered = orders.filter(o => !search || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.productName.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string) => {
    const m: Record<string, string> = { pending: "bg-gray-100 text-gray-800", ordered: "bg-blue-100 text-blue-800", arrived: "bg-green-100 text-green-800", ready_pickup: "bg-purple-100 text-purple-800", completed: "bg-green-200 text-green-900" };
    return m[s] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pre-Order Parts</h1>
          <p className="text-sm text-muted-foreground">Deposit 50-100% • Estimasi 1-3 hari</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Pre-Order Baru</Button>
      </div>
      <Input placeholder="Cari customer/produk..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map(order => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-semibold">{order.productName}</span>
                    <Badge className={`text-xs capitalize ${statusColor(order.status)}`}>{order.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">OEM: {order.oemNumber} • {order.brand}</p>
                  <p className="text-xs text-muted-foreground">Customer: {order.customerName} • Qty: {order.quantity}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Estimasi: {order.estimatedArrival}</span>
                    <Badge variant="outline" className="text-xs">Deposit {order.depositPercent}%</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">Rp {order.totalPrice.toLocaleString("id")}</p>
                  <p className="text-xs text-green-600">DP: Rp {order.deposit.toLocaleString("id")}</p>
                  {order.status === "arrived" && <Button size="sm" className="mt-2">Siap Diambil</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
