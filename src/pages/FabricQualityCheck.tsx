import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertTriangle, Ruler, Plus } from "lucide-react";

export default function FabricQualityCheck() {
  const tenantId = "demo";
  const checks = useQuery(api.kain.listQualityChecks, { tenantId }) ?? [];
  const createCheck = useMutation(api.kain.createQualityCheck);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    rollId: "",
    checkType: "panjang",
    result: "pass",
    selisihPanjangPercent: 0,
    notes: "",
    checkedBy: "Staff Gudang",
  });

  const filtered = checks.filter((c: any) => !search || c.rollId.toLowerCase().includes(search.toLowerCase()));

  const create = async () => {
    if (!form.rollId) return;
    await createCheck({
      tenantId,
      rollId: form.rollId,
      checkType: form.checkType,
      result: form.result,
      selisihPanjangPercent: form.selisihPanjangPercent || undefined,
      notes: form.notes || undefined,
      checkedBy: form.checkedBy,
    });
    setDialogOpen(false);
    setForm({ rollId: "", checkType: "panjang", result: "pass", selisihPanjangPercent: 0, notes: "", checkedBy: "Staff Gudang" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fabric Quality Check</h1>
          <p className="text-sm text-muted-foreground">Cek panjang roll • Selisih {'>'}2% klaim supplier • Noda/robek/lubang/bau apek/gramasi timbang sample</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah QC</Button>
      </div>
      <Input placeholder="Cari roll ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map((qc: any) => (
          <Card key={qc._id} className={qc.result === "fail" ? "border-red-200" : "border-green-200"}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {qc.result === "pass" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                    <span className="font-semibold">Roll: {qc.rollId}</span>
                    <Badge variant={qc.result === "pass" ? "default" : "destructive"}>
                      {qc.result === "pass" ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">Type: {qc.checkType} • {new Date(qc.createdAt).toLocaleDateString()} • {qc.checkedBy}</p>
                  {qc.selisihPanjangPercent !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${qc.selisihPanjangPercent > 2 ? "text-red-600" : "text-green-600"}`}>
                      <Ruler className="h-3 w-3" />
                      Selisih: {qc.selisihPanjangPercent}% {qc.selisihPanjangPercent > 2 && "Klaim ke supplier!"}
                    </div>
                  )}
                  {qc.notes && <p className="text-xs text-muted-foreground mt-2 italic">📝 {qc.notes}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {checks.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada quality check.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Quality Check</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Roll ID" value={form.rollId} onChange={(e) => setForm((f) => ({ ...f, rollId: e.target.value }))} />
            <div><label className="text-xs">Jenis Cek</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {["panjang", "noda", "robek", "gramasi", "bau", "lubang"].map((t) => (
                  <Badge key={t} variant={form.checkType === t ? "default" : "outline"} className="cursor-pointer text-xs capitalize" onClick={() => setForm((f) => ({ ...f, checkType: t }))}>{t}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={form.result === "pass" ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, result: "pass" }))}>Pass</Button>
              <Button size="sm" variant={form.result === "fail" ? "destructive" : "outline"} onClick={() => setForm((f) => ({ ...f, result: "fail" }))}>Fail</Button>
            </div>
            <Input type="number" placeholder="Selisih panjang % (opsional)" value={form.selisihPanjangPercent || ""} onChange={(e) => setForm((f) => ({ ...f, selisihPanjangPercent: +e.target.value }))} />
            <Input placeholder="Notes (opsional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            <Button onClick={create} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
