import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, AlertTriangle, Boxes, TrendingDown } from "lucide-react";

const sampleInventory = [
  { id: "1", name: "Biji Kopi Arabica", sku: "RK-001", stock: 45, minStock: 20, unit: "kg", status: "ok" },
  { id: "2", name: "Susu Full Cream", sku: "BB-001", stock: 8, minStock: 15, unit: "liter", status: "low" },
  { id: "3", name: "Gula Aren", sku: "BB-002", stock: 3, minStock: 5, unit: "kg", status: "critical" },
  { id: "4", name: "Cup 8oz", sku: "PK-001", stock: 500, minStock: 200, unit: "pcs", status: "ok" },
  { id: "5", name: "Sirup Vanilla", sku: "BB-003", stock: 12, minStock: 10, unit: "liter", status: "ok" },
  { id: "6", name: "Es Batu", sku: "BB-004", stock: 25, minStock: 30, unit: "kg", status: "low" },
  { id: "7", name: "Whipped Cream", sku: "BB-005", stock: 1, minStock: 5, unit: "kg", status: "critical" },
  { id: "8", name: "Topping Boba", sku: "BB-006", stock: 40, minStock: 15, unit: "kg", status: "ok" },
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = sampleInventory.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "low" && i.status === "low") ||
      (filter === "critical" && i.status === "critical") ||
      (filter === "ok" && i.status === "ok");
    return matchSearch && matchFilter;
  });

  const criticalCount = sampleInventory.filter((i) => i.status === "critical").length;
  const lowCount = sampleInventory.filter((i) => i.status === "low").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Inventaris</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitoring stok bahan baku dan barang</p>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2.5 text-red-500"><AlertTriangle className="size-5" /></div>
            <div>
              <p className="text-2xl font-extrabold">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Stok Kritis</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500"><TrendingDown className="size-5" /></div>
            <div>
              <p className="text-2xl font-extrabold">{lowCount}</p>
              <p className="text-xs text-muted-foreground">Stok Rendah</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500"><Boxes className="size-5" /></div>
            <div>
              <p className="text-2xl font-extrabold">{sampleInventory.length}</p>
              <p className="text-xs text-muted-foreground">Total Item</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari item..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {["all", "critical", "low", "ok"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f === "all" ? "Semua" : f === "critical" ? "Kritis" : f === "low" ? "Rendah" : "Aman"}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Min Stok</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground font-mono text-xs">{i.sku}</TableCell>
                  <TableCell className="text-right font-bold">
                    {i.stock} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span>
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-muted-foreground text-sm">{i.minStock} {i.unit}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      i.status === "critical" ? "bg-red-500/10 text-red-600" :
                      i.status === "low" ? "bg-amber-500/10 text-amber-600" :
                      "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {i.status === "critical" ? "Kritis" : i.status === "low" ? "Rendah" : "Aman"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
