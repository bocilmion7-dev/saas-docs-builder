import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Cake } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function CustomCake() {
  const tenantId = useTenantId() ?? "";
  const cakes = useQuery(api.bakery.listCustomCakes, { tenantId }) ?? [];
  const createCake = useMutation(api.bakery.createCustomCake);
  const updateStatus = useMutation(api.bakery.updateCustomCakeStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ cakeType: "birthday", size: "medium", flavor: "", filling: "", decoration: "", priceEstimated: 0, deadline: 0 });

  const save = async () => {
    if (!form.cakeType || !form.flavor) return;
    await createCake({ tenantId, cakeType: form.cakeType, size: form.size, flavor: form.flavor, filling: form.filling || undefined, decoration: form.decoration || undefined, priceEstimated: form.priceEstimated, deposit50Percent: Math.round(form.priceEstimated * 0.5), deadline: form.deadline || Date.now() + 7 * 86400000 });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { confirmed: "bg-blue-100 text-blue-800", preparing: "bg-yellow-100 text-yellow-800", ready: "bg-green-100 text-green-800", picked_up: "bg-gray-100 text-gray-800", cancelled: "bg-red-100 text-red-800" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Custom Cake Orders</h1><p className="text-sm text-muted-foreground">Pesanan kue custom dengan estimasi harga & deposit 50%</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Pesanan Baru</Button>
      </div>
      <div className="space-y-3">
        {cakes.map((c: any) => (
          <Card key={c._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cake className="h-5 w-5 text-pink-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{c.cakeType} Cake</span>
                  <Badge className={`text-xs capitalize ${statusColor(c.status)}`}>{c.status}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{c.size}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.flavor} {c.filling && `• ${c.filling}`} • {c.decoration && `${c.decoration} • `}{formatRp(c.priceEstimated)}</p>
                <p className="text-xs text-muted-foreground">Deposit: {formatRp(c.deposit50Percent)} ({c.depositStatus})</p>
              </div>
            </div>
            <div className="flex gap-1">
              {c.status === "confirmed" && <Button size="sm" onClick={() => updateStatus({ id: c._id, status: "preparing" })}>Mulai</Button>}
              {c.status === "preparing" && <Button size="sm" onClick={() => updateStatus({ id: c._id, status: "ready" })}>Selesai</Button>}
              {c.status === "ready" && <Button size="sm" onClick={() => updateStatus({ id: c._id, status: "picked_up" })}>Ambil</Button>}
            </div>
          </CardContent></Card>
        ))}
        {cakes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada pesanan custom cake.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Pesanan Custom Cake</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">{["birthday", "wedding", "anniversary", "corporate"].map((t) => <Button key={t} size="sm" variant={form.cakeType === t ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, cakeType: t }))} className="capitalize text-xs">{t}</Button>)}</div>
            <div className="flex gap-2">{["small", "medium", "large", "xl"].map((s) => <Button key={s} size="sm" variant={form.size === s ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, size: s }))} className="capitalize text-xs">{s}</Button>)}</div>
            <Input placeholder="Flavor (vanilla, chocolate, red velvet)" value={form.flavor} onChange={(e) => setForm((f) => ({ ...f, flavor: e.target.value }))} />
            <Input placeholder="Filling (opsional)" value={form.filling} onChange={(e) => setForm((f) => ({ ...f, filling: e.target.value }))} />
            <Input placeholder="Dekorasi (opsional)" value={form.decoration} onChange={(e) => setForm((f) => ({ ...f, decoration: e.target.value }))} />
            <Input type="number" placeholder="Harga Estimasi (Rp)" value={form.priceEstimated || ""} onChange={(e) => setForm((f) => ({ ...f, priceEstimated: +e.target.value }))} />
            <Button onClick={save} className="w-full">Buat Pesanan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
