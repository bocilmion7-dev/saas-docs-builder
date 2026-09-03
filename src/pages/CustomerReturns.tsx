import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Package, AlertTriangle } from "lucide-react";

interface Return {
  id: string;
  orderNumber: string;
  productName: string;
  customerName: string;
  reason: string;
  condition: "masih_baru" | "sudah_terpasang" | "rusak";
  within3Days: boolean;
  packagingIntact: boolean;
  refundMethod: string;
  refundAmount: number;
  status: "approved" | "rejected";
}

const MOCK_RETURNS: Return[] = [
  { id: "1", orderNumber: "ORD-005", productName: "Kampas Rem Yamaha Mio", customerName: "Andi", reason: "Salah beli - tidak cocok", condition: "masih_baru", within3Days: true, packagingIntact: true, refundMethod: "tunai", refundAmount: 85000, status: "approved" },
  { id: "2", orderNumber: "ORD-008", productName: "Filter Udara Honda", customerName: "Rina", reason: "Salah kirim", condition: "masih_baru", within3Days: false, packagingIntact: true, refundMethod: "store_credit", refundAmount: 65000, status: "rejected" },
];

export default function CustomerReturns() {
  const [returns] = useState(MOCK_RETURNS);
  const [search, setSearch] = useState("");

  const filtered = returns.filter(r => !search || r.productName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Returns (Sparepart)</h1>
        <p className="text-sm text-muted-foreground">Max 3 hari • Kemasan utuh • Belum terpasang • Refund tunai/store credit/transfer</p>
      </div>
      <Input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map(ret => (
          <Card key={ret.id} className={!ret.within3Days || !ret.packagingIntact ? "border-red-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span className="font-semibold">{ret.productName}</span>
                    <Badge variant={ret.status === "approved" ? "default" : "destructive"}>{ret.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{ret.orderNumber} • {ret.customerName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Alasan: {ret.reason}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={ret.within3Days ? "outline" : "destructive"} className="text-xs">
                      {ret.within3Days ? "≤3 hari ✓" : ">3 hari ✗"}
                    </Badge>
                    <Badge variant={ret.packagingIntact ? "outline" : "destructive"} className="text-xs">
                      {ret.packagingIntact ? "Kemasan utuh ✓" : "Kemasan rusak ✗"}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">{ret.condition.replace("_", " ")}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">Rp {ret.refundAmount.toLocaleString("id")}</p>
                  <p className="text-xs text-muted-foreground capitalize">{ret.refundMethod.replace("_", " ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
