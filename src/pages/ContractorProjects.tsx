import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Plus, Edit, MapPin } from "lucide-react";

interface ContractorProject {
  id: string;
  projectName: string;
  customerName: string;
  luasTotalM2: number;
  status: "survey" | "penawaran" | "approved" | "pengerjaan" | "selesai" | "termin";
  totalValue: number;
  paymentType: "tunai" | "termin" | "tempo";
  terminDetails: { termin: number; percent: number; amount: number; dueDate: string; status: string }[];
}

const MOCK_PROJECTS: ContractorProject[] = [
  { id: "1", projectName: "Pengecatan Kantor Pusat", customerName: "PT Maju Jaya", luasTotalM2: 500, status: "pengerjaan", totalValue: 50000000, paymentType: "termin", terminDetails: [
    { termin: 1, percent: 30, amount: 15000000, dueDate: "2026-09-01", status: "paid" },
    { termin: 2, percent: 40, amount: 20000000, dueDate: "2026-09-30", status: "pending" },
    { termin: 3, percent: 30, amount: 15000000, dueDate: "2026-10-30", status: "pending" },
  ]},
  { id: "2", projectName: "Cat Villa Ubud", customerName: "Ibu Sarah", luasTotalM2: 200, status: "approved", totalValue: 25000000, paymentType: "tempo", terminDetails: [
    { termin: 1, percent: 50, amount: 12500000, dueDate: "2026-09-15", status: "pending" },
    { termin: 2, percent: 50, amount: 12500000, dueDate: "2026-10-15", status: "pending" },
  ]},
];

export default function ContractorProjects() {
  const [projects] = useState(MOCK_PROJECTS);
  const [search, setSearch] = useState("");

  const filtered = projects.filter(p => !search || p.projectName.toLowerCase().includes(search.toLowerCase()) || p.customerName.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string) => {
    const m: Record<string, string> = { survey: "bg-gray-100 text-gray-800", penawaran: "bg-yellow-100 text-yellow-800", approved: "bg-blue-100 text-blue-800", pengerjaan: "bg-purple-100 text-purple-800", selesai: "bg-green-100 text-green-800", termin: "bg-amber-100 text-amber-800" };
    return m[s] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contractor Projects</h1>
          <p className="text-sm text-muted-foreground">Survey → Penawaran → Approved → Pengerjaan → Selesai → Termin Net30/60</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Proyek Baru</Button>
      </div>
      <Input placeholder="Cari proyek/customer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-4">
        {filtered.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-semibold">{p.projectName}</span>
                    <Badge className={`text-xs capitalize ${statusColor(p.status)}`}>{p.status}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{p.paymentType}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.customerName} • Luas: {p.luasTotalM2}m²</p>
                  <p className="text-sm font-bold mt-1">Total: Rp {p.totalValue.toLocaleString("id")}</p>
                  <div className="mt-3 space-y-1">
                    {p.terminDetails.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-16">Termin {t.termin}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${t.percent}%` }} />
                        </div>
                        <span className="w-24 text-right">Rp {t.amount.toLocaleString("id")}</span>
                        <span className="w-24 text-right text-muted-foreground">{t.dueDate}</span>
                        <Badge variant={t.status === "paid" ? "default" : "outline"} className="text-xs">{t.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
