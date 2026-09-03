import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, AlertTriangle, User, FileText, CheckCircle } from "lucide-react";

interface HealthForm {
  id: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  jantung: boolean;
  darahTinggi: boolean;
  hamil: boolean;
  alergi: string;
  tekanan: "ringan" | "sedang" | "kuat";
  areaFokus: string[];
  areaHindari: string;
  aroma: string;
  musik: string;
  informedConsent: boolean;
  keluhanUtama: string;
  submittedAt: string;
}

const MOCK_FORMS: HealthForm[] = [
  { id: "1", bookingId: "BK-001", customerName: "Siti Nurhaliza", serviceName: "Massage Bali 90m", jantung: false, darahTinggi: false, hamil: false, alergi: "Minyak kayu putih", tekanan: "sedang", areaFokus: ["punggung", "bahu"], areaHindari: "", aroma: "lavender", musik: "zen", informedConsent: true, keluhanUtama: "Pegal di punggung", submittedAt: "2026-09-03 09:30" },
  { id: "2", bookingId: "BK-002", customerName: "Budi Santoso", serviceName: "Deep Tissue 60m", jantung: false, darahTinggi: true, hamil: false, alergi: "", tekanan: "ringan", areaFokus: ["kaki"], areaHindari: "punggung atas", aroma: "eucalyptus", musik: "zen", informedConsent: true, keluhanUtama: "Nyeri kaki", submittedAt: "2026-09-03 10:00" },
  { id: "3", bookingId: "BK-003", customerName: "Rina Wati", serviceName: "Facial 60m", jantung: false, darahTinggi: false, hamil: true, alergi: "Produk seafood", tekanan: "ringan", areaFokus: ["wajah"], areaHindari: "", aroma: "lavender", musik: "zen", informedConsent: true, keluhanUtama: "Kulit kusam", submittedAt: "2026-09-03 11:15" },
];

export default function HealthForms() {
  const [forms] = useState(MOCK_FORMS);
  const [search, setSearch] = useState("");

  const filtered = forms.filter(f => !search || f.customerName.toLowerCase().includes(search.toLowerCase()));

  const hasAlert = (f: HealthForm) => f.jantung || f.darahTinggi || f.hamil || f.alergi.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Forms</h1>
          <p className="text-sm text-muted-foreground">Pre-arrival wellness forms • Health screening before treatment</p>
        </div>
      </div>

      <Input placeholder="Cari nama customer..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(form => (
          <Card key={form.id} className={hasAlert(form) ? "border-amber-300" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{form.customerName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{form.serviceName} • {form.submittedAt}</p>
                  </div>
                </div>
                {form.informedConsent && <Badge variant="outline" className="text-xs"><CheckCircle className="mr-1 h-3 w-3" /> Consent</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasAlert(form) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-amber-800">Perhatian:</p>
                    <ul className="text-amber-700 mt-1 space-y-0.5">
                      {form.jantung && <li>• Riwayat jantung</li>}
                      {form.darahTinggi && <li>• Darah tinggi</li>}
                      {form.hamil && <li>• Hamil</li>}
                      {form.alergi && <li>• Alergi: {form.alergi}</li>}
                    </ul>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Tekanan:</span> <Badge variant="outline" className="capitalize">{form.tekanan}</Badge></div>
                <div><span className="text-muted-foreground">Aroma:</span> {form.aroma}</div>
                <div><span className="text-muted-foreground">Musik:</span> {form.musik}</div>
                <div><span className="text-muted-foreground">Area Hindari:</span> {form.areaHindari || "Tidak ada"}</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Area Fokus:</p>
                <div className="flex flex-wrap gap-1">
                  {form.areaFokus.map(a => <Badge key={a} variant="default" className="text-xs capitalize">{a}</Badge>)}
                </div>
              </div>
              {form.keluhanUtama && <p className="text-xs"><span className="text-muted-foreground">Keluhan:</span> {form.keluhanUtama}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
