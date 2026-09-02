import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  BarChart3,
} from "lucide-react";

const stats = [
  { label: "Penjualan Hari Ini", value: "Rp 2.450.000", change: "+12%", icon: TrendingUp, color: "text-emerald-500" },
  { label: "Pesanan Aktif", value: "18", change: "+3", icon: ShoppingCart, color: "text-blue-500" },
  { label: "Total Produk", value: "156", change: "", icon: Package, color: "text-orange-500" },
  { label: "Total Pelanggan", value: "342", change: "+8", icon: Users, color: "text-purple-500" },
];

const recentOrders = [
  { id: "ORD-001", customer: "Andi Wijaya", total: "Rp 125.000", status: "completed", time: "10 menit lalu" },
  { id: "ORD-002", customer: "Sari Dewi", total: "Rp 87.500", status: "preparing", time: "15 menit lalu" },
  { id: "ORD-003", customer: "Budi Santoso", total: "Rp 234.000", status: "confirmed", time: "22 menit lalu" },
  { id: "ORD-004", customer: "Rina Marlina", total: "Rp 56.000", status: "pending", time: "30 menit lalu" },
  { id: "ORD-005", customer: "Dedi Kurniawan", total: "Rp 189.000", status: "completed", time: "45 menit lalu" },
];

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600",
  preparing: "bg-blue-500/10 text-blue-600",
  confirmed: "bg-amber-500/10 text-amber-600",
  pending: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  completed: "Selesai",
  preparing: "Disiapkan",
  confirmed: "Dikonfirmasi",
  pending: "Menunggu",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ringkasan aktivitas toko hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1.5 text-2xl font-extrabold">{s.value}</p>
                  {s.change && (
                    <p className={`mt-1 text-xs font-medium ${s.color} flex items-center gap-0.5`}>
                      <ArrowUpRight className="size-3" />
                      {s.change}
                    </p>
                  )}
                </div>
                <div className={`rounded-lg bg-muted p-2.5 ${s.color}`}>
                  <s.icon className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-mono font-medium text-muted-foreground">
                    {order.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold">{order.total}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ShoppingCart, label: "Buka POS", desc: "Mulai transaksi baru", color: "text-primary bg-primary/10" },
          { icon: Package, label: "Tambah Produk", desc: "Input produk baru", color: "text-emerald-500 bg-emerald-500/10" },
          { icon: BarChart3, label: "Lihat Laporan", desc: "Analisis penjualan", color: "text-purple-500 bg-purple-500/10" },
        ].map((a) => (
          <Card key={a.label} className="border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer">
            <CardContent className="p-5 text-center">
              <div className={`mx-auto mb-2 flex size-10 items-center justify-center rounded-xl ${a.color}`}>
                <a.icon className="size-5" />
              </div>
              <p className="text-sm font-bold">{a.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
