import { useTenantId } from "@/hooks/use-tenant";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Package,
  Users, ShoppingCart, Clock, Tag, Percent, PieChart, Crown,
} from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const PAYMENT_LABELS: Record<string, string> = {
  tunai: "Tunai", qris: "QRIS", kartu_debit: "Kartu Debit", kartu_kredit: "Kartu Kredit",
  transfer: "Transfer", tempo: "Tempo", room_charge: "Room Charge", corporate: "Corporate",
};

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

function Bar({ value, max, color = "bg-emerald-500" }: { value: number; max: number; color?: string }) {
  return (
    <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}

export default function ReportsPage() {
  const tenantId = useTenantId() ?? "";
  const enabled = !!tenantId;
  const report = useQuery(api.reports.overview, enabled ? { tenantId } : "skip");
  const sales = useQuery(api.reports.sales, enabled ? { tenantId, days: 7 } : "skip");
  const finance = useQuery(api.reports.finance, enabled ? { tenantId } : "skip");

  if (!report || !sales || !finance) return <div className="p-8 text-muted-foreground text-center">Loading...</div>;

  const maxDayRevenue = Math.max(...sales.daily.map((d: any) => d.revenue || 1));
  const maxCatRevenue = Math.max(...sales.byCategory.map((c: any) => c.revenue || 1));
  const maxSkuQty = Math.max(...sales.topSku.map((s: any) => s.qty || 1));
  const maxCatMargin = Math.max(...finance.byCategory.map((c: any) => c.revenue || 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Laporan</h1>
        <p className="text-sm text-muted-foreground">Ringkasan performa bisnis — harian, keuangan, & produk</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Harian (7 hari)</TabsTrigger>
          <TabsTrigger value="finance">Keuangan (P&L)</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ─────────────────────────────────────────── */}
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

        {/* ── HARIAN ───────────────────────────────────────────── */}
        <TabsContent value="daily" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Revenue (7 hari)" value={formatRp(sales.totalRevenue)} icon={DollarSign} color="text-emerald-500" />
            <StatCard label="Order (7 hari)" value={String(sales.totalOrders)} icon={ShoppingCart} color="text-blue-500" />
            <StatCard label="Total Diskon" value={formatRp(sales.totalDiscount)} icon={Tag} color="text-amber-500" />
            <StatCard label="Jam Tersibuk" value={sales.peakHours.length > 0 ? `${String(sales.peakHours[0].hour).padStart(2, "0")}:00` : "-"} icon={Clock} color="text-red-500" />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Revenue Harian</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {sales.daily.map((d: any) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{d.date}</span>
                  <Bar value={d.revenue} max={maxDayRevenue} />
                  <span className="text-xs font-mono w-24 text-right">{formatRp(d.revenue)}</span>
                  <span className="text-xs text-muted-foreground w-8 text-right">{d.count}</span>
                </div>
              ))}
              {sales.daily.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada penjualan 7 hari terakhir.</p>}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChart className="h-4 w-4" /> Revenue per Kategori</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {sales.byCategory.map((c: any) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-xs w-28 truncate">{c.name}</span>
                    <Bar value={c.revenue} max={maxCatRevenue} color="bg-blue-500" />
                    <span className="text-xs font-mono w-24 text-right">{formatRp(c.revenue)}</span>
                    <span className="text-xs text-muted-foreground w-8 text-right">{c.count}</span>
                  </div>
                ))}
                {sales.byCategory.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada data.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Peak Hours</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {sales.peakHours.slice(0, 6).map((p: any) => (
                  <div key={p.hour} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span className="text-sm font-semibold">{String(p.hour).padStart(2, "0")}:00</span>
                    <span className="text-xs text-muted-foreground">{p.count} order • {formatRp(p.revenue)}</span>
                  </div>
                ))}
                {sales.peakHours.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada data.</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Metode Pembayaran</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {sales.byPayment.map((p: any) => (
                <div key={p.method} className="rounded-lg border px-3 py-2">
                  <p className="text-sm font-semibold">{PAYMENT_LABELS[p.method] ?? p.method}</p>
                  <p className="text-xs text-muted-foreground">{p.count} order • {formatRp(p.revenue)}</p>
                </div>
              ))}
              {sales.byPayment.length === 0 && <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── KEUANGAN P&L ─────────────────────────────────────── */}
        <TabsContent value="finance" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={formatRp(finance.revenue)} icon={DollarSign} color="text-emerald-500" />
            <StatCard label="COGS (HPP)" value={formatRp(finance.cogs)} icon={Package} color="text-blue-500" />
            <StatCard label="Gross Profit" value={formatRp(finance.grossProfit)} icon={TrendingUp} color="text-emerald-500" />
            <StatCard label="Margin Kotor" value={`${finance.grossMarginPercent.toFixed(1)}%`} icon={Percent} color="text-emerald-500" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Expense" value={formatRp(finance.totalExpenses)} icon={TrendingDown} color="text-red-500" />
            <StatCard label="Net Profit" value={formatRp(finance.netProfit)} icon={Crown} color={finance.netProfit >= 0 ? "text-emerald-500" : "text-red-500"} />
            <StatCard label="Margin Bersih" value={`${finance.netMarginPercent.toFixed(1)}%`} icon={Percent} color={finance.netMarginPercent >= 0 ? "text-emerald-500" : "text-red-500"} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Margin per Kategori (P&L)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {finance.byCategory.map((c: any) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-xs w-28 truncate">{c.name}</span>
                  <Bar value={c.revenue} max={maxCatMargin} color={c.marginPercent >= 0 ? "bg-emerald-500" : "bg-red-500"} />
                  <span className="text-xs font-mono w-24 text-right">{formatRp(c.revenue)}</span>
                  <span className="text-xs font-mono w-24 text-right text-muted-foreground">COGS {formatRp(c.cogs)}</span>
                  <span className={`text-xs font-bold w-20 text-right ${c.marginPercent >= 0 ? "text-emerald-600" : "text-red-600"}`}>{c.marginPercent.toFixed(1)}%</span>
                </div>
              ))}
              {finance.byCategory.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada data penjualan.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PRODUK ───────────────────────────────────────────── */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Top SKU Terlaris (7 hari)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {sales.topSku.map((s: any, idx: number) => (
                <div key={s.productId} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-5 text-muted-foreground">#{idx + 1}</span>
                  <span className="text-sm flex-1 truncate">{s.name}</span>
                  <Bar value={s.qty} max={maxSkuQty} color="bg-violet-500" />
                  <span className="text-xs font-mono w-10 text-right">{s.qty} pcs</span>
                  <span className="text-xs font-mono w-24 text-right">{formatRp(s.revenue)}</span>
                </div>
              ))}
              {sales.topSku.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada penjualan 7 hari terakhir.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Total Produk Terdaftar</p>
                <p className="text-xs text-muted-foreground mt-1">Kelola produk, harga & markup di menu Produk</p>
              </div>
              <p className="text-2xl font-extrabold text-primary">{report.totalProducts}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}