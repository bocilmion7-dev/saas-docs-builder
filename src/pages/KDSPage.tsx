import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, ChefHat, Clock, CheckCircle, Trash2 } from "lucide-react";


export default function KDSPage() {
  const tenantId = useTenantId() ?? "";
  const tenant = useQuery(api.tenants.getById, tenantId ? { id: tenantId as any } : "skip");
  const category = (tenant as any)?.category ?? "cafe";
  const stations = useQuery(api.cafeResto.listStations, tenantId ? { tenantId } : "skip") ?? [];
  const [selectedStation, setSelectedStation] = useState<string | undefined>(undefined);
  const kdsOrders = useQuery(api.cafeResto.listKdsOrders, tenantId ? { tenantId, stationId: selectedStation } : "skip") ?? [];
  const updateStatus = useMutation(api.cafeResto.updateKdsStatus);
  const createStation = useMutation(api.cafeResto.createStation);
  const removeStation = useMutation(api.cafeResto.removeStation);

  const [stationDialog, setStationDialog] = useState(false);
  const [stationForm, setStationForm] = useState({ name: "", type: "prep" });

  const addStation = async () => {
    if (!stationForm.name.trim()) return;
    await createStation({ tenantId, name: stationForm.name.trim(), type: stationForm.type });
    setStationForm({ name: "", type: "prep" });
    setStationDialog(false);
  };

  // Preset stasiun sesuai SDOT: restoran 4 stasiun, cafe 2 stasiun
  const addDefaultStations = async () => {
    const defaults = category === "restoran"
      ? [
          { name: "Dapur Utama", type: "cooking" },
          { name: "Grill & Fry", type: "grill" },
          { name: "Dessert & Drink", type: "drink" },
          { name: "Plating & Packing", type: "plating" },
        ]
      : [
          { name: "Barista", type: "drink" },
          { name: "Dapur", type: "cooking" },
        ];
    for (const s of defaults) {
      await createStation({ tenantId, name: s.name, type: s.type });
    }
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { queue: "bg-yellow-100 text-yellow-800", in_progress: "bg-blue-100 text-blue-800", ready: "bg-green-100 text-green-800", served: "bg-gray-100 text-gray-800" };
    return m[s] ?? "";
  };

  const nextStatus: Record<string, string> = { queue: "in_progress", in_progress: "ready", ready: "served" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Kitchen Display (KDS)</h1>
          <p className="text-sm text-muted-foreground">{kdsOrders.length} pesanan di {selectedStation ? stations.find((s: any) => s._id === selectedStation)?.name : "semua stasiun"}</p>
        </div>
        <div className="flex gap-2">
          {stations.length === 0 && (
            <Button size="sm" variant="outline" onClick={addDefaultStations}>
              <ChefHat className="h-4 w-4 mr-1" /> Buat {category === "restoran" ? "4" : "2"} Stasiun Default
            </Button>
          )}
          <Button size="sm" onClick={() => setStationDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Stasiun
          </Button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <Button size="sm" variant={selectedStation === undefined ? "default" : "outline"} onClick={() => setSelectedStation(undefined)}>Semua</Button>
        {stations.map((s: any) => (
          <span key={s._id} className="inline-flex items-center gap-1">
            <Button size="sm" variant={selectedStation === s._id ? "default" : "outline"} onClick={() => setSelectedStation(s._id)}>
              {s.name}
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-600" onClick={() => removeStation({ id: s._id })}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </span>
        ))}
        {stations.length === 0 && <p className="text-xs text-muted-foreground">Belum ada stasiun — buat stasiun di sini, lalu bayar bill di POS untuk mengirim pesanan ke dapur.</p>}
      </div>

      <Dialog open={stationDialog} onOpenChange={setStationDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Stasiun Dapur</DialogTitle>
            <DialogDescription>Order dari POS akan masuk ke stasiun ini.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama stasiun (mis. Dapur Utama)" value={stationForm.name} onChange={(e) => setStationForm((f) => ({ ...f, name: e.target.value }))} />
            <select
              value={stationForm.type}
              onChange={(e) => setStationForm((f) => ({ ...f, type: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="prep">Preparation</option>
              <option value="cooking">Cooking / Masak</option>
              <option value="grill">Grill & Fry</option>
              <option value="drink">Minuman / Bar</option>
              <option value="dessert">Dessert</option>
              <option value="plating">Plating / Packing</option>
            </select>
            <Button className="w-full" onClick={addStation}>Simpan Stasiun</Button>
          </div>
        </DialogContent>
      </Dialog>
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
