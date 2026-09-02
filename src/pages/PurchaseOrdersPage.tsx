import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileText, CheckCircle, Truck, Clock, XCircle } from "lucide-react";

const samplePO = [
  { id: "PO-001", supplier: "Dairy Susu Segar", items: 3, total: 450000, status: "received", date: "2026-09-01", expectedDate: "2026-09-02" },
  { id: "PO-002", supplier: "Roastery Kopi ABC", items: 2, total: 1200000, status: "shipped", date: "2026-09-02", expectedDate: "2026-09-04" },
  { id: "PO-003", supplier: "Toko Packaging", items: 5, total: 280000, status: "confirmed", date: "2026-09-02", expectedDate: "2026-09-05" },
  { id: "PO-004", supplier: "Supplier Gula Aren", items: 1, total: 350000, status: "open", date: "2026-09-02", expectedDate: "2026-09-06" },
  { id: "PO-005", supplier: "Premium Syrup Co", items: 4, total: 680000, status: "cancelled", date: "2026-08-30", expectedDate: "2026-09-02" },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  open: { label: "Draft", cls: "bg-muted text-muted-foreground", icon: FileText },
  confirmed: { label: "Dikonfirmasi", cls: "bg-blue-500/10 text-blue-600", icon: CheckCircle },
  shipped: { label: "Dikirim", cls: "bg-amber-500/10 text-amber-600", icon: Truck },
  received: { label: "Diterima", cls: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  closed: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  cancelled: { label: "Dibatalkan", cls: "bg-red-500/10 text-red-600", icon: XCircle },
};

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = samplePO.filter((p) => {
    const matchSearch = p.id.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Purchase Order</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola pesanan pembelian ke supplier</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="size-4" /> Buat PO Baru</Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open", count: samplePO.filter((p) => p.status === "open").length, color: "text-muted-foreground" },
          { label: "Dikonfirmasi", count: samplePO.filter((p) => p.status === "confirmed").length, color: "text-blue-500" },
          { label: "Dikirim", count: samplePO.filter((p) => p.status === "shipped").length, color: "text-amber-500" },
          { label: "Diterima", count: samplePO.filter((p) => p.status === "received").length, color: "text-emerald-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nomor PO atau supplier..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", "open", "confirmed", "shipped", "received"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f === "all" ? "Semua" : statusConfig[f]?.label ?? f}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead className="hidden sm:table-cell">Supplier</TableHead>
                <TableHead className="text-center hidden md:table-cell">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                <TableHead className="hidden md:table-cell">Estimasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const st = statusConfig[p.status] ?? statusConfig.open;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-medium">{p.id}</TableCell>
                    <TableCell className="hidden sm:table-cell">{p.supplier}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">{p.items}</TableCell>
                    <TableCell className="text-right font-medium">{formatRp(p.total)}</TableCell>
                    <TableCell className="hidden sm:table-cell"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}><st.icon className="size-3" />{st.label}</span></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{p.date}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{p.expectedDate}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Buat PO Baru</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Supplier</Label><Input placeholder="Pilih supplier" /></div>
            <div className="grid gap-2"><Label>Tanggal Jatuh Tempo</Label><Input type="date" /></div>
            <div className="grid gap-2"><Label>Catatan</Label><Input placeholder="Keterangan (opsional)" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => setOpen(false)}>Buat PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
