import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Shield } from "lucide-react";

const CHECK_TYPES = ["panjang", "lebar", "warna", "tekstur", "defect"];

export default function FabricQualityCheck() {
  const tenantId = "demo";
  const checks = useQuery(api.kain.listQualityChecks, { tenantId }) ?? [];
  const rolls = useQuery(api.kain.listRolls, { tenantId }) ?? [];
  const createCheck = useMutation(api.kain.createQualityCheck);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ rollId: "", checkType: "panjang", result: "pass", notes: "" });

  const save = async () => {
    if (!form.rollId) return;
    await createCheck({ tenantId, ...form });
    setDialogOpen(false);
  };

  const statusColor = (s: string) => s === "pass" ? "bg-green-100 text-green-800" : s === "fail" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quality Check</h1><p className="text-sm text-muted-foreground">QC kain: panjang, lebar, warna, tekstur, defect</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> QC Baru</Button>
      </div>
      <div className="space-y-3">
        {checks.map((c: any) => {
          const roll = rolls.find((r: any) => r._id === c.rollId);
          return (
            <Card key={c._id}><CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs capitalize">{c.checkType}</Badge>
                    <Badge className={`text-xs capitalize ${statusColor(c.result)}`}>{c.result}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Roll: {roll?.rollNumber ?? c.rollId} {c.notes && `• ${c.notes}`}</p>
                </div>
              </div>
            </CardContent></Card>
          );
        })}
        {checks.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada QC.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Quality Check Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs">Roll</label><select value={form.rollId} onChange={(e) => setForm((f) => ({ ...f, rollId: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="">Pilih roll...</option>{rolls.map((r: any) => <option key={r._id} value={r._id}>{r.rollNumber}</option>)}</select></div>
            <div><label className="text-xs">Parameter</label><div className="flex flex-wrap gap-1 mt-1">{CHECK_TYPES.map((t) => <Button key={t} size="sm" variant={form.checkType === t ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, checkType: t }))} className="text-xs capitalize">{t}</Button>)}</div></div>
            <div className="flex gap-2">{["pass", "fail", "partial"].map((r) => <Button key={r} size="sm" variant={form.result === r ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, result: r }))} className="text-xs capitalize">{r}</Button>)}</div>
            <Input placeholder="Catatan" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan QC</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
