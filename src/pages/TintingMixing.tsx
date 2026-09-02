import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, FlaskConical, Printer, CheckCircle, AlertTriangle } from "lucide-react";

const colorFormulas = [
  { code: "Nippon 4316P", name: "Putih Tulang", brand: "Nippon", finish: "Gloss", base: "white", pigments: [{ code: "R12", ml: 3.2 }, { code: "Y05", ml: 1.1 }, { code: "B03", ml: 0.4 }] },
  { code: "Nippon 5163G", name: "Krem Linen", brand: "Nippon", finish: "Satin", base: "white", pigments: [{ code: "R12", ml: 5.8 }, { code: "Y05", ml: 4.2 }, { code: "B03", ml: 1.0 }] },
  { code: "Dulux C08", name: "Abu-abu Batu", brand: "Dulux", finish: "Matt", base: "medium", pigments: [{ code: "B03", ml: 2.5 }, { code: "K01", ml: 8.0 }] },
  { code: "Avian 1211", name: "Biru Langit", brand: "Avian", finish: "Gloss", base: "white", pigments: [{ code: "B08", ml: 6.0 }, { code: "B03", ml: 1.2 }] },
];

const machines = [
  { id: "TM-001", name: "Tinting Machine #1", status: "active", totalMixCount: 1247, lastCalibration: "2026-08-15", lastCleaned: "2026-09-01" },
  { id: "TM-002", name: "Shaker #1", status: "active", totalMixCount: 982, lastCalibration: "2026-08-20", lastCleaned: "2026-09-02" },
];

export default function TintingMixing() {
  const [baseVolume, setBaseVolume] = useState(5000);
  const [selectedFormula, setSelectedFormula] = useState(colorFormulas[0]);

  const scale = baseVolume / 5000;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Tinting & Mixing</h1>
          <p className="text-sm text-muted-foreground mt-1">Campur base + pigment — formula warna Nippon/Dulux/Avian</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Mixing Interface */}
        <div className="space-y-4">
          {/* Color Formula Selection */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><FlaskConical className="size-4" /> Formula Warna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {colorFormulas.map((f) => (
                  <button key={f.code} onClick={() => setSelectedFormula(f)} className={`rounded-lg p-3 text-left text-sm transition-all border ${selectedFormula.code === f.code ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border"}`}>
                    <p className="font-bold">{f.code}</p>
                    <p className="text-muted-foreground text-xs">{f.name} · {f.brand} · {f.finish}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mixing Calculator */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Paintbrush className="size-4" /> Kalkulator Mixing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Base Volume (ml)</Label>
                  <Input type="number" value={baseVolume} onChange={(e) => setBaseVolume(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label>Base Type</Label>
                  <Input value={selectedFormula.base} disabled />
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                <p className="text-sm font-bold">Pigment yang dibutuhkan ({baseVolume}ml):</p>
                {selectedFormula.pigments.map((p) => (
                  <div key={p.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">{p.code}</span>
                      <span className="text-sm">{p.code === "R12" ? "Merah" : p.code === "Y05" ? "Kuning" : p.code === "B03" ? "Biru" : p.code === "K01" ? "Hitam" : p.code === "B08" ? "Biru Tua" : "Pigment"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold">{(p.ml * scale).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">ml</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border/60 pt-2 flex justify-between text-sm">
                  <span className="font-bold">Total Pigmen</span>
                  <span className="font-extrabold">{(selectedFormula.pigments.reduce((s, p) => s + p.ml, 0) * scale).toFixed(1)} ml</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2"><FlaskConical className="size-4" /> Mulai Mixing</Button>
                <Button variant="outline" className="gap-2"><Printer className="size-4" /> Cetak Label</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Machine Status */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Mesin Tinting</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {machines.map((m) => (
                <div key={m.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{m.name}</p>
                    <Badge className={m.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}>
                      {m.status === "active" ? "Aktif" : "Maintenance"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Total mixing: {m.totalMixCount}x</p>
                    <p>Kalibrasi terakhir: {m.lastCalibration}</p>
                    <p>Bersih terakhir: {m.lastCleaned}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-700">Maintenance Reminder</p>
                  <p className="text-amber-600">TM-001 kalibrasi terakhir 18 hari lalu. Kalibrasi rutin setiap 14 hari.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
