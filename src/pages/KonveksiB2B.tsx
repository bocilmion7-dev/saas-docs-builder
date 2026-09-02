import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, AlertTriangle, Clock } from "lucide-react";

const orders = [
  { id: "KB-001", customer: "PT Konveksi Jaya", totalRoll: 30, totalMeter: 1500, hargaGrosir: 25000, totalValue: 75000000, paymentType: "tempo Net30", status: "shipped", piutangStatus: "belum_lunas", dueDate: "2026-10-02", reminderH7: false, reminderH3: false },
  { id: "KB-002", customer: "Toko Gorden Maju", totalRoll: 20, totalMeter: 800, hargaGrosir: 22000, totalValue: 17600000, paymentType: "transfer", status: "delivered", piutangStatus: "lunas", dueDate: null, reminderH7: false, reminderH3: false },
  { id: "KB-003", customer: "Garmen Sejahtera", totalRoll: 50, totalMeter: 2500, hargaGrosir: 28000, totalValue: 70000000, paymentType: "tempo Net60", status: "approved", piutangStatus: "belum_lunas", dueDate: "2026-11-01", reminderH7: false, reminderH3: false },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function KonveksiB2B() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Konveksi B2B Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Pesanan grosir 20-50 roll — Net30/60 piutang tracking</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Order B2B Baru</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Order", value: orders.length, color: "text-foreground" },
          { label: "Belum Lunas", value: orders.filter((o) => o.piutangStatus === "belum_lunas").length, color: "text-amber-500" },
          { label: "Total Piutang", value: formatRp(orders.filter((o) => o.piutangStatus === "belum_lunas").reduce((s, o) => s + o.totalValue, 0)), color: "text-red-500" },
          { label: "Lunas", value: formatRp(orders.filter((o) => o.piutangStatus === "lunas").reduce((s, o) => s + o.totalValue, 0)), color: "text-emerald-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60"><CardContent className="p-3 text-center">
            <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {orders.map((o) => (
              <div key={o.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-5" /></div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                        <p className="font-bold text-sm">{o.customer}</p>
                        <Badge variant="secondary" className={o.piutangStatus === "lunas" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                          {o.piutangStatus === "lunas" ? "Lunas" : "Belum Lunas"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{o.totalRoll} roll · {o.totalMeter}m</span>
                        <span>{formatRp(o.hargaGrosir)}/roll</span>
                        <span>{o.paymentType}</span>
                        {o.dueDate && <span className="flex items-center gap-1 text-amber-600"><Clock className="size-3" />Jatuh tempo: {o.dueDate}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold">{formatRp(o.totalValue)}</p>
                    {o.piutangStatus === "belum_lunas" && <Button size="sm" variant="outline" className="text-[10px] h-7 mt-1">Kirim Reminder</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
