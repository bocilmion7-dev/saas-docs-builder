import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, MessageSquare, CheckCircle } from "lucide-react";

interface ComplaintTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  type: string;
  description: string;
  status: "open" | "investigating" | "approved_rts" | "rejected" | "replaced" | "refunded";
  investigationResult?: string;
  resolution?: string;
  createdAt: string;
}

const MOCK_TICKETS: ComplaintTicket[] = [
  { id: "1", ticketNumber: "CT-001", customerName: "Pak Joko", type: "warna_tidak_sesuai", description: "Warna cat yang dicampur tidak sesuai Nippon 4316P, lebih kekuningan", status: "investigating", createdAt: "2026-09-02" },
  { id: "2", ticketNumber: "CT-002", customerName: "Ibu Rina", type: "kemasan_rusak", description: "Kaleng 5L penyok saat diterima, cat bocor", status: "approved_rts", investigationResult: "Kesalahan pengiriman", resolution: "Ganti baru gratis", createdAt: "2026-09-01" },
];

export default function ComplaintTickets() {
  const [tickets] = useState(MOCK_TICKETS);
  const [search, setSearch] = useState("");

  const filtered = tickets.filter(t => !search || t.customerName.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string) => {
    const m: Record<string, string> = { open: "bg-red-100 text-red-800", investigating: "bg-yellow-100 text-yellow-800", approved_rts: "bg-blue-100 text-blue-800", rejected: "bg-gray-100 text-gray-800", replaced: "bg-green-100 text-green-800", refunded: "bg-purple-100 text-purple-800" };
    return m[s] || "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Complaint Tickets</h1>
        <p className="text-sm text-muted-foreground">Warna tidak sesuai • Cat menggumpal • Tidak menutup • Kemasan rusak • Evidence foto</p>
      </div>
      <Input placeholder="Cari customer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id} className="border-l-4 border-l-amber-400">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="font-mono text-xs">{t.ticketNumber}</span>
                    <Badge className={`text-xs capitalize ${statusColor(t.status)}`}>{t.status.replace("_", " ")}</Badge>
                    <Badge variant="outline" className="text-xs">{t.type.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.customerName} • {t.createdAt}</p>
                  <p className="text-sm mt-2">{t.description}</p>
                  {t.investigationResult && <p className="text-xs text-muted-foreground mt-1">🔍 {t.investigationResult}</p>}
                  {t.resolution && <p className="text-xs text-green-700 mt-1">✅ {t.resolution}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
