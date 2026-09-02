import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle, Search, Filter } from "lucide-react";

const sampleMovements = [
  { id: "1", product: "Susu Full Cream", type: "out_sale", qty: -2, before: 20, after: 18, ref: "ORD-001", note: "Penjualan Kopi Susu", date: "2026-09-02 10:15" },
  { id: "2", product: "Biji Kopi Arabica", type: "out_sale", qty: -0.5, before: 45, after: 44.5, ref: "ORD-001", note: "18gr x 27 order", date: "2026-09-02 10:15" },
  { id: "3", product: "Cup 8oz", type: "out_sale", qty: -3, before: 500, after: 497, ref: "ORD-002", note: "Penjualan Es Teh", date: "2026-09-02 10:30" },
  { id: "4", product: "Susu Full Cream", type: "in_purchase", qty: 20, before: 18, after: 38, ref: "GRN-001", note: "Penerimaan dari Dairy Susu", date: "2026-09-02 09:00" },
  { id: "5", product: "Susu Full Cream", type: "out_waste", qty: -2, before: 40, after: 38, ref: "WASTE-001", note: "Expired <5°C", date: "2026-09-02 08:30" },
  { id: "6", product: "Gula Aren", type: "out_sale", qty: -1, before: 8, after: 7, ref: "ORD-003", note: "20ml x 50 order", date: "2026-09-02 11:00" },
  { id: "7", product: "Gula Aren", type: "in_purchase", qty: 10, before: 7, after: 17, ref: "GRN-002", note: "Restock dari Supplier Gula", date: "2026-09-01 14:00" },
  { id: "8", product: "Cup 8oz", type: "out_waste", qty: -10, before: 510, after: 500, ref: "WASTE-002", note: "Rusak / penyok", date: "2026-09-01 12:00" },
];

const typeConfig: Record<string, { label: string; cls: string; icon: any; color: string }> = {
  in_purchase: { label: "Pembelian", cls: "bg-emerald-500/10 text-emerald-600", icon: ArrowDownCircle, color: "text-emerald-500" },
  in_adjustment: { label: "Adjustment +", cls: "bg-emerald-500/10 text-emerald-600", icon: ArrowDownCircle, color: "text-emerald-500" },
  in_return: { label: "Retur", cls: "bg-emerald-500/10 text-emerald-600", icon: ArrowDownCircle, color: "text-emerald-500" },
  out_sale: { label: "Penjualan", cls: "bg-blue-500/10 text-blue-600", icon: ArrowUpCircle, color: "text-blue-500" },
  out_waste: { label: "Waste", cls: "bg-red-500/10 text-red-600", icon: ArrowUpCircle, color: "text-red-500" },
  out_adjustment: { label: "Adjustment -", cls: "bg-amber-500/10 text-amber-600", icon: ArrowUpCircle, color: "text-amber-500" },
};

export default function StockMovementsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = sampleMovements.filter((m) => {
    const matchSearch = m.product.toLowerCase().includes(search.toLowerCase()) || m.ref.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "in" && m.type.startsWith("in_")) || (filter === "out" && m.type.startsWith("out_"));
    return matchSearch && matchFilter;
  });

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
              {filtered.map((m) => {
                const tc = typeConfig[m.type] ?? typeConfig.out_sale;
                const TcIcon = tc.icon;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.product}</TableCell>
                    <TableCell className="hidden sm:table-cell"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tc.cls}`}><TcIcon className="size-3" />{tc.label}</span></TableCell>
                    <TableCell className={`text-right font-bold ${m.qty > 0 ? "text-emerald-500" : "text-red-500"}`}>{m.qty > 0 ? "+" : ""}{m.qty}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-sm text-muted-foreground">{m.before}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-sm font-medium">{m.after}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">{m.ref}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{m.note}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{m.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
