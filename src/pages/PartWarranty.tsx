import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Clock, AlertTriangle } from "lucide-react";

interface WarrantyClaim {
  id: string;
  orderNumber: string;
  productName: string;
  oemNumber: string;
  customerName: string;
  purchaseDate: string;
  claimDate: string;
  warrantyType: string;
  durationMonths: number;
  kmLimit: number;
  isPhysicalDamage: boolean;
  installationError: boolean;
  status: "valid" | "invalid";
  resolution: string;
  supplierClaimStatus: string;
}

const MOCK_CLAIMS: WarrantyClaim[] = [
  { id: "1", orderNumber: "ORD-001", productName: "Oil Filter Toyota", oemNumber: "90915-YZZD4", customerName: "Budi Santoso", purchaseDate: "2026-04-01", claimDate: "2026-09-03", warrantyType: "original", durationMonths: 6, kmLimit: 20000, isPhysicalDamage: false, installationError: false, status: "valid", resolution: "Ganti baru gratis", supplierClaimStatus: "submitted" },
  { id: "2", orderNumber: "ORD-003", productName: "Kampas Rem Depan", oemNumber: "04465-48160", customerName: "Rina Melati", purchaseDate: "2026-07-15", claimDate: "2026-09-03", warrantyType: "aftermarket", durationMonths: 3, kmLimit: 10000, isPhysicalDamage: false, installationError: true, status: "invalid", resolution: "Tolak - kesalahan pemasangan", supplierClaimStatus: "n/a" },
];

export default function PartWarranty() {
  const [claims] = useState(MOCK_CLAIMS);
  const [search, setSearch] = useState("");

  const filtered = claims.filter(c => !search || c.productName.toLowerCase().includes(search.toLowerCase()) || c.customerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Part Warranty & Claims</h1>
        <p className="text-sm text-muted-foreground">Original/OEM 3-6 bulan 10-20K KM • Aftermarket 1-3 bulan • Body tidak ada oli kecuali cacat</p>
      </div>
      <Input placeholder="Cari produk/customer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map(claim => (
          <Card key={claim.id} className={claim.status === "invalid" ? "border-red-200" : "border-green-200"}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-semibold">{claim.productName}</span>
                    <Badge className={claim.status === "valid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {claim.status === "valid" ? "✅ Valid" : "❌ Invalid"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">OEM: {claim.oemNumber} • {claim.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">Customer: {claim.customerName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Beli: {claim.purchaseDate}</span>
                    <span>Claim: {claim.claimDate}</span>
                    <span>{claim.durationMonths} bulan / {claim.kmLimit} KM</span>
                  </div>
                  {claim.isPhysicalDamage && <Badge variant="destructive" className="text-xs mt-2">Fisik Rusak</Badge>}
                  {claim.installationError && <Badge variant="destructive" className="text-xs mt-2">Salah Pasang</Badge>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{claim.resolution}</p>
                  <p className="text-xs text-muted-foreground mt-1">Supplier: {claim.supplierClaimStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
