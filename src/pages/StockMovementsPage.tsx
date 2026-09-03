import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenantId } from "@/hooks/use-tenant";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";

const typeConfig: Record<string, { label: string; cls: string; icon: any; color: string }> = {
  in_purchase: { label: "Pembelian", cls: "bg-emerald-500/10 text-emerald-600", icon: ArrowDownCircle, color: "text-emerald-500" },
  in_adjustment: { label: "Adjustment +", cls: "bg-emerald-500/10 text-emerald-600", icon: ArrowDownCircle, color: "text-emerald-500" },
  in_return: { label: "Retur", cls: "bg-emerald-500/10 text-emerald-600", icon: ArrowDownCircle, color: "text-emerald-500" },
  out_sale: { label: "Penjualan", cls: "bg-blue-500/10 text-blue-600", icon: ArrowUpCircle, color: "text-blue-500" },
  out_waste: { label: "Waste", cls: "bg-red-500/10 text-red-600", icon: ArrowUpCircle, color: "text-red-500" },
  out_adjustment: { label: "Adjustment -", cls: "bg-amber-500/10 text-amber-600", icon: ArrowUpCircle, color: "text-amber-500" },
};

export default function StockMovementsPage() {
  const tenantId = useTenantId() ?? "";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const movements = useQuery(api.stockMovements.list, tenantId ? {
    tenantId,
    type: filter === "all" ? undefined : filter,
    search: search || undefined,
  } : "skip") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Riwayat Stok</h1>
        <p className="text-sm text-muted-foreground mt-1">Pergerakan stok masuk & keluar beserta audit trail</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari produk atau referensi..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {["all", "in", "out"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f === "all" ? "Semua" : f === "in" ? "Masuk" : "Keluar"}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="hidden sm:table-cell">Tipe</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Sebelum</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Sesudah</TableHead>
                <TableHead className="hidden md:table-cell">Referensi</TableHead>
                <TableHead className="hidden lg:table-cell">Catatan</TableHead>
                <TableHead className="hidden md:table-cell">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => {
                const tc = typeConfig[m.type] ?? typeConfig.out_sale;
                const TcIcon = tc.icon;
                return (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium text-sm">{m.productId}</TableCell>
                    <TableCell className="hidden sm:table-cell"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tc.cls}`}><TcIcon className="size-3" />{tc.label}</span></TableCell>
                    <TableCell className={`text-right font-bold ${m.qty > 0 ? "text-emerald-500" : "text-red-500"}`}>{m.qty > 0 ? "+" : ""}{m.qty}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-sm text-muted-foreground">{m.qtyBefore}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-sm font-medium">{m.qtyAfter}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">{m.referenceType} {m.referenceId}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{m.note}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  </TableRow>
                );
              })}
              {movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <ArrowDownCircle className="size-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Belum ada pergerakan stok</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
