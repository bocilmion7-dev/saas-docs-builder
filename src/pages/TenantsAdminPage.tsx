import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "src/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Building2, Search, Plus, Ban, CheckCircle, Clock, AlertTriangle, Eye,
} from "lucide-react";

const sampleTenants = [
  { id: "1", name: "Kopi Senja", subdomain: "kopisenja", category: "cafe", status: "active", trialEndsAt: "2026-09-16", plan: "Pro" },
  { id: "2", name: "Ayam Goreng Mantap", subdomain: "ayamgorengmantap", category: "restoran", status: "trialing", trialEndsAt: "2026-09-16", plan: "Free Trial" },
  { id: "3", name: "Minimart Jaya", subdomain: "minimartjaya", category: "toko_retail", status: "active", trialEndsAt: "2026-10-02", plan: "Starter" },
  { id: "4", name: "Bengkel Jaya", subdomain: "bengkeljaya", category: "bengkel", status: "expired", trialEndsAt: "2026-08-19", plan: "Free Trial" },
  { id: "5", name: "Roti Enak", subdomain: "rotienak", category: "bakery", status: "trialing", trialEndsAt: "2026-09-10", plan: "Free Trial" },
  { id: "6", name: "Jaya Cat", subdomain: "jayacat", category: "toko_cat", status: "past_due", trialEndsAt: "2026-08-28", plan: "Starter" },
  { id: "7", name: "Luxury Spa Bali", subdomain: "luxuryspa-bali", category: "spa", status: "active", trialEndsAt: "2026-10-02", plan: "Pro" },
  { id: "8", name: "Sparepart Murah", subdomain: "sparepart-murah", category: "toko_sparepart", status: "suspended", trialEndsAt: "2026-08-15", plan: "Free Trial" },
];

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  active: { label: "Aktif", cls: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  trialing: { label: "Trial", cls: "bg-blue-500/10 text-blue-600", icon: Clock },
  past_due: { label: "Lewat Tempo", cls: "bg-amber-500/10 text-amber-600", icon: AlertTriangle },
  expired: { label: "Expired", cls: "bg-red-500/10 text-red-600", icon: Ban },
  suspended: { label: "Suspended", cls: "bg-muted text-muted-foreground", icon: Ban },
  cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground", icon: Ban },
};

const categoryLabels: Record<string, string> = {
  cafe: "☕ Cafe", restoran: "🍜 Restoran", toko_retail: "🛒 Retail", bengkel: "🔧 Bengkel",
  bakery: "🍰 Bakery", toko_cat: "🎨 Toko Cat", spa: "💆 Spa", toko_sparepart: "🚗 Sparepart", toko_kain: "🧵 Kain",
};

export default function TenantsAdminPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = sampleTenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.subdomain.includes(search);
    const matchFilter = filter === "all" || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manajemen Tenant</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola semua toko yang terdaftar di platform</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Tambah Tenant</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: sampleTenants.length, color: "text-foreground" },
          { label: "Aktif", value: sampleTenants.filter((t) => t.status === "active").length, color: "text-emerald-500" },
          { label: "Trial", value: sampleTenants.filter((t) => t.status === "trialing").length, color: "text-blue-500" },
          { label: "Expired", value: sampleTenants.filter((t) => t.status === "expired" || t.status === "suspended").length, color: "text-red-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau subdomain..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", "active", "trialing", "past_due", "expired", "suspended"].map((f) => (
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
                <TableHead>Toko</TableHead>
                <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                <TableHead className="hidden md:table-cell">Plan</TableHead>
                <TableHead className="hidden md:table-cell">Trial Selesai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const st = statusConfig[t.status] ?? statusConfig.suspended;
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{t.subdomain}.tokobuilder.id</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{categoryLabels[t.category] ?? t.category}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t.plan}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{t.trialEndsAt}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                        <st.icon className="size-3" />
                        {st.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="size-8"><Eye className="size-3.5" /></Button>
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
