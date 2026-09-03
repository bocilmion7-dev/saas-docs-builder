import { useTenantId } from "@/hooks/use-tenant";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Package, Users, ShoppingCart } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function StatCard({ label, value, icon: Icon, color = "text-primary" }: {
  label: string; value: string; icon: any; color?: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-xl font-extrabold mt-0.5 ${color}`}>{value}</div>
          </div>
          <Icon className="size-5 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const tenantId = useTenantId() ?? "";
  const report = useQuery(api.reports.overview, { tenantId });

  if (!report) return <div className="p-8 text-muted-foreground text-center">Loading...</div>;

  const marginPercent = report.totalRevenue > 0 ? ((report.netProfit / report.totalRevenue) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Laporan</h1>
        <p className="text-sm text-muted-foreground">Ringkasan performa bisnis</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="finance">Keuangan</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenue Total" value={formatRp(report.totalRevenue)} icon={DollarSign} color="text-emerald-500" />
            <StatCard label="Total Pesanan" value={String(report.totalOrders)} icon={ShoppingCart} color="text-blue-500" />
            <StatCard label="Pelanggan" value={String(report.totalCustomers)} icon={Users} color="text-purple-500" />
            <StatCard label="Produk" value={String(report.totalProducts)} icon={Package} color="text-orange-500" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenue Hari Ini" value={formatRp(report.todayRevenue)} icon={TrendingUp} color="text-emerald-500" />
            <StatCard label="Pesanan Hari Ini" value={String(report.todayOrders)} icon={BarChart3} />
            <StatCard label="Pesanan Selesai" value={String(report.completedOrders)} icon={TrendingUp} color="text-emerald-500" />
            <StatCard label="Pesanan Batal" value={String(report.cancelledOrders)} icon={AlertTriangle} color="text-red-500" />
          </div>
        </TabsContent>
        <TabsContent value="finance" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Total Revenue" value={formatRp(report.totalRevenue)} icon={DollarSign} color="text-emerald-500" />
            <StatCard label="Total Expense" value={formatRp(report.totalExpenses)} icon={TrendingDown} color="text-red-500" />
            <StatCard label="Net Profit" value={formatRp(report.netProfit)} icon={TrendingUp} color={report.netProfit >= 0 ? "text-emerald-500" : "text-red-500"} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue 7 Hari Terakhir</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.last7Days.map((d: any) => {
                  const maxRevenue = Math.max(...report.last7Days.map((x: any) => x.revenue || 1));
                  return (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">{d.date}</span>
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-mono w-24 text-right">{formatRp(d.revenue)}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">{d.count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total produk terdaftar: <strong>{report.totalProducts}</strong></p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
