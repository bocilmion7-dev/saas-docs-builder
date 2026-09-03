import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, CheckCircle } from "lucide-react";

const tenantId = "demo";

export default function KDSPage() {
  const stations = useQuery(api.cafeResto.listStations, { tenantId }) ?? [];
  const [selectedStation, setSelectedStation] = useState<string | undefined>(undefined);
  const kdsOrders = useQuery(api.cafeResto.listKdsOrders, { tenantId, stationId: selectedStation }) ?? [];
  const updateStatus = useMutation(api.cafeResto.updateKdsStatus);

  const statusColor = (s: string) => {
    const m: Record<string, string> = { queue: "bg-yellow-100 text-yellow-800", in_progress: "bg-blue-100 text-blue-800", ready: "bg-green-100 text-green-800", served: "bg-gray-100 text-gray-800" };
    return m[s] ?? "";
  };

  const nextStatus: Record<string, string> = { queue: "in_progress", in_progress: "ready", ready: "served" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Kitchen Display (KDS)</h1>
        <p className="text-sm text-muted-foreground">{kdsOrders.length} pesanan di {selectedStation ? stations.find((s: any) => s._id === selectedStation)?.name : "semua stasiun"}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={selectedStation === undefined ? "default" : "outline"} onClick={() => setSelectedStation(undefined)}>Semua</Button>
        {stations.map((s: any) => (
          <Button key={s._id} size="sm" variant={selectedStation === s._id ? "default" : "outline"} onClick={() => setSelectedStation(s._id)}>
            {s.name}
          </Button>
        ))}
        {stations.length === 0 && <p className="text-xs text-muted-foreground">Belum ada stasiun. Buat via Table Management.</p>}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kdsOrders.map((o: any) => (
          <Card key={o._id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono">{o.ticketNumber}</CardTitle>
                <Badge className={`text-xs ${statusColor(o.status)}`}>{o.status}</Badge>
              </div>
              {o.priority === "rush" && <Badge variant="destructive" className="text-xs w-fit">RUSH</Badge>}
            </CardHeader>
            <CardContent>
              <div className="space-y-1 mb-3">
                {(Array.isArray(o.items) ? o.items : []).map((item: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">{item.qty}x {item.name}</span>
                    {item.modifier && <span className="text-xs text-muted-foreground ml-1">({item.modifier})</span>}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(o.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                {nextStatus[o.status] && (
                  <Button size="sm" onClick={() => updateStatus({ id: o._id, status: nextStatus[o.status] })}>
                    {o.status === "queue" ? "Mulai" : o.status === "in_progress" ? "Siap" : "Selesai"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {kdsOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8 col-span-full">Tidak ada pesanan di KDS.</p>}
      </div>
    </div>
  );
}
