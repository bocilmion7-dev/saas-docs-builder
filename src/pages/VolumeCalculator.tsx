import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Paintbrush, Info } from "lucide-react";

const canSizes = [1, 5, 25];
const DAYA_SEBAR = 11; // m2 per liter (average)

export default function VolumeCalculator() {
  const [luas, setLuas] = useState(50);
  const [dayaSebar, setDayaSebar] = useState(DAYA_SEBAR);
  const [lapis, setLapis] = useState(2);

  const kebutuhanLiter = (luas / dayaSebar) * lapis;
  const recommendCan = (kebutuhanLiter: number) => {
    const result: { size: number; qty: number; total: number }[] = [];
    let remaining = kebutuhanLiter;
    for (const size of [...canSizes].reverse()) {
      const qty = Math.floor(remaining / size);
      if (qty > 0) { result.push({ size, qty, total: qty * size }); remaining -= qty * size; }
    }
    if (remaining > 0) { result.push({ size: 1, qty: Math.ceil(remaining), total: Math.ceil(remaining) }); }
    return result;
  };
  const recommendation = recommendCan(kebutuhanLiter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Volume Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">Hitung kebutuhan cat berdasarkan luas area (m²)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calculator className="size-4" /> Input Perhitungan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Luas Area (m²)</Label>
                <Input type="number" value={luas} onChange={(e) => setLuas(Number(e.target.value))} min={1} />
              </div>
              <div className="grid gap-2">
                <Label>Daya Sebar (m²/L)</Label>
                <Input type="number" value={dayaSebar} onChange={(e) => setDayaSebar(Number(e.target.value))} min={8} max={14} />
                <p className="text-[10px] text-muted-foreground">Standar: 10-12 m²/L</p>
              </div>
              <div className="grid gap-2">
                <Label>Jumlah Lapisan</Label>
                <Input type="number" value={lapis} onChange={(e) => setLapis(Number(e.target.value))} min={1} max={3} />
                <p className="text-[10px] text-muted-foreground">1 lapis (tipis), 2 lapis (standar)</p>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-5">
              <p className="text-sm text-muted-foreground">Kebutuhan Total</p>
              <p className="text-4xl font-extrabold text-primary mt-1">{kebutuhanLiter.toFixed(1)} Liter</p>
              <p className="text-xs text-muted-foreground mt-1">
                = {luas}m² ÷ {dayaSebar}m²/L × {lapis} lapis
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Rekomendasi Kaleng</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recommendation.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="size-4 text-primary" />
                    <span className="text-sm font-medium">{r.qty}x Kaleng {r.size}L</span>
                  </div>
                  <span className="text-sm font-bold">{r.total}L</span>
                </div>
              ))}
              <div className="border-t border-border/60 pt-2 flex justify-between text-sm">
                <span className="font-bold">Total Volume</span>
                <span className="font-extrabold text-primary">{recommendation.reduce((s, r) => s + r.total, 0)}L</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Tips:</p>
                  <ul className="space-y-0.5">
                    <li>• Daya sebar bervariasi tergantung permukaan (tembok kasar = 8-10 m²/L)</li>
                    <li>• Untuk warna gelap, tambah 10% cadangan</li>
                    <li>• Gunakan primer jika permukaan baru/tanpa cat sebelumnya</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full gap-2"><Paintbrush className="size-4" /> Tambah ke Keranjang</Button>
        </div>
      </div>
    </div>
  );
}
