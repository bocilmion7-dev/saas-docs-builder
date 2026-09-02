import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cake, Palette, Calendar, DollarSign, Plus, CheckCircle } from "lucide-react";

const orders = [
  { id: "CC-001", customer: "Andi Wijaya", type: "Ultah", size: "8 inch", flavor: "Chocolate", filling: "Ganache", decoration: "Karakter Doraemon", priceEstimated: 450000, depositPaid: 225000, status: "in_design", deadline: "2026-09-05", createdAt: "2026-09-01" },
  { id: "CC-002", customer: "Sari Dewi", type: "Pernikahan", size: "3 tingkat", flavor: "Red Velvet", filling: "Cream Cheese", decoration: "Tulisan 'Happy Wedding' + bunga", priceEstimated: 1200000, depositPaid: 600000, status: "baking", deadline: "2026-09-04", createdAt: "2026-08-28" },
  { id: "CC-003", customer: "PT Maju Jaya", type: "Anniversary", size: "10 inch", flavor: "Cheese", filling: "Blueberry", decoration: "Logo perusahaan", priceEstimated: 550000, depositPaid: 275000, status: "qc", deadline: "2026-09-03", createdAt: "2026-08-30" },
  { id: "CC-004", customer: "Rina Marlina", type: "Ultah", size: "6 inch", flavor: "Vanilla", filling: "Strawberry", decoration: "Motif pink & gold", priceEstimated: 350000, depositPaid: 175000, status: "ready", deadline: "2026-09-02", createdAt: "2026-08-29" },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Dikonfirmasi", cls: "bg-blue-500/10 text-blue-600" },
  in_design: { label: "Desain", cls: "bg-purple-500/10 text-purple-600" },
  baking: { label: "Baking", cls: "bg-amber-500/10 text-amber-600" },
  decorating: { label: "Dekorasi", cls: "bg-pink-500/10 text-pink-600" },
  qc: { label: "QC", cls: "bg-indigo-500/10 text-indigo-600" },
  ready: { label: "Siap Diambil", cls: "bg-emerald-500/10 text-emerald-600" },
  delivered: { label: "Diambil", cls: "bg-emerald-500/10 text-emerald-600" },
};

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function CustomCake() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Custom Cake Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Pesanan kue custom — H-3 s/d H-7, deposit 50% non-refundable</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Pesanan Baru</Button>
      </div>

      <div className="space-y-4">
        {orders.map((o) => {
          const st = statusConfig[o.status];
          return (
            <Card key={o.id} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-pink-500/10 p-2.5 text-pink-500"><Cake className="size-5" /></div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground">{o.id}</span>
                        <p className="font-bold text-sm">{o.customer}</p>
                        <Badge className={st.cls}>{st.label}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <span><strong className="text-foreground">Jenis:</strong> {o.type}</span>
                        <span><strong className="text-foreground">Ukuran:</strong> {o.size}</span>
                        <span><strong className="text-foreground">Rasa:</strong> {o.flavor}</span>
                        <span><strong className="text-foreground">Filling:</strong> {o.filling}</span>
                        <span className="col-span-2"><strong className="text-foreground">Dekorasi:</strong> {o.decoration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-extrabold text-primary">{formatRp(o.priceEstimated)}</p>
                    <p className="text-xs text-muted-foreground">Deposit 50%: {formatRp(o.deadline ? 0 : o.depositPaid)}</p>
                    <p className="text-xs text-muted-foreground">Deadline: {o.deadline}</p>
                    <div className="flex gap-1 justify-end">
                      {o.status !== "ready" && o.status !== "delivered" && <Button size="sm" className="text-[10px] h-7">Proses →</Button>}
                      {o.status === "ready" && <Button size="sm" className="text-[10px] h-7 bg-emerald-500">Serahkan</Button>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
