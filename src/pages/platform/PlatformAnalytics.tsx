import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, Users, AlertTriangle, Coffee, UtensilsCrossed, ShoppingCart, Wrench, Cake, Paintbrush, Sparkles, Car, Scissors } from "lucide-react";

const stats = [
  { label: "Total Tenants", value: "156", change: "+12", icon: Building2, color: "text-blue-500" },
  { label: "Active Subscribers", value: "89", change: "+8", icon: Users, color: "text-emerald-500" },
  { label: "MRR (Monthly)", value: "Rp 12.450.000", change: "+15%", icon: TrendingUp, color: "text-primary" },
  { label: "Trial Conversion", value: "34%", change: "+2%", icon: AlertTriangle, color: "text-amber-500" },
];

const categoryStats = [
  { name: "Cafe", icon: Coffee, count: 42, active: 28, color: "text-amber-600" },
  { name: "Restoran", icon: UtensilsCrossed, count: 28, active: 18, color: "text-red-500" },
  { name: "Retail", icon: ShoppingCart, count: 22, active: 15, color: "text-blue-500" },
  { name: "Bakery", icon: Cake, count: 15, active: 10, color: "text-pink-500" },
  { name: "Toko Cat", icon: Paintbrush, count: 12, active: 6, color: "text-emerald-500" },
  { name: "Spa", icon: Sparkles, count: 10, active: 5, color: "text-purple-500" },
  { name: "Bengkel", icon: Wrench, count: 12, active: 4, color: "text-slate-500" },
  { name: "Sparepart", icon: Car, count: 8, active: 2, color: "text-sky-500" },
  { name: "Kain", icon: Scissors, count: 7, active: 1, color: "text-yellow-600" },
];

const planRevenue = [
  { plan: "Free Trial", tenants: 67, revenue: 0 },
  { plan: "Starter (Rp99K)", tenants: 52, revenue: 5148000 },
  { plan: "Pro (Rp199K)", tenants: 30, revenue: 5970000 },
  { plan: "Enterprise", tenants: 7, revenue: 1332000 },
];

const formatRp = (n: number) => n === 0 ? "Gratis" : "Rp " + n.toLocaleString("id-ID");

export default function PlatformAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview tokobuilder.id — MRR, tenants, conversion, churn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1.5 text-2xl font-extrabold">{s.value}</p>
                  <p className={`mt-1 text-xs font-medium ${s.color}`}>{s.change} bulan ini</p>
                </div>
                <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}><s.icon className="size-5" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Category */}
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Tenants per Kategori</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {categoryStats.map((c) => (
              <div key={c.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className={`size-8 flex items-center justify-center rounded-lg bg-muted ${c.color}`}><c.icon className="size-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{c.name}</p>
                    <span className="text-xs text-muted-foreground">{c.active}/{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full mt-1"><div className="h-full bg-primary rounded-full" style={{ width: `${(c.active / c.count) * 100}%` }} /></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue per Plan */}
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Revenue per Plan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {planRevenue.map((p) => (
              <div key={p.plan} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{p.plan}</p>
                  <p className="text-lg font-extrabold text-primary">{formatRp(p.revenue)}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{p.tenants} tenant aktif</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
