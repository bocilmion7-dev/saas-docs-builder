import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Clock, Phone, Plus } from "lucide-react";

interface WaitingEntry {
  id: string;
  customerName: string;
  phone: string;
  guestCount: number;
  waitingSince: string;
  estimatedWaitMinutes: number;
  status: "waiting" | "called" | "seated" | "cancelled";
}

const MOCK_WAITLIST: WaitingEntry[] = [
  { id: "1", customerName: "Keluarga Wijaya", phone: "081234567890", guestCount: 4, waitingSince: "12:15", estimatedWaitMinutes: 15, status: "waiting" },
  { id: "2", customerName: "Pak Ahmad", phone: "081234567891", guestCount: 2, waitingSince: "12:20", estimatedWaitMinutes: 10, status: "called" },
  { id: "3", customerName: "Rombongan Budi", phone: "081234567892", guestCount: 8, waitingSince: "12:05", estimatedWaitMinutes: 25, status: "seated" },
];

export default function WaitingList() {
  const [entries, setEntries] = useState(MOCK_WAITLIST);
  const [search, setSearch] = useState("");

  const filtered = entries.filter(e => !search || e.customerName.toLowerCase().includes(search.toLowerCase()));
  const waitingCount = entries.filter(e => e.status === "waiting").length;

  const statusColor = (s: string) => {
    const m: Record<string, string> = { waiting: "bg-yellow-100 text-yellow-800", called: "bg-blue-100 text-blue-800", seated: "bg-green-100 text-green-800", cancelled: "bg-gray-100 text-gray-800" };
    return m[s] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Waiting List</h1>
          <p className="text-sm text-muted-foreground">Antrian pelanggan menunggu meja • {waitingCount} menunggu</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Tambah Antrian</Button>
      </div>
      <Input placeholder="Cari nama..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map((entry, idx) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-800">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{entry.customerName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {entry.guestCount} pax</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {entry.phone}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {entry.waitingSince} (est. {entry.estimatedWaitMinutes}m)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs capitalize ${statusColor(entry.status)}`}>{entry.status}</Badge>
                  {entry.status === "waiting" && <Button size="sm" onClick={() => setEntries(es => es.map(e => e.id === entry.id ? { ...e, status: "called" as const } : e))}>Panggil</Button>}
                  {entry.status === "called" && <Button size="sm" onClick={() => setEntries(es => es.map(e => e.id === entry.id ? { ...e, status: "seated" as const } : e))}>Dudukkan</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
