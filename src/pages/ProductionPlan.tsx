import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Cake, Clock } from "lucide-react";

const BATCH_STATUSES = ["planned", "mixing", "fermenting", "proofing", "baking", "cooling", "completed", "wasted"];

export default function ProductionPlan() {
  const tenantId = "demo";
  const plans = useQuery(api.bakery.listPlans, { tenantId }) ?? [];
  const batches = useQuery(api.bakery.listBatches, { tenantId }) ?? [];
  const createPlan = useMutation(api.bakery.createPlan);
  const updatePlanStatus = useMutation(api.bakery.updatePlanStatus);
  const updateBatchStatus = useMutation(api.bakery.updateBatchStatus);

  const [tab, setTab] = useState("plans");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ planDate: Date.now(), type: "daily", notes: "" });

  const savePlan = async () => {
    await createPlan({ tenantId, ...planForm, status: "draft" });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { draft: "bg-gray-100", approved: "bg-blue-100", in_production: "bg-amber-100 text-amber-800", completed: "bg-green-100 text-green-800" };
    return m[s] ?? "";
  };
  const batchColor = (s: string) => {
    const m: Record<string, string> = { planned: "bg-gray-100", mixing: "bg-blue-100", fermenting: "bg-yellow-100", proofing: "bg-orange-100", baking: "bg-red-100 text-red-800", cooling: "bg-cyan-100", completed: "bg-green-100 text-green-800", wasted: "bg-gray-200" };
    return m[s] ?? "";
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Production Plan & Batches</h1><p className="text-sm text-muted-foreground">Planning → Mixing → Fermenting → Proofing → Baking → Cooling → QC</p></div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="plans">Plans ({plans.length})</TabsTrigger>
          <TabsTrigger value="batches">Batches ({batches.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="space-y-3">
          <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Buat Plan</Button>
          {plans.map((p) => (
            <Card key={p._id}><CardContent className="p-3 flex items-center justify-between">
              <div><p className="font-semibold">{new Date(p.planDate).toLocaleDateString("id")} — {p.type}</p><p className="text-xs text-muted-foreground">{p.notes}</p></div>
              <div className="flex gap-2">
                <Badge className={`text-xs ${statusColor(p.status)}`}>{p.status}</Badge>
                {p.status === "draft" && <Button size="sm" onClick={() => updatePlanStatus({ id: p._id, status: "approved" })}>Approve</Button>}
                {p.status === "approved" && <Button size="sm" onClick={() => updatePlanStatus({ id: p._id, status: "in_production" })}>Mulai</Button>}
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="batches" className="space-y-3">
          {batches.map((b) => {
            const idx = BATCH_STATUSES.indexOf(b.status);
            const next = idx < BATCH_STATUSES.length - 2 ? BATCH_STATUSES[idx + 1] : null;
            return (
              <Card key={b._id}><CardContent className="p-3 flex items-center justify-between">
                <div><p className="font-semibold">Batch {b._id.slice(-6)}</p><p className="text-xs text-muted-foreground">Qty: {b.batchSize} • {b.proofingTemp ?? "?"}°C proofing</p></div>
                <div className="flex gap-2">
                  <Badge className={`text-xs ${batchColor(b.status)}`}>{b.status}</Badge>
                  {next && <Button size="sm" onClick={() => updateBatchStatus({ id: b._id, status: next })}>→ {next}</Button>}
                </div>
              </CardContent></Card>
            );
          })}
        </TabsContent>
      </Tabs>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Buat Production Plan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Tipe</label><select value={planForm.type} onChange={(e) => setPlanForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option>daily</option><option>weekly</option><option>hari_raya</option></select></div>
            <div><label className="text-xs">Catatan</label><Input value={planForm.notes} onChange={(e) => setPlanForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Contoh: review penjualan kemarin + sisa day-old" /></div>
            <Button onClick={savePlan} className="w-full">Buat Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
