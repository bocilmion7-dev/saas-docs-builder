import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Search, Eye, Shield, CheckCircle, Clock, Ban, AlertTriangle } from "lucide-react";

const tenants = [
  { id: "1", name: "Kopi Senja", subdomain: "kopisenja", category: "cafe", status: "active", plan: "Pro", trialEnds: "—", createdAt: "2026-08-01" },
  { id: "2", name: "Ayam Goreng Mantap", subdomain: "ayamgorengmantap", category: "restoran", status: "trialing", plan: "Free Trial", trialEnds: "2026-09-16", createdAt: "2026-09-02" },
  { id: "3", name: "Minimart Jaya", subdomain: "minimartjaya", category: "toko_retail", status: "active", plan: "Starter", trialEnds: "—", createdAt: "2026-08-15" },
  { id: "4", name: "Bengkel Jaya", subdomain: "bengkeljaya", category: "bengkel", status: "expired", plan: "Free Trial", trialEnds: "2026-08-19", createdAt: "2026-08-05" },
  { id: "5", name: "Roti Enak", subdomain: "rotienak", category: "bakery", status: "trialing", plan: "Free Trial", trialEnds: "2026-09-10", createdAt: "2026-09-01" },
  { id: "6", name: "Jaya Cat", subdomain: "jayacat", category: "toko_cat", status: "past_due", plan: "Starter", trialEnds: "2026-08-28", createdAt: "2026-07-20" },
  { id: "7", name: "Luxury Spa Bali", subdomain: "luxuryspa-bali", category: "spa", status: "active", plan: "Pro", trialEnds: "—", createdAt: "2026-07-10" },
  { id: "8", name: "Sparepart Murah", subdomain: "sparepart-murah", category: "toko_sparepart", status: "suspended", plan: "Free Trial", trialEnds: "2026-08-15", createdAt: "2026-08-01" },
];

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  active: { label: "Aktif", cls: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  trialing: { label: "Trial", cls: "bg-blue-500/10 text-blue-600", icon: Clock },
  past_due: { label: "Lewat Tempo", cls: "bg-amber-500/10 text-amber-600", icon: AlertTriangle },
  expired: { label: "Expired", cls: "bg-red-500/10 text-red-600", icon: Ban },
  suspended: { label: "Suspended", cls: "bg-muted text-muted-foreground", icon: Ban },
};

const categoryLabels: Record<string, string> = {
  cafe: "☕", restoran: "🍜", toko_retail: "🛒", bengkel: "🔧",
  bakery: "🍞", toko_cat: "🎨", spa: "💆", toko_sparepart: "🚗", toko_kain: "🧵",
};

export default function PlatformTenants() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = tenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.subdomain.includes(search);
    const matchFilter = filter === "all" || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manajemen Tenant</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola semua toko — override status, plan, trial, impersonate</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau subdomain..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["all", "active", "trialing", "past_due", "expired", "suspended"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
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
                    <TableCell className="hidden sm:table-cell text-lg">{categoryLabels[t.category]}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="secondary">{t.plan}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{t.trialEnds}</TableCell>
                    <TableCell><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}><st.icon className="size-3" />{st.label}</span></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="text-[10px] h-7" onClick={() => setOpen(true)}>Override</Button>
                        <Button size="sm" variant="ghost" className="text-[10px] h-7"><Eye className="size-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Override Tenant</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex gap-2 flex-wrap">
                {["trialing", "active", "past_due", "expired", "suspended", "cancelled"].map((s) => (
                  <button key={s} className={`px-3 py-1 rounded-lg text-xs font-medium border ${s === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-300" : "bg-muted text-muted-foreground border-border"}`}>
                    {statusConfig[s]?.label ?? s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2"><Label>Trial Days Override</Label><Input type="number" placeholder="7 / 14 / 30 / 60" /></div>
            <div className="grid gap-2">
              <Label>Assign Plan</Label>
              <div className="flex gap-2 flex-wrap">
                {["Free Trial", "Starter", "Pro", "Enterprise"].map((p) => (
                  <button key={p} className={`px-3 py-1 rounded-lg text-xs font-medium border ${p === "Pro" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => setOpen(false)}>Simpan Override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
