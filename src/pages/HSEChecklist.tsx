import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Check } from "lucide-react";

const hseItems = [
  "APD (Helm, sarung tangan, masker) terpasang",
  "Area kerja bebas dari tumpahan/thinner",
  "Ventilasi / exhaust fan aktif",
  "Fire extinguisher dalam kondisi baik",
  "B3 drum terkunci dengan benar",
  "Spill kit tersedia",
  "Jalan evakuasi terbebas",
  "Toolbox briefing sudah dilakukan",
];

export default function HSEChecklist() {
  const tenantId = useTenantId() ?? "";
  const checklists = useQuery(api.tokoCat.listHSE, { tenantId }) ?? [];
  const createChecklist = useMutation(api.tokoCat.createHSE);

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const today = new Date().toISOString().split("T")[0];

  const toggle = (id: number) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const allChecked = hseItems.every((_, i) => checked[i]);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const submitChecklist = async () => {
    const data = hseItems.map((item, i) => ({ item, checked: !!checked[i] }));
    await createChecklist({ tenantId, date: today, data, checkedBy: "owner" });
    setChecked({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">HSE Checklist</h1>
        <p className="text-sm text-muted-foreground mt-1">Health, Safety & Environment checklist harian toko cat</p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" />
              Checklist Hari Ini — {today}
            </CardTitle>
            <Badge variant={allChecked ? "default" : "secondary"}>{checkedCount}/{hseItems.length}</Badge>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
            <div className="h-full rounded-full transition-all duration-300 bg-emerald-500" style={{ width: `${(checkedCount / hseItems.length) * 100}%` }} />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {hseItems.map((item, i) => (
            <button key={i} onClick={() => toggle(i)} className={`flex items-center gap-3 w-full rounded-xl p-3.5 text-left transition-all ${checked[i] ? "bg-emerald-50 border border-emerald-200" : "bg-muted/50 border border-transparent hover:border-border"}`}>
              <div className={`flex size-7 items-center justify-center rounded-lg border-2 transition-colors ${checked[i] ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-background"}`}>
                {checked[i] && <Check className="size-4" />}
              </div>
              <span className={`text-sm font-medium ${checked[i] ? "text-emerald-700" : ""}`}>{item}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {allChecked && (
        <Card className="border-emerald-300 bg-emerald-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Check className="size-4" />
              Checklist selesai! Semua poin HSE sudah dicek.
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={submitChecklist}>Submit</Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-base">Riwayat HSE</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {checklists.slice(0, 5).map((c: any) => (
              <div key={c._id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium">{c.date}</p>
                  <p className="text-xs text-muted-foreground">Checked by: {c.checkedBy}</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600">✓</Badge>
              </div>
            ))}
            {checklists.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat HSE.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
