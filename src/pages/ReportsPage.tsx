import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, Calendar } from "lucide-react";

const reportCards = [
  {
    icon: BarChart3,
    title: "Laporan Harian",
    desc: "Ringkasan penjualan, transaksi, dan cash flow hari ini",
    value: "Rp 2.450.000",
    sub: "18 transaksi",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: TrendingUp,
    title: "Laporan Keuangan",
    desc: "Pendapatan, COGS, laba kotor, dan laba bersih bulanan",
    value: "Rp 45.200.000",
    sub: "Bulan September 2026",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: PieChart,
    title: "Analisis Menu",
    desc: "Penjualan per kategori — Star, Cash Cow, Question Mark, Dog",
    value: "Top: Kopi Susu",
    sub: "68 item terjual minggu ini",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    icon: Calendar,
    title: "Peak Hour Analysis",
    desc: "Jam sibuk dan pola penjualan harian",
    value: "07:00 — 09:00",
    sub: "Puncak penjualan pagi",
    color: "text-amber-500 bg-amber-500/10",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Laporan</h1>
        <p className="text-sm text-muted-foreground mt-1">Analisis penjualan dan keuangan toko</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {reportCards.map((r) => (
          <Card key={r.title} className="border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className={`rounded-xl p-2.5 ${r.color}`}>
                  <r.icon className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-extrabold">{r.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Placeholder */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Grafik Penjualan 7 Hari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {[180, 250, 190, 310, 280, 350, 240].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all"
                  style={{ height: `${(v / 350) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total minggu ini</span>
            <span className="font-bold">Rp 1.800.000</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
