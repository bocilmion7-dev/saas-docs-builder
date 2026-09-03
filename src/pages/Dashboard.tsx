import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Package, Users, TrendingUp, Clock } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const tenantId = "demo";

export default function Dashboard() {
  const products = useQuery(api.products.list, { tenantId });
  const orders = useQuery(api.orders.list, { tenantId });
  const customers = useQuery(api.customers.list, { tenantId });
  const todayStats = useQuery(api.orders.todayStats, { tenantId });

  const items = (products && typeof products === "object" && "items" in products) ? products.items : [];
  const orderItems = (orders && typeof orders === "object" && "items" in orders) ? orders.items : [];
  const customerItems = Array.isArray(customers) ? customers : [];

  const todayRevenue = todayStats?.revenue ?? 0;
  const todayOrdersCount = todayStats?.count ?? 0;
  const recentOrders = orderItems.slice(0, 5);

  const stats = [
    { label: "Penjualan Hari Ini", value: formatRp(todayRevenue), icon: TrendingUp, color: "text-emerald-500" },
    { label: "Pesanan Hari Ini", value: String(todayOrdersCount), icon: ShoppingCart, color: "text-blue-500" },
    { label: "Total Produk", value: String(items.length), icon: Package, color: "text-orange-500" },
    { label: "Total Pelanggan", value: String(customerItems.length), icon: Users, color: "text-purple-500" },
  ];

  const statusLabel: Record<string, string> = { completed: "Selesai", preparing: "Disiapkan", confirmed: "Dikonfirmasi", pending: "Menunggu", served: "Tersaji", cancelled: "Dibatalkan" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Ringkasan aktivitas toko hari ini</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className={`text-xl font-extrabold mt-0.5 ${s.color}`}>{s.value}</div>
                </div>
                <s.icon className="size-5 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Pesanan Terbaru</h2>
          <div className="space-y-2">
            {recentOrders.map((o: any) => (
              <div key={o._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className="font-mono text-sm font-semibold">{o.orderNumber}</span>
                  <span className="text-xs text-muted-foreground ml-2">{formatRp(o.grandTotal)}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{statusLabel[o.status] ?? o.status}</span>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesanan hari ini.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
