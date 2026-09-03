import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle2, XCircle, PackageCheck, Banknote } from "lucide-react";
import { toast } from "sonner";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const statusMap: Record<string, { label: string; cls: string }> = {
  completed: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600" },
  preparing: { label: "Disiapkan", cls: "bg-blue-500/10 text-blue-600" },
  confirmed: { label: "Dikonfirmasi", cls: "bg-amber-500/10 text-amber-600" },
  pending: { label: "Menunggu", cls: "bg-muted text-muted-foreground" },
  served: { label: "Tersaji", cls: "bg-purple-500/10 text-purple-600" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-500/10 text-red-600" },
};

const payMap: Record<string, { label: string; cls: string }> = {
  paid: { label: "✓ Dibayar", cls: "bg-emerald-500/10 text-emerald-600" },
  pending: { label: "Belum dibayar", cls: "bg-amber-500/10 text-amber-600" },
  unpaid: { label: "Belum dibayar", cls: "bg-amber-500/10 text-amber-600" },
  refunded: { label: "Refunded", cls: "bg-blue-500/10 text-blue-600" },
};

const METHOD_LABEL: Record<string, string> = {
  tunai: "Tunai (offline)", qris: "QRIS", kartu_debit: "Kartu Debit",
  kartu_kredit: "Kartu Kredit", transfer: "Transfer", tempo: "WhatsApp/Manual",
  midtrans: "Midtrans", cod: "COD",
};

export default function OrdersPage() {
  const tenantId = useTenantId() ?? "";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const result = useQuery(api.orders.list, { tenantId });
  const allOrders = (result && typeof result === "object" && "items" in result) ? result.items : [];
  const updatePayment = useMutation(api.orders.updatePayment);
  const updateStatus = useMutation(api.orders.updateStatus);

  const filtered = allOrders.filter((o: any) => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const markPaid = async (o: any) => {
    try {
      await updatePayment({ id: o._id, paymentStatus: "paid" });
      toast.success(`${o.orderNumber} ditandai dibayar`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
  };

  const markStatus = async (o: any, status: any) => {
    try {
      await updateStatus({ id: o._id, status });
      toast.success(`${o.orderNumber} → ${statusMap[status]?.label ?? status}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pesanan</h1>
          <p className="text-sm text-muted-foreground">{allOrders.length} total pesanan · Konfirmasi pembayaran & status pesanan storefront (online/COD/WhatsApp)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari nomor order..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">
        {["all", "pending", "confirmed", "preparing", "served", "completed", "cancelled"].map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize text-xs">{f === "all" ? "Semua" : f}</Button>
        ))}
      </div>
      <Card><CardContent className="p-0 overflow-x-auto"><Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pembayaran</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((o: any) => {
            const st = statusMap[o.status] ?? { label: o.status, cls: "" };
            const pay = payMap[o.paymentStatus] ?? { label: o.paymentStatus ?? "—", cls: "" };
            const active = o.status === "pending" || o.status === "confirmed" || o.status === "preparing" || o.status === "served";
            return (
              <TableRow key={o._id}>
                <TableCell className="font-mono text-sm font-semibold whitespace-nowrap">{o.orderNumber}</TableCell>
                <TableCell><Badge className={`text-xs ${st.cls}`}>{st.label}</Badge></TableCell>
                <TableCell><Badge variant="outline" className={`text-xs ${pay.cls}`}>{pay.label}</Badge></TableCell>
                <TableCell className="text-right font-semibold whitespace-nowrap">{formatRp(o.grandTotal)}</TableCell>
                <TableCell className="text-xs">{METHOD_LABEL[o.paymentMethod ?? ""] ?? o.paymentMethod ?? "-"}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} {new Date(o.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5 flex-wrap">
                    {active && o.paymentStatus !== "paid" && o.status !== "cancelled" && (
                      <Button size="sm" variant="outline" className="gap-1 text-emerald-600" onClick={() => markPaid(o)}><Banknote className="size-3.5" /> Tandai Dibayar</Button>
                    )}
                    {active && (
                      <Button size="sm" variant="outline" className="gap-1 text-blue-600" onClick={() => markStatus(o, o.status === "pending" ? "confirmed" : o.status === "confirmed" ? "preparing" : o.status === "preparing" ? "served" : "completed")}>
                        <PackageCheck className="size-3.5" /> {o.status === "pending" ? "Konfirmasi" : o.status === "confirmed" ? "Proses" : o.status === "preparing" ? "Siap" : "Selesai"}
                      </Button>
                    )}
                    {o.status !== "cancelled" && (
                      <Button size="sm" variant="ghost" className="gap-1 text-red-500" onClick={() => markStatus(o, "cancelled")}><XCircle className="size-3.5" /> Batal</Button>
                    )}
                    {o.status === "completed" && <CheckCircle2 className="size-4 text-emerald-500 self-center" />}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada pesanan.</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}
