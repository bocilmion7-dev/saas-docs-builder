import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenantId } from "@/hooks/use-tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldAlert, Wrench, Plus, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (t: number) => new Date(t).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

const secTypeCfg: Record<string, string> = {
  shoplifting: "Pencurian (shoplifting)",
  suspicious: "Orang mencurigakan",
  vandalism: "Vandalisme",
  incident: "Insiden lainnya",
};
const secTypeCls: Record<string, string> = {
  shoplifting: "bg-red-500/10 text-red-600",
  suspicious: "bg-amber-500/10 text-amber-600",
  vandalism: "bg-orange-500/10 text-orange-600",
  incident: "bg-muted text-muted-foreground",
};
const maintStatusCfg: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-red-500/10 text-red-600" },
  in_progress: { label: "Dikerjakan", cls: "bg-amber-500/10 text-amber-600" },
  resolved: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600" },
};

const MAINT_ITEMS = ["AC", "Pencahayaan / spotlight", "Cermin fitting room", "Rak & hanger", "CCTV", "Alarm tag", "POS / EDC", "Lainnya"];

export default function SecurityMaintenancePage() {
  const tenantId = useTenantId() ?? "";
  const security = useQuery(api.clothing.listSecurity, { tenantId }) ?? [];
  const maintenance = useQuery(api.clothing.listMaintenance, { tenantId }) ?? [];
  const createSec = useMutation(api.clothing.createSecurityLog);
  const createMaint = useMutation(api.clothing.createMaintenance);
  const updateMaint = useMutation(api.clothing.updateMaintenance);

  const [secOpen, setSecOpen] = useState(false);
  const [maintOpen, setMaintOpen] = useState(false);
  const [secForm, setSecForm] = useState({ type: "suspicious", description: "", estimatedLoss: 0, actionTaken: "" });
  const [maintForm, setMaintForm] = useState({ item: "CCTV", issue: "", priority: "medium" });

  const totalLoss = security.reduce((s, x) => s + (x.estimatedLoss ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Keamanan & Fasilitas</h1>
        <p className="text-sm text-muted-foreground mt-1">Toko pakaian rawan pencurian — CCTV, cermin sudut, customer service aktif, alarm premium · perawatan AC, pencahayaan, fitting room, rak</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><ShieldAlert className="size-8 text-red-500" /><div><p className="text-2xl font-extrabold">{security.length}</p><p className="text-xs text-muted-foreground">Insiden keamanan</p></div><div className="ml-auto text-right"><p className="text-sm font-extrabold text-red-500">{fmtRp(totalLoss)}</p><p className="text-[10px] text-muted-foreground">estimasi kerugian</p></div></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><Wrench className="size-8 text-primary" /><div><p className="text-2xl font-extrabold">{maintenance.length}</p><p className="text-xs text-muted-foreground">Ticket maintenance</p></div><div className="ml-auto text-right"><p className="text-sm font-extrabold text-amber-500">{maintenance.filter((m) => m.status !== "resolved").length}</p><p className="text-[10px] text-muted-foreground">belum selesai</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="security">
        <TabsList>
          <TabsTrigger value="security">🛡️ Log Keamanan ({security.length})</TabsTrigger>
          <TabsTrigger value="maintenance">🔧 Maintenance Fasilitas ({maintenance.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Log Insiden & Pencegahan</CardTitle>
              <Button size="sm" className="gap-1.5" onClick={() => setSecOpen(true)}><Plus className="size-4" /> Catat Insiden</Button>
            </CardHeader>
            <CardContent className="space-y-2 p-5 pt-0">
              {security.map((s) => (
                <div key={s._id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                  <Badge className={secTypeCls[s.type] ?? ""}>{secTypeCfg[s.type] ?? s.type}</Badge>
                  <div className="flex-1">
                    <p className="text-sm">{s.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{fmtDate(s.createdAt)}{s.handledByName ? ` · ${s.handledByName}` : ""}</p>
                    {s.actionTaken && <p className="text-xs text-muted-foreground mt-1">Tindakan: {s.actionTaken}</p>}
                  </div>
                  {s.estimatedLoss ? <span className="text-sm font-bold text-red-500">{fmtRp(s.estimatedLoss)}</span> : null}
                </div>
              ))}
              {security.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">Belum ada insiden tercatat.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Ticket Perawatan Fasilitas</CardTitle>
              <Button size="sm" className="gap-1.5" onClick={() => setMaintOpen(true)}><Plus className="size-4" /> Buat Ticket</Button>
            </CardHeader>
            <CardContent className="space-y-2 p-5 pt-0">
              {maintenance.map((m) => (
                <div key={m._id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                  <div className="rounded-lg bg-muted p-2"><Wrench className="size-4 text-primary" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.item}</p>
                    <p className="text-xs text-muted-foreground">{m.issue} · {fmtDate(m.createdAt)}</p>
                  </div>
                  <Badge variant={m.priority === "high" ? "destructive" : m.priority === "medium" ? "secondary" : "outline"}>{m.priority}</Badge>
                  <Badge className={maintStatusCfg[m.status]?.cls ?? ""}>{maintStatusCfg[m.status]?.label ?? m.status}</Badge>
                  <div className="flex gap-1.5">
                    {m.status === "open" && (
                      <Button size="sm" variant="outline" className="gap-1 text-amber-600" onClick={async () => { await updateMaint({ id: m._id, status: "in_progress" }); }}><Clock className="size-3.5" /> Mulai</Button>
                    )}
                    {m.status !== "resolved" && (
                      <Button size="sm" variant="outline" className="gap-1 text-emerald-600" onClick={async () => { await updateMaint({ id: m._id, status: "resolved" }); toast.success("Ticket diselesaikan"); }}><CheckCircle2 className="size-3.5" /> Selesai</Button>
                    )}
                  </div>
                </div>
              ))}
              {maintenance.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">Belum ada ticket maintenance. Cek AC, cermin, rak, CCTV secara berkala.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security dialog */}
      <Dialog open={secOpen} onOpenChange={setSecOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Insiden Keamanan</DialogTitle>
            <DialogDescription>Jika pencuri tertangkap: panggil security/polisi — jangan main hakim sendiri.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Jenis Insiden</Label>
              <Select value={secForm.type} onValueChange={(v) => setSecForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(secTypeCfg).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Input value={secForm.description} onChange={(e) => setSecForm((f) => ({ ...f, description: e.target.value }))} placeholder="cth: 2 orang mencurigakan di area fitting room" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Estimasi Kerugian</Label>
                <Input type="number" value={secForm.estimatedLoss || ""} onChange={(e) => setSecForm((f) => ({ ...f, estimatedLoss: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Tindakan</Label>
                <Input value={secForm.actionTaken} onChange={(e) => setSecForm((f) => ({ ...f, actionTaken: e.target.value }))} placeholder="cth: diingatkan, CCTV dicatat" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecOpen(false)}>Batal</Button>
            <Button disabled={!secForm.description} onClick={async () => {
              await createSec({ tenantId, ...secForm, estimatedLoss: secForm.estimatedLoss || undefined });
              toast.success("Insiden dicatat");
              setSecOpen(false);
              setSecForm({ type: "suspicious", description: "", estimatedLoss: 0, actionTaken: "" });
            }}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance dialog */}
      <Dialog open={maintOpen} onOpenChange={setMaintOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Ticket Maintenance</DialogTitle>
            <DialogDescription>Fasilitas rusak → ticket → perbaiki sebelum mengganggu operasional toko.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Fasilitas</Label>
              <Select value={maintForm.item} onValueChange={(v) => setMaintForm((f) => ({ ...f, item: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MAINT_ITEMS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Masalah</Label>
              <Input value={maintForm.issue} onChange={(e) => setMaintForm((f) => ({ ...f, issue: e.target.value }))} placeholder="cth: lampu display mati 2 titik" />
            </div>
            <div>
              <Label>Prioritas</Label>
              <Select value={maintForm.priority} onValueChange={(v) => setMaintForm((f) => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High — segera</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintOpen(false)}>Batal</Button>
            <Button disabled={!maintForm.issue} onClick={async () => {
              await createMaint({ tenantId, ...maintForm });
              toast.success("Ticket maintenance dibuat");
              setMaintOpen(false);
              setMaintForm({ item: "CCTV", issue: "", priority: "medium" });
            }}>Buat Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
