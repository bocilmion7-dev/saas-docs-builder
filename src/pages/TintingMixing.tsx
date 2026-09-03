import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Paintbrush, Cog } from "lucide-react";

export default function TintingMixing() {
  const tenantId = useTenantId() ?? "";
  const machines = useQuery(api.tokoCat.listMachines, { tenantId }) ?? [];
  const formulas = useQuery(api.tokoCat.listFormulas, { tenantId }) ?? [];
  const createMachine = useMutation(api.tokoCat.createMachine);
  const updateMachine = useMutation(api.tokoCat.updateMachine);
  const createFormula = useMutation(api.tokoCat.createFormula);

  const [tab, setTab] = useState("machines");
  const [machineDialog, setMachineDialog] = useState(false);
  const [formulaDialog, setFormulaDialog] = useState(false);
  const [machineName, setMachineName] = useState("");
  const [formulaForm, setFormulaForm] = useState({ colorCode: "", colorName: "", brand: "Nippon", baseType: "white", finish: "gloss", pigmentMix: "{}" });

  const addMachine = async () => { if (!machineName) return; await createMachine({ tenantId, name: machineName }); setMachineName(""); setMachineDialog(false); };
  const addFormula = async () => {
    if (!formulaForm.colorCode) return;
    await createFormula({ tenantId, ...formulaForm, pigmentMix: JSON.parse(formulaForm.pigmentMix || "{}") });
    setFormulaDialog(false);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Tinting & Mixing</h1><p className="text-sm text-muted-foreground">Mesin tinting • Formula warna Nippon 4316P • Color samples</p></div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="machines">Mesin ({machines.length})</TabsTrigger>
          <TabsTrigger value="formulas">Formula ({formulas.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="machines" className="space-y-3">
          <Button onClick={() => setMachineDialog(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Mesin</Button>
          {machines.map((m) => (
            <Card key={m._id}><CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cog className={`h-5 w-5 ${m.status === "active" ? "text-green-600" : m.status === "maintenance" ? "text-amber-600" : "text-red-600"}`} />
                <div><p className="font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">Mix count: {m.totalMixCount} • {m.dbWarnaVersion ?? "DB v1"}</p></div>
              </div>
              <Badge variant={m.status === "active" ? "default" : "destructive"}>{m.status}</Badge>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="formulas" className="space-y-3">
          <Button onClick={() => setFormulaDialog(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Formula</Button>
          {formulas.map((f) => (
            <Card key={f._id}><CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Paintbrush className="h-5 w-5 text-muted-foreground" />
                  <div><p className="font-mono font-bold">{f.colorCode}</p><p className="text-xs text-muted-foreground">{f.colorName} • {f.brand} • {f.finish}</p></div>
                </div>
                <Badge variant="outline">{f.baseType}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={machineDialog} onOpenChange={setMachineDialog}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Mesin Tinting</DialogTitle></DialogHeader>
          <div className="space-y-3"><Input placeholder="Nama mesin" value={machineName} onChange={(e) => setMachineName(e.target.value)} /><Button onClick={addMachine} className="w-full">Tambah</Button></div>
        </DialogContent>
      </Dialog>
      <Dialog open={formulaDialog} onOpenChange={setFormulaDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Tambah Formula Warna</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2"><Input placeholder="Color Code (ex: Nippon 4316P)" value={formulaForm.colorCode} onChange={(e) => setFormulaForm((f) => ({ ...f, colorCode: e.target.value }))} /><Input placeholder="Color Name" value={formulaForm.colorName} onChange={(e) => setFormulaForm((f) => ({ ...f, colorName: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-2">
              <select value={formulaForm.brand} onChange={(e) => setFormulaForm((f) => ({ ...f, brand: e.target.value }))} className="border rounded-md px-2 py-2 text-sm"><option>Nippon</option><option>Dulux</option><option>Avian</option><option>Propan</option></select>
              <select value={formulaForm.baseType} onChange={(e) => setFormulaForm((f) => ({ ...f, baseType: e.target.value }))} className="border rounded-md px-2 py-2 text-sm"><option>white</option><option>clear</option><option>medium</option></select>
              <select value={formulaForm.finish} onChange={(e) => setFormulaForm((f) => ({ ...f, finish: e.target.value }))} className="border rounded-md px-2 py-2 text-sm"><option>gloss</option><option>matt</option><option>satyn</option><option>doff</option></select>
            </div>
            <div><label className="text-xs font-medium">Pigment Mix (JSON)</label><Input value={formulaForm.pigmentMix} onChange={(e) => setFormulaForm((f) => ({ ...f, pigmentMix: e.target.value }))} placeholder='{"R12": 3.2, "Y05": 1.1}' /></div>
            <Button onClick={addFormula} className="w-full">Simpan Formula</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
