import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, Users, AlertTriangle, Coffee, UtensilsCrossed, ShoppingCart, Wrench, Cake, Paintbrush, Sparkles, Car, Scissors } from "lucide-react";

const categoryIcons: Record<string, { label: string; icon: any; color: string }> = {
  cafe: { label: "Cafe", icon: Coffee, color: "text-amber-600" },
  restoran: { label: "Restoran", icon: UtensilsCrossed, color: "text-red-500" },
  toko_retail: { label: "Retail", icon: ShoppingCart, color: "text-blue-500" },
  bakery: { label: "Bakery", icon: Cake, color: "text-pink-500" },
  toko_cat: { label: "Toko Cat", icon: Paintbrush, color: "text-emerald-500" },
  spa: { label: "Spa", icon: Sparkles, color: "text-purple-500" },
  bengkel: { label: "Bengkel", icon: Wrench, color: "text-slate-500" },
  toko_sparepart: { label: "Sparepart", icon: Car, color: "text-sky-500" },
  toko_kain: { label: "Kain", icon: Scissors, color: "text-yellow-600" },
};

const formatRp = (n: number) => n === 0 ? "Gratis" : "Rp " + n.toLocaleString("id-ID");

export default function PlatformAnalytics() {
  const stats = useQuery(api.tenants.stats);
  const plans = useQuery(api.subscriptionPlans.list);

  if (!stats || !plans) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat data...</div>;
  }

  // Calculate MRR from active tenants per plan
  const planPrices: Record<string, number> = {};
  for (const plan of plans) {
    planPrices[plan.slug] = plan.priceMonthly;
  }

  const totalTrialing = stats.trialing;
  const totalActive = stats.active;
  const conversionRate = stats.total > 0 ? Math.round((totalActive / stats.total) * 100) : 0;

  const categoryStats = Object.entries(stats.byCategory).map(([key, count]) => {
    const info = categoryIcons[key];
    return { key, name: info?.label ?? key, icon: info?.icon ?? Building2, color: info?.color ?? "text-gray-500", count };
  }).filter((c) => c.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview tokobuilder.id — tenants, conversion, categories</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="mt-1.5 text-2xl font-extrabold">{stats.total}</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5 text-blue-500"><Building2 className="size-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif / Trialing</p>
                <p className="mt-1.5 text-2xl font-extrabold">{totalActive} / {totalTrialing}</p>
                <p className="mt-1 text-xs font-medium text-emerald-500">{conversionRate}% conversion</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5 text-emerald-500"><Users className="size-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired + Suspended</p>
                <p className="mt-1.5 text-2xl font-extrabold">{stats.expired + stats.suspended}</p>
                <p className="mt-1 text-xs font-medium text-amber-500">{stats.expired} expired, {stats.suspended} suspended</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5 text-amber-500"><AlertTriangle className="size-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subscription Plans</p>
                <p className="mt-1.5 text-2xl font-extrabold">{plans.length}</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5 text-primary"><TrendingUp className="size-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Category */}
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Tenants per Kategori</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {categoryStats.length === 0 && <p className="text-sm text-muted-foreground">Belum ada tenant</p>}
            {categoryStats.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`size-8 flex items-center justify-center rounded-lg bg-muted ${c.color}`}><Icon className="size-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{c.name}</p>
                      <span className="text-xs text-muted-foreground">{c.count} tenant</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((c.count / Math.max(stats.total, 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Revenue per Plan */}
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Subscription Plans</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {plans.map((p) => (
              <div key={p._id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-lg font-extrabold text-primary">{formatRp(p.priceMonthly)}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{p.maxProducts.toLocaleString()} produk, {p.maxStaff} staff, trial {p.trialDaysDefault} hari</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
