import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Wrench, Plus, Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react";

const workOrders = [
  { id: "WO-001", vehicle: "B1234CD", customer: "Andi Wijaya", complaint: "Mesin bergetar di RPM tinggi", type: "sedang", status: "in_progress", mechanic: "Pak Budi", estimated: "Rp 1.200.000", createdAt: "2026-09-02 08:00" },
  { id: "WO-002", vehicle: "B5678EF", customer: "Sari Dewi", complaint: "Rem bunyi berdecit", type: "ringan", status: "qc", mechanic: "Pak Dedi", estimated: "Rp 350.000", createdAt: "2026-09-02 09:30" },
  { id: "WO-003", vehicle: "B9012GH", customer: "PT Maju Jaya", complaint: "Ganti oli + tune up berkala", type: "ringan", status: "finished", mechanic: "Pak Rudi", estimated: "Rp 500.000", createdAt: "2026-09-02 07:15" },
  { id: "WO-004", vehicle: "B3456IJ", customer: "Rina Marlina", complaint: "AC tidak dingin + bunyi aneh", type: "sedang", status: "waiting_approval", mechanic: null, estimated: "Rp 850.000", createdAt: "2026-09-02 10:00" },
  { id: "WO-005", vehicle: "B7890KL", customer: "Budi Santoso", complaint: "Turun mesin total overhaul", type: "berat", status: "approved", mechanic: null, estimated: "Rp 8.500.000", createdAt: "2026-09-01 14:00" },
];

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground", icon: FileText },
  waiting_approval: { label: "Menunggu Approve", cls: "bg-amber-500/10 text-amber-600", icon: Clock },
  approved: { label: "Disetujui", cls: "bg-blue-500/10 text-blue-600", icon: CheckCircle },
  queue: { label: "Antrian", cls: "bg-purple-500/10 text-purple-600", icon: Clock },
  in_progress: { label: "Dikerjakan", cls: "bg-blue-500/10 text-blue-600", icon: Wrench },
  waiting_parts: { label: "Menunggu Part", cls: "bg-amber-500/10 text-amber-600", icon: AlertTriangle },
  qc: { label: "QC Test Drive", cls: "bg-cyan-500/10 text-cyan-600", icon: CheckCircle },
  finished: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  delivered: { label: "Diambil", cls: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
};

const typeConfig: Record<string, string> = {
  ringan: "bg-emerald-500/10 text-emerald-600", sedang: "bg-amber-500/10 text-amber-600", berat: "bg-red-500/10 text-red-600",
};

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function WorkOrders() {
  const [search, setSearch] = useState("");
  const filtered = workOrders.filter((w) => w.id.toLowerCase().includes(search.toLowerCase()) || w.customer.toLowerCase().includes(search.toLowerCase()) || w.vehicle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Work Order</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola pesanan servis kendaraan</p>
        </div>
        <Button className="gap-2"><Plus className="size-4" /> Work Order Baru</Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari WO, kendaraan, atau pelanggan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {filtered.map((w) => {
              const st = statusConfig[w.status];
              return (
                <div key={w.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary font-mono text-xs font-bold">{w.id}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold">{w.vehicle}</p>
                          <Badge className={typeConfig[w.type]}>{w.type}</Badge>
                          <Badge variant="secondary" className={st.cls}><st.icon className="size-3 mr-0.5" />{st.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{w.customer} — {w.complaint}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {w.mechanic && <span>🔧 {w.mechanic}</span>}
                          <span>Estimasi: <strong className="text-foreground">{w.estimated}</strong></span>
                          <span>{w.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {w.status === "waiting_approval" && <Button size="sm" className="text-[10px] h-7">Approve</Button>}
                      {w.status === "approved" && <Button size="sm" className="text-[10px] h-7">Mulai Kerja</Button>}
                      {w.status === "in_progress" && <Button size="sm" className="text-[10px] h-7">Selesai → QC</Button>}
                      {w.status === "qc" && <Button size="sm" className="text-[10px] h-7 bg-emerald-500">Pass → Invoice</Button>}
                      <Button size="sm" variant="ghost" className="text-[10px] h-7">Detail</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
