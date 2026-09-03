import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const tenantId = "demo";

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
  const result = useQuery(api.orders.list, { tenantId });
  const allOrders = (result && typeof result === "object" && "items" in result) ? result.items : [];

  const filtered = allOrders.filter((o: any) => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Pesanan</h1>
        <p className="text-sm text-muted-foreground">{allOrders.length} total pesanan</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari nomor order..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="flex gap-1 flex-wrap">
          {["all", "pending", "confirmed", "preparing", "served", "completed", "cancelled"].map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize text-xs">{f === "all" ? "Semua" : f}</Button>
          ))}
        </div>
      </div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Metode</TableHead><TableHead>Waktu</TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.map((o: any) => {
            const st = statusMap[o.status] ?? { label: o.status, cls: "" };
            return (
              <TableRow key={o._id}>
                <TableCell className="font-mono text-sm font-semibold">{o.orderNumber}</TableCell>
                <TableCell><Badge className={`text-xs ${st.cls}`}>{st.label}</Badge></TableCell>
                <TableCell className="text-right font-semibold">{formatRp(o.grandTotal)}</TableCell>
                <TableCell className="text-xs capitalize">{o.paymentMethod ?? "-"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" })}</TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada pesanan.</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}
