import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Ticket } from "lucide-react";

export default function DayPasses() {
  const tenantId = useTenantId() ?? "";
  const passes = useQuery(api.spa.listDayPasses, { tenantId }) ?? [];
  const createPass = useMutation(api.spa.createDayPass);
  const updateStatus = useMutation(api.spa.updateDayPassStatus);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ accessType: "single", price: 150000 });

  const save = async () => {
    await createPass({ tenantId, ...form, date: Date.now() });
    setDialogOpen(false);
    setForm({ accessType: "single", price: 150000 });
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { active: "bg-green-100 text-green-800", used: "bg-gray-100 text-gray-800", expired: "bg-red-100 text-red-800" };
    return m[s] ?? "";
  };

  const activeCount = passes.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Day Passes</h1>
          <p className="text-sm text-muted-foreground">{activeCount} active passes</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Jual Day Pass</Button>
      </div>
      <div className="space-y-3">
        {passes.map((p) => (
          <Card key={p._id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-semibold capitalize">{p.accessType} Access</p>
                  <p className="text-xs text-muted-foreground">Rp{p.price.toLocaleString()} • {new Date(p.date).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs capitalize ${statusColor(p.status)}`}>{p.status}</Badge>
                {p.status === "active" && <Button size="sm" variant="outline" onClick={() => updateStatus({ id: p._id, status: "used" })}>Use</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
        {passes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada day pass.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Jual Day Pass</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs">Tipe Akses</label>
              <select value={form.accessType} onChange={(e) => setForm((f) => ({ ...f, accessType: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="single">Single Day</option>
                <option value="group">Group (2-5)</option>
                <option value="vip">VIP All-Day</option>
              </select>
            </div>
            <div><label className="text-xs">Harga (Rp)</label><Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value }))} /></div>
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
