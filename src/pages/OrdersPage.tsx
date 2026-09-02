import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ShoppingCart, Eye } from "lucide-react";

const sampleOrders = [
  { id: "ORD-001", customer: "Andi Wijaya", items: 3, total: 125000, status: "completed", date: "2026-09-02 10:15", payment: "QRIS" },
  { id: "ORD-002", customer: "Sari Dewi", items: 2, total: 87500, status: "preparing", date: "2026-09-02 10:30", payment: "Tunai" },
  { id: "ORD-003", customer: "Budi Santoso", items: 5, total: 234000, status: "confirmed", date: "2026-09-02 10:42", payment: "Transfer" },
  { id: "ORD-004", customer: "Rina Marlina", items: 1, total: 56000, status: "pending", date: "2026-09-02 10:55", payment: "Tunai" },
  { id: "ORD-005", customer: "Dedi Kurniawan", items: 4, total: 189000, status: "completed", date: "2026-09-02 11:10", payment: "Debit" },
  { id: "ORD-006", customer: "Maya Putri", items: 2, total: 67000, status: "cancelled", date: "2026-09-02 11:25", payment: "QRIS" },
  { id: "ORD-007", customer: "Rudi Hartono", items: 6, total: 312000, status: "completed", date: "2026-09-02 11:40", payment: "Kartu Kredit" },
  { id: "ORD-008", customer: "Lia Anggraeni", items: 1, total: 45000, status: "served", date: "2026-09-02 11:55", payment: "Tunai" },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const statusMap: Record<string, { label: string; cls: string }> = {
  completed: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600" },
  preparing: { label: "Disiapkan", cls: "bg-blue-500/10 text-blue-600" },
  confirmed: { label: "Dikonfirmasi", cls: "bg-amber-500/10 text-amber-600" },
  pending: { label: "Menunggu", cls: "bg-muted text-muted-foreground" },
  served: { label: "Tersaji", cls: "bg-purple-500/10 text-purple-600" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-500/10 text-red-600" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = sampleOrders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const tabs = ["all", "pending", "confirmed", "preparing", "completed", "cancelled"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Pesanan</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola semua pesanan pelanggan</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t === "all" ? "Semua" : statusMap[t]?.label ?? t}
          </button>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor atau nama pelanggan..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} pesanan</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pesanan</TableHead>
                <TableHead className="hidden sm:table-cell">Pelanggan</TableHead>
                <TableHead className="text-center hidden md:table-cell">Item</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden sm:table-cell">Pembayaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => {
                const st = statusMap[o.status] ?? { label: o.status, cls: "" };
                return (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div>
                        <p className="font-mono text-sm font-medium">{o.id}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{o.customer}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{o.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-center">{o.items}</TableCell>
                    <TableCell className="text-right font-medium">{formatRp(o.total)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{o.payment}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Eye className="size-3.5" />
                      </Button>
                    </TableCell>
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
