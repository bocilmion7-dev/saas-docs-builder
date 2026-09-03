import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Shield, Plus } from "lucide-react";

export default function HSEChecklist() {
  const tenantId = "demo";
  const checklists = useQuery(api.tokoCat.listHSE, { tenantId }) ?? [];
  const createHSE = useMutation(api.tokoCat.createHSE);

  const checkItems = [
    { key: "noSmokingArea", label: "No Smoking", icon: "🚭" }, { key: "apar3Titik", label: "APAR 3 Titik", icon: "🧯" },
    { key: "ventilasiThinner", label: "Ventilasi", icon: "💨" }, { key: "maskerMixing", label: "Masker", icon: "😷" },
    { key: "cuciTangan", label: "Cuci Tangan", icon: "🧼" }, { key: "limbahTidakKeSaluran", label: "Limbah OK", icon: "♻️" },
  ];

  const createToday = async () => {
    const data: Record<string, boolean | number> = {};
    checkItems.forEach((item) => (data[item.key] = false));
    data.suhuGudang = 24;
    await createHSE({ tenantId, date: new Date().toISOString().split("T")[0], data, checkedBy: "Supervisor" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">HSE Checklist</h1><p className="text-sm text-muted-foreground">APAR • Masker • Ventilasi • Suhu gudang 20-25°C</p></div>
        <Button onClick={createToday}><Plus className="mr-2 h-4 w-4" /> Checklist Hari Ini</Button>
      </div>
      <div className="space-y-4">
        {checklists.map((cl) => {
          const data = cl.data as Record<string, boolean | number>;
          const suhu = typeof data.suhuGudang === "number" ? data.suhuGudang : 0;
          const passed = checkItems.filter((item) => !!data[item.key]).length + (suhu >= 20 && suhu <= 25 ? 1 : 0);
          return (
            <Card key={cl._id} className={passed === checkItems.length + 1 ? "border-green-300" : "border-amber-300"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span className="font-semibold">{cl.date}</span><Badge variant={passed === checkItems.length + 1 ? "default" : "destructive"} className="text-xs">{passed}/{checkItems.length + 1} ✓</Badge></div>
                  <span className="text-xs text-muted-foreground">By: {cl.checkedBy}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {checkItems.map((item) => {
                    const val = data[item.key];
                    return <div key={item.key} className={`flex items-center gap-2 p-2 rounded text-xs ${val ? "bg-green-50" : "bg-red-50"}`}><span>{item.icon}</span><span>{item.label}</span>{val ? <CheckCircle className="h-3 w-3 text-green-600 ml-auto" /> : <XCircle className="h-3 w-3 text-red-600 ml-auto" />}</div>;
                  })}
                  <div className={`flex items-center gap-2 p-2 rounded text-xs ${suhu >= 20 && suhu <= 25 ? "bg-green-50" : "bg-red-50"}`}><span>🌡️</span><span>Suhu: {suhu}°C</span></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {checklists.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada checklist. Klik "Checklist Hari Ini" untuk membuat.</p>}
      </div>
    </div>
  );
}
