import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertTriangle, Boxes, TrendingDown } from "lucide-react";

const tenantId = "demo";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const products = useQuery(api.products.list, { tenantId }) ?? [];
  const items = (products && typeof products === "object" && "items" in products) ? products.items : [];

  const enriched = items.map((p: any) => ({
    ...p,
    status: p.stockQuantity <= 0 ? "critical" : p.stockQuantity <= p.minStock ? "low" : "ok",
  }));

  const filtered = enriched.filter((i: any) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || i.status === filter;
    return matchSearch && matchFilter;
  });

  const criticalCount = enriched.filter((i: any) => i.status === "critical").length;
  const lowCount = enriched.filter((i: any) => i.status === "low").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Inventaris</h1>
        <p className="text-sm text-muted-foreground">{items.length} item • {criticalCount} kritis • {lowCount} menipis</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="cursor-pointer" onClick={() => setFilter(filter === "critical" ? "all" : "critical")}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div><p className="text-2xl font-bold text-destructive">{criticalCount}</p><p className="text-xs text-muted-foreground">Stok Kritis</p></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setFilter(filter === "low" ? "all" : "low")}>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-amber-500" />
            <div><p className="text-2xl font-bold text-amber-500">{lowCount}</p><p className="text-xs text-muted-foreground">Stok Menipis</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Boxes className="h-5 w-5 text-emerald-500" />
            <div><p className="text-2xl font-bold text-emerald-500">{enriched.filter((i: any) => i.status === "ok").length}</p><p className="text-xs text-muted-foreground">Stok Aman</p></div>
          </CardContent>
        </Card>
      </div>
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari nama atau SKU..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Nama Item</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Stok</TableHead><TableHead className="text-right">Min</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.map((i: any) => (
            <TableRow key={i._id}>
              <TableCell className="font-medium">{i.name}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">{i.sku}</TableCell>
              <TableCell className="text-right font-semibold">{i.stockQuantity}</TableCell>
              <TableCell className="text-right text-muted-foreground">{i.minStock}</TableCell>
              <TableCell>
                <Badge variant={i.status === "critical" ? "destructive" : i.status === "low" ? "outline" : "secondary"} className="text-xs capitalize">
                  {i.status === "critical" ? "Kritis" : i.status === "low" ? "Menipis" : "Aman"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada item.</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}
