import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, CheckCircle, Clock, Ban, AlertTriangle, Loader2 } from "lucide-react";

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  active: { label: "Aktif", cls: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  trialing: { label: "Trial", cls: "bg-blue-500/10 text-blue-600", icon: Clock },
  past_due: { label: "Lewat Tempo", cls: "bg-amber-500/10 text-amber-600", icon: AlertTriangle },
  expired: { label: "Expired", cls: "bg-red-500/10 text-red-600", icon: Ban },
  suspended: { label: "Suspended", cls: "bg-muted text-muted-foreground", icon: Ban },
  cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground", icon: Ban },
};

const categoryLabels: Record<string, string> = {
  cafe: "☕", restoran: "🍜", toko_retail: "🛒", bengkel: "🔧",
  bakery: "🍞", toko_cat: "🎨", spa: "💆", toko_sparepart: "🚗", toko_kain: "🧵", toko_pakaian: "👕",
};

export default function PlatformTenants() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [overrideTenant, setOverrideTenant] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const tenantData = useQuery(api.tenants.list, {
    search: search || undefined,
    status: filter !== "all" ? filter : undefined,
    limit: 100,
  });
  const stats = useQuery(api.tenants.stats);
  const updateStatus = useMutation(api.tenants.updateStatus);

  const tenants = tenantData?.items ?? [];

  const handleOverride = async () => {
    if (!overrideTenant || !newStatus) return;
    setSaving(true);
    try {
      await updateStatus({ id: overrideTenant._id, status: newStatus as any });
      setOverrideTenant(null);
      setNewStatus("");
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manajemen Tenant</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola semua toko — override status, plan, trial, impersonate</p>
        </div>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(["trialing", "active", "past_due", "expired", "suspended"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(filter === s ? "all" : s)} className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors border ${filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border/60 hover:border-primary/40"}`}>
              {statusConfig[s]?.label}: {(stats as any)[s] ?? 0}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau subdomain..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Toko</TableHead>
                <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                <TableHead className="hidden md:table-cell">Subdomain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada tenant</TableCell></TableRow>
              )}
              {tenants.map((t) => {
                const st = statusConfig[t.status] ?? statusConfig.suspended;
                return (
                  <TableRow key={t._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("id-ID")}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-lg">{categoryLabels[t.category]}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">{t.subdomain}.tokobuilder.id</TableCell>
                    <TableCell><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}><st.icon className="size-3" />{st.label}</span></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-[10px] h-7" onClick={() => { setOverrideTenant(t); setNewStatus(t.status); }}>Override</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog open={!!overrideTenant} onOpenChange={() => setOverrideTenant(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Override: {overrideTenant?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex gap-2 flex-wrap">
                {(["trialing", "active", "past_due", "expired", "suspended", "cancelled"] as const).map((s) => (
                  <button key={s} onClick={() => setNewStatus(s)} className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${newStatus === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
                    {statusConfig[s]?.label ?? s}
                  </button>
                ))}
              </div>
            </div>
            {overrideTenant?.trialEndsAt && (
              <p className="text-xs text-muted-foreground">Trial berakhir: {new Date(overrideTenant.trialEndsAt).toLocaleDateString("id-ID")}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideTenant(null)}>Batal</Button>
            <Button onClick={handleOverride} disabled={saving || newStatus === overrideTenant?.status}>
              {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : null} Simpan Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
