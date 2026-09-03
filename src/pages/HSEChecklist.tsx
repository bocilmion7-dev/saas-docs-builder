import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle } from "lucide-react";

interface HSEChecklist {
  id: string;
  date: string;
  checkedBy: string;
  noSmokingArea: boolean;
  apar3Titik: boolean;
  ventilasiThinner: boolean;
  maskerMixing: boolean;
  cuciTangan: boolean;
  limbahTidakKeSaluran: boolean;
  suhuGudang: number;
}

const MOCK_CHECKLISTS: HSEChecklist[] = [
  { id: "1", date: "2026-09-03", checkedBy: "Supervisor", noSmokingArea: true, apar3Titik: true, ventilasiThinner: true, maskerMixing: true, cuciTangan: true, limbahTidakKeSaluran: true, suhuGudang: 24 },
  { id: "2", date: "2026-09-02", checkedBy: "Supervisor", noSmokingArea: true, apar3Titik: false, ventilasiThinner: true, maskerMixing: true, cuciTangan: true, limbahTidakKeSaluran: true, suhuGudang: 23 },
];

export default function HSEChecklist() {
  const [checklists] = useState(MOCK_CHECKLISTS);

  const checkItems = [
    { key: "noSmokingArea", label: "No Smoking Area", icon: "🚭" },
    { key: "apar3Titik", label: "APAR 3 Titik", icon: "🧯" },
    { key: "ventilasiThinner", label: "Ventilasi Thinner", icon: "💨" },
    { key: "maskerMixing", label: "Masker Mixing", icon: "😷" },
    { key: "cuciTangan", label: "Cuci Tangan", icon: "🧼" },
    { key: "limbahTidakKeSaluran", label: "Limbah Tidak ke Saluran", icon: "♻️" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HSE Checklist</h1>
        <p className="text-sm text-muted-foreground">APAR 3 titik • Masker mixing • Ventilasi thinner • No smoking • Suhu gudang 20-25°C</p>
      </div>

      <div className="space-y-4">
        {checklists.map(cl => {
          const totalChecks = checkItems.length + 1;
          const passedChecks = checkItems.filter(item => (cl as any)[item.key]).length + (cl.suhuGudang >= 20 && cl.suhuGudang <= 25 ? 1 : 0);
          return (
            <Card key={cl.id} className={passedChecks === totalChecks ? "border-green-300" : "border-amber-300"}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-semibold">{cl.date}</span>
                    <Badge variant={passedChecks === totalChecks ? "default" : "destructive"} className="text-xs">
                      {passedChecks}/{totalChecks} ✓
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">By: {cl.checkedBy}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {checkItems.map(item => {
                    const val = (cl as any)[item.key];
                    return (
                      <div key={item.key} className={`flex items-center gap-2 p-2 rounded text-xs ${val ? "bg-green-50" : "bg-red-50"}`}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                        {val ? <CheckCircle className="h-3 w-3 text-green-600 ml-auto" /> : <XCircle className="h-3 w-3 text-red-600 ml-auto" />}
                      </div>
                    );
                  })}
                  <div className={`flex items-center gap-2 p-2 rounded text-xs ${cl.suhuGudang >= 20 && cl.suhuGudang <= 25 ? "bg-green-50" : "bg-red-50"}`}>
                    <span>🌡️</span>
                    <span>Suhu Gudang: {cl.suhuGudang}°C</span>
                    {cl.suhuGudang >= 20 && cl.suhuGudang <= 25 ? <CheckCircle className="h-3 w-3 text-green-600 ml-auto" /> : <XCircle className="h-3 w-3 text-red-600 ml-auto" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
