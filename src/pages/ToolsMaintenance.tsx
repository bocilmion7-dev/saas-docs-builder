import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wrench, AlertTriangle } from "lucide-react";

export default function ToolsMaintenance() {
  const tenantId = useTenantId() ?? "";
  const tools = useQuery(api.bengkel.listToolsMaintenance, { tenantId }) ?? [];
  const createTool = useMutation(api.bengkel.createToolMaintenance);
  const updateTool = useMutation(api.bengkel.updateToolMaintenance);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ toolName: "", lastMaintenanceAt: Date.now(), nextMaintenanceAt: Date.now() + 30 * 86400000, notes: "" });

  const save = async () => {
    if (!form.toolName) return;
    await createTool({ tenantId, ...form, notes: form.notes || undefined });
    setDialogOpen(false);
    setForm({ toolName: "", lastMaintenanceAt: Date.now(), nextMaintenanceAt: Date.now() + 30 * 86400000, notes: "" });
  };

  const needsMaintenance = (t: any) => t.nextMaintenanceAt <= Date.now();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tools Maintenance</h1>
          <p className="text-sm text-muted-foreground">Jadwal perawatan alat bengkel</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Tool</Button>
      </div>
      <div className="space-y-3">
        {tools.map((t) => (
          <Card key={t._id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold">{t.toolName}</p>
                  <p className="text-xs text-muted-foreground">
                    Last: {new Date(t.lastMaintenanceAt).toLocaleDateString("id-ID")} → Next: {new Date(t.nextMaintenanceAt).toLocaleDateString("id-ID")}
                  </p>
                  {t.notes && <p className="text-xs text-muted-foreground mt-1">{t.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {needsMaintenance(t) && <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" /> Overdue</Badge>}
                <Button size="sm" variant="outline" onClick={() => updateTool({ id: t._id, lastMaintenanceAt: Date.now(), nextMaintenanceAt: Date.now() + 30 * 86400000 })}>
                  Mark Done
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {tools.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada data tools maintenance.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Tambah Tool</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nama alat" value={form.toolName} onChange={(e) => setForm((f) => ({ ...f, toolName: e.target.value }))} />
            <div><label className="text-xs">Next Maintenance (hari dari sekarang)</label><Input type="number" value={30} onChange={(e) => setForm((f) => ({ ...f, nextMaintenanceAt: Date.now() + +e.target.value * 86400000 }))} /></div>
            <Input placeholder="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
