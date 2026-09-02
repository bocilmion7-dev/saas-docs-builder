import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sun, Moon, ClipboardCheck, Check, Clock, AlertCircle, User, ArrowRight,
} from "lucide-react";

const openingChecklist = [
  { id: "1", label: "Staff sudah absen", icon: User },
  { id: "2", label: "Kebersihan area toko", icon: ClipboardCheck },
  { id: "3", label: "Perangkat POS & EDC berfungsi", icon: ClipboardCheck },
  { id: "4", label: "Jaringan internet aktif", icon: ClipboardCheck },
  { id: "5", label: "Stok cepat habis dicek", icon: ClipboardCheck },
  { id: "6", label: "Display produk rapi", icon: ClipboardCheck },
  { id: "7", label: "Kas kecil tersedia", icon: ClipboardCheck },
  { id: "8", label: "AC / pencahayaan menyala", icon: ClipboardCheck },
];

const closingChecklist = [
  { id: "1", label: "Stop transaksi baru", icon: ClipboardCheck },
  { id: "2", label: "Selesaikan customer dalam", icon: ClipboardCheck },
  { id: "3", label: "Tutup shift kasir", icon: ClipboardCheck },
  { id: "4", label: "Rekonsiliasi harian", icon: ClipboardCheck },
  { id: "5", label: "Hitung setoran", icon: ClipboardCheck },
  { id: "6", label: "Cek stok akhir hari", icon: ClipboardCheck },
  { id: "7", label: "Matikan perangkat", icon: ClipboardCheck },
  { id: "8", label: "Kunci toko & alarm aktif", icon: ClipboardCheck },
];

const recentLogs = [
  { type: "opening", user: "Andi Wijaya", time: "2026-09-02 07:00", status: "completed" },
  { type: "closing", user: "Sari Dewi", time: "2026-09-01 22:15", status: "completed" },
  { type: "opening", user: "Andi Wijaya", time: "2026-09-01 07:05", status: "completed" },
  { type: "closing", user: "Rudi Hartono", time: "2026-08-31 22:00", status: "completed" },
];

export default function OpeningClosingPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"opening" | "closing">("opening");

  const checklist = mode === "opening" ? openingChecklist : closingChecklist;
  const checkedCount = checklist.filter((c) => checked[c.id]).length;
  const allChecked = checkedCount === checklist.length;

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Opening & Closing</h1>
        <p className="text-sm text-muted-foreground mt-1">Checklist pembukaan dan penutupan toko</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Checklist */}
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setMode("opening"); setChecked({}); }}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                mode === "opening"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Sun className="size-4" /> Opening
            </button>
            <button
              onClick={() => { setMode("closing"); setChecked({}); }}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                mode === "closing"
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Moon className="size-4" /> Closing
            </button>
          </div>

          {/* Progress */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="size-4 text-muted-foreground" />
                  Checklist {mode === "opening" ? "Pembukaan" : "Penutupan"}
                </CardTitle>
                <Badge variant={allChecked ? "default" : "secondary"}>
                  {checkedCount}/{checklist.length}
                </Badge>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    mode === "opening" ? "bg-amber-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${(checkedCount / checklist.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`flex items-center gap-3 w-full rounded-xl p-3.5 text-left transition-all ${
                    checked[item.id]
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted/50 border border-transparent hover:border-border"
                  }`}
                >
                  <div className={`flex size-7 items-center justify-center rounded-lg border-2 transition-colors ${
                    checked[item.id] ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background"
                  }`}>
                    {checked[item.id] && <Check className="size-4" />}
                  </div>
                  <span className={`text-sm font-medium ${checked[item.id] ? "text-primary" : ""}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Submit */}
          {allChecked && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Check className="size-4" />
                  Checklist selesai! Siap {mode === "opening" ? "membuka" : "menutup"} toko.
                </div>
                <Button size="sm" className="gap-1.5">
                  {mode === "opening" ? "Buka Toko" : "Tutup Toko"}
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Logs */}
        <Card className="border-border/60 lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Riwayat Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {recentLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`flex size-8 items-center justify-center rounded-lg ${
                    log.type === "opening" ? "bg-amber-500/10 text-amber-600" : "bg-indigo-500/10 text-indigo-600"
                  }`}>
                    {log.type === "opening" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.type === "opening" ? "Opening" : "Closing"}</p>
                    <p className="text-xs text-muted-foreground">{log.user} · {log.time}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">✓</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
