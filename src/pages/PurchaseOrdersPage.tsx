import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileText, CheckCircle, Truck, XCircle } from "lucide-react";

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
  const tenantId = "demo";
  const purchaseOrders = useQuery(api.purchaseOrders.list, { tenantId }) ?? [];
  const suppliers = useQuery(api.suppliers.list, { tenantId }) ?? [];
  const createPO = useMutation(api.purchaseOrders.create);
  const updatePOStatus = useMutation(api.purchaseOrders.updateStatus);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplierId: "", totalCost: 0, notes: "" });

  const filtered = purchaseOrders.filter((p) => {
    const matchSearch = p.poNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const save = async () => {
    if (!form.supplierId) return;
    const poCount = purchaseOrders.length + 1;
    await createPO({ tenantId, supplierId: form.supplierId, poNumber: `PO-${String(poCount).padStart(3, "0")}`, totalCost: form.totalCost, notes: form.notes });
    setOpen(false);
    setForm({ supplierId: "", totalCost: 0, notes: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Purchase Order</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola pesanan pembelian ke supplier</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="size-4" /> Buat PO Baru</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["open", "confirmed", "shipped", "received"].map((s) => (
          <Card key={s} className="border-border/60">
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-extrabold ${s === "received" ? "text-emerald-500" : s === "confirmed" ? "text-blue-500" : "text-muted-foreground"}`}>
                {purchaseOrders.filter((p) => p.status === s).length}
              </p>
              <p className="text-xs text-muted-foreground">{statusConfig[s]?.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nomor PO..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const st = statusConfig[p.status] ?? statusConfig.open;
                const supplier = suppliers.find((s) => s._id === p.supplierId);
                return (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono font-medium">{p.poNumber}</TableCell>
                    <TableCell className="hidden sm:table-cell">{supplier?.name ?? p.supplierId}</TableCell>
                    <TableCell className="text-right font-medium">{formatRp(p.totalCost)}</TableCell>
                    <TableCell className="hidden sm:table-cell"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}><st.icon className="size-3" />{st.label}</span></TableCell>
                    <TableCell className="text-right">
                      {p.status === "open" && <Button size="sm" variant="outline" onClick={() => updatePOStatus({ id: p._id, status: "confirmed" })}>Confirm</Button>}
                      {p.status === "confirmed" && <Button size="sm" onClick={() => updatePOStatus({ id: p._id, status: "shipped" })}>Ship</Button>}
                      {p.status === "shipped" && <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updatePOStatus({ id: p._id, status: "received" })}>Receive</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <FileText className="size-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Belum ada purchase order</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Buat PO Baru</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <select value={form.supplierId} onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option value="">Pilih supplier...</option>
                {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Total Estimasi (Rp)</Label>
              <Input type="number" value={form.totalCost || ""} onChange={(e) => setForm((f) => ({ ...f, totalCost: +e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Catatan</Label>
              <Input placeholder="Keterangan (opsional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save}>Buat PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
