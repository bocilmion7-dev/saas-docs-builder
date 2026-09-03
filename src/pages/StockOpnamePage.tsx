import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenantId } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ClipboardCheck, Plus, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const fmtDate = (t: number) => new Date(t).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function StockOpnamePage() {
  const tenantId = useTenantId() ?? "";
  const { user } = useAuth();
  const sessions = useQuery(api.clothing.listOpname, { tenantId }) ?? [];
  const startOpname = useMutation(api.clothing.startOpname);
  const updateItem = useMutation(api.clothing.updateOpnameItem);
  const finalize = useMutation(api.clothing.finalizeOpname);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmFinal, setConfirmFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  const active = sessions.find((s) => s._id === activeId) ?? null;
  const openSessions = sessions.filter((s) => s.status === "counting");
  const totalVariance = (s: any) => s.items.reduce((sum: number, i: any) => sum + i.variance, 0);

  const begin = async () => {
    setBusy(true);
    try {
      const id = await startOpname({ tenantId, countedBy: user?.name });
      setActiveId(id as any);
      toast.success("Sesi opname dibuat — hitung fisik & isi qty aktual");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memulai opname");
    }
    setBusy(false);
  };

  const doFinalize = async () => {
    if (!active) return;
    setBusy(true);
    try {
      const res = await finalize({ sessionId: active._id, approvedBy: user?.name });
      toast.success(`Opname selesai: ${res.adjusted} SKU disesuaikan (total selisih ${res.totalVariance > 0 ? "+" : ""}${res.totalVariance} pcs)`);
      setConfirmFinal(false);
      setDrafts({});
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal finalisasi");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Stock Opname</h1>
          <p className="text-sm text-muted-foreground mt-1">Fast moving (Size M & L, warna netral): 2 mingguan · Semua stok: bulanan. Hitung fisik → variance → approval → update sistem.</p>
        </div>
        <Button onClick={begin} disabled={busy || openSessions.length > 0} className="gap-2"><Plus className="size-4" /> Mulai Opname Baru</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold">{sessions.length}</p><p className="text-xs text-muted-foreground">Total sesi</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-amber-500">{openSessions.length}</p><p className="text-xs text-muted-foreground">Sedang berjalan</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-emerald-500">{sessions.filter((s) => s.status === "approved").length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Session list */}
        <div className="lg:col-span-1 space-y-3">
          {sessions.map((s) => {
            const variance = totalVariance(s);
            return (
              <button key={s._id} onClick={() => setActiveId(s._id)} className={`w-full text-left rounded-xl border p-4 transition-all ${activeId === s._id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/60 hover:border-primary/40"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{s.sessionNumber}</span>
                  <Badge className={s.status === "counting" ? "bg-amber-500/10 text-amber-600 border-0" : "bg-emerald-500/10 text-emerald-600 border-0"}>{s.status === "counting" ? "Counting" : "Approved"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{fmtDate(s.createdAt)} · {s.items.length} SKU</p>
                <p className={`text-xs font-bold mt-1 ${variance === 0 ? "text-muted-foreground" : "text-red-500"}`}>
                  Selisih: {variance === 0 ? "—" : variance > 0 ? `+${variance}` : variance} pcs
                </p>
              </button>
            );
          })}
          {sessions.length === 0 && <Card className="border-dashed"><CardContent className="p-6 text-center text-muted-foreground text-sm"><ClipboardCheck className="size-8 mx-auto mb-2 opacity-40" />Belum ada sesi opname</CardContent></Card>}
        </div>

        {/* Counting sheet */}
        <div className="lg:col-span-2 space-y-3">
          {!active && (
            <Card className="border-dashed"><CardContent className="p-12 text-center text-muted-foreground">
              <ClipboardCheck className="size-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Pilih sesi opname untuk mulai menghitung</p>
              <p className="text-xs mt-1">Snapshot stok sistem dibuat otomatis saat sesi dimulai — petugas menghitung fisik per ukuran & warna lalu mengisi qty aktual.</p>
            </CardContent></Card>
          )}
          {active && active.status === "counting" && (
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="size-4 text-primary" /> Lembar Hitung — {active.sessionNumber}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
                {active.items.map((it: any) => {
                  const draft = drafts[it._id] ?? it.qtyActual;
                  const diff = draft - it.qtySystem;
                  return (
                    <div key={it._id} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{it.note || "Produk"}</p>
                        <p className="text-[11px] text-muted-foreground">Sistem: <strong>{it.qtySystem}</strong></p>
                      </div>
                      {diff !== 0 && <Badge variant="outline" className={diff > 0 ? "text-blue-500 border-blue-200" : "text-red-500 border-red-200"}>{diff > 0 ? "+" : ""}{diff}</Badge>}
                      <div className="flex items-center gap-1.5">
                        <Input type="number" className="w-24 text-right font-bold" value={draft === 0 ? "" : draft} onChange={(e) => {
                          const val = Number(e.target.value);
                          setDrafts((d) => ({ ...d, [it._id]: val }));
                        }} onBlur={async () => {
                          if (draft !== it.qtyActual) {
                            await updateItem({ id: it._id, qtyActual: draft });
                            setDrafts((d) => { const c = { ...d }; delete c[it._id]; return c; });
                          }
                        }} />
                      </div>
                    </div>
                  );
                })}
                {active.items.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">Tidak ada produk untuk dihitung.</p>}
              </CardContent>
            </Card>
          )}
          {active && active.status === "counting" && (
            <div className="flex justify-end">
              <Button className="gap-2" disabled={busy} onClick={() => setConfirmFinal(true)}><CheckCircle2 className="size-4" /> Approval & Finalisasi Opname</Button>
            </div>
          )}
          {active && active.status === "approved" && (
            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardContent className="p-5 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-emerald-700">Opname {active.sessionNumber} sudah di-approve</p>
                  <p className="text-muted-foreground mt-1">Selisih total: {totalVariance(active)} pcs{active.notes ? ` · Catatan: ${active.notes}` : ""}. Stock adjustment otomatis dicatat.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Finalize confirm */}
      <Dialog open={confirmFinal} onOpenChange={setConfirmFinal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approval Hasil Opname</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Seluruh selisih akan diterapkan ke stok sistem (produk & varian) dan dicatat sebagai stock adjustment.
            </DialogDescription>
          </DialogHeader>
          {active && (
            <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-1">
              <p><strong>{active.items.length}</strong> SKU dihitung</p>
              <p>Total selisih: <strong className={totalVariance(active) === 0 ? "" : "text-red-500"}>{totalVariance(active) > 0 ? "+" : ""}{totalVariance(active)}</strong> pcs</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmFinal(false)}>Batal</Button>
            <Button onClick={doFinalize} disabled={busy} className="gap-2"><Save className="size-4" /> Approve & Terapkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
