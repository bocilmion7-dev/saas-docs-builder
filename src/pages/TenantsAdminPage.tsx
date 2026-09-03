import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const statusColor = (s: string) => {
  const m: Record<string, string> = { active: "bg-green-100 text-green-800", trialing: "bg-blue-100 text-blue-800", expired: "bg-red-100 text-red-800", suspended: "bg-gray-100 text-gray-800", past_due: "bg-amber-100 text-amber-800", cancelled: "bg-gray-100 text-gray-800" };
  return m[s] ?? "";
};

export default function TenantsAdminPage() {
  const result = useQuery(api.tenants.list, {});
  const tenants = (result && typeof result === "object" && "items" in result) ? result.items : [];
  const stats = useQuery(api.tenants.stats, {});
  const updateStatus = useMutation(api.tenants.updateStatus);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = tenants.filter((t: any) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.subdomain.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Tenant Management</h1>
          <p className="text-sm text-muted-foreground">{tenants.length} total tenants</p>
        </div>
      </div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.active}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{stats.trialing}</p><p className="text-xs text-muted-foreground">Trialing</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.expired + stats.suspended}</p><p className="text-xs text-muted-foreground">Expired/Suspended</p></CardContent></Card>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari nama atau subdomain..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">Semua Kategori</option>
          {["cafe", "restoran", "toko_retail", "bengkel", "bakery", "toko_cat", "spa", "toko_sparepart", "toko_kain"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
          <option value="all">Semua Status</option>
          {["active", "trialing", "expired", "suspended", "past_due", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Subdomain</TableHead><TableHead>Kategori</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.map((t: any) => (
            <TableRow key={t._id}>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{t.subdomain}.tokobuilder.id</TableCell>
              <TableCell className="text-xs capitalize">{t.category}</TableCell>
              <TableCell><Badge className={`text-xs capitalize ${statusColor(t.status)}`}>{t.status}</Badge></TableCell>
              <TableCell className="text-right space-x-1">
                {t.status !== "active" && <Button size="sm" variant="outline" onClick={() => updateStatus({ id: t._id, status: "active" as any })}>Activate</Button>}
                {t.status === "active" && <Button size="sm" variant="outline" onClick={() => updateStatus({ id: t._id, status: "suspended" as any })}>Suspend</Button>}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada tenant.</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}
