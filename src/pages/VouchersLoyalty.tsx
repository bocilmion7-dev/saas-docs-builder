import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Ticket, Award, Plus, Trash2, Star, Search } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function VouchersLoyalty() {
  const tenantId = useTenantId() ?? "";
  const vouchers = useQuery(api.vouchers.listVouchers, { tenantId }) ?? [];
  const programs = useQuery(api.vouchers.listLoyaltyPrograms, { tenantId }) ?? [];
  const customers = useQuery(api.vouchers.listCustomersWithPoints, tenantId ? { tenantId } : "skip") ?? [];
  const createVoucher = useMutation(api.vouchers.createVoucher);
  const removeVoucher = useMutation(api.vouchers.removeVoucher);
  const updateVoucher = useMutation(api.vouchers.updateVoucher);
  const createProgram = useMutation(api.vouchers.createLoyaltyProgram);
  const removeProgram = useMutation(api.vouchers.removeLoyaltyProgram);
  const updateProgram = useMutation(api.vouchers.updateLoyaltyProgram);
  const addPoints = useMutation(api.vouchers.addPoints);
  const redeemPoints = useMutation(api.vouchers.redeemPoints);

  const [search, setSearch] = useState("");
  const [pointsDialog, setPointsDialog] = useState<null | { id: string; name: string; points: number }>(null);
  const [pointsMode, setPointsMode] = useState<"add" | "redeem">("add");
  const [pointsQty, setPointsQty] = useState("100");
  const [pointsResult, setPointsResult] = useState<string | null>(null);

  const filteredCustomers = search
    ? customers.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone ?? "").includes(search))
    : customers;

  const doPoints = async () => {
    if (!pointsDialog) return;
    setPointsResult(null);
    const qty = Math.abs(Number(pointsQty)) || 0;
    try {
      if (pointsMode === "add") {
        await addPoints({ tenantId, customerId: pointsDialog.id, points: qty, note: "Penyesuaian poin manual" });
        setPointsResult(`✓ ${qty} poin ditambahkan ke ${pointsDialog.name}`);
      } else {
        const res = await redeemPoints({ tenantId, customerId: pointsDialog.id, points: qty });
        setPointsResult(`✓ Voucher ${res.code} dibuat (Rp ${res.value.toLocaleString("id-ID")}) — saldo sisa ${res.newBalance} poin`);
      }
    } catch (e: any) {
      setPointsResult(`✗ ${e?.message ?? "Gagal"}`);
    }
  };

  const [vDialogOpen, setVDialogOpen] = useState(false);
  const [lDialogOpen, setLDialogOpen] = useState(false);
  const [vForm, setVForm] = useState({ code: "", type: "fixed", value: 10000, minPurchase: 50000, quota: 100, startDate: 0, endDate: 0 });
  const [lForm, setLForm] = useState({ name: "", type: "stamp", threshold: 10, rewardDescription: "" });

  const saveVoucher = async () => {
    if (!vForm.code) return;
    await createVoucher({ tenantId, ...vForm, startDate: vForm.startDate || undefined, endDate: vForm.endDate || undefined });
    setVDialogOpen(false); setVForm({ code: "", type: "fixed", value: 10000, minPurchase: 50000, quota: 100, startDate: 0, endDate: 0 });
  };

  const saveProgram = async () => {
    if (!lForm.name) return;
    await createProgram({ tenantId, ...lForm });
    setLDialogOpen(false); setLForm({ name: "", type: "stamp", threshold: 10, rewardDescription: "" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Voucher & Loyalty</h1>
      <Tabs defaultValue="vouchers">
        <TabsList>
          <TabsTrigger value="vouchers" className="flex items-center gap-1"><Ticket className="h-4 w-4" /> Vouchers</TabsTrigger>
          <TabsTrigger value="points" className="flex items-center gap-1"><Star className="h-4 w-4" /> Poin Pelanggan</TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-1"><Award className="h-4 w-4" /> Loyalty</TabsTrigger>
        </TabsList>
        <TabsContent value="vouchers" className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => setVDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Voucher Baru</Button></div>
          <div className="space-y-3">
            {vouchers.map((v: any) => (
              <Card key={v._id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-sm">{v.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.type === "fixed" ? formatRp(v.value) : `${v.value}% off`}
                      {v.minPurchase > 0 && ` • Min. ${formatRp(v.minPurchase)}`}
                      • {v.usedCount}/{v.quota} used
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={v.isActive ? "default" : "secondary"} className="text-xs">{v.isActive ? "Active" : "Inactive"}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => updateVoucher({ id: v._id, isActive: !v.isActive })}>{v.isActive ? "Off" : "On"}</Button>
                    <Button size="sm" variant="ghost" onClick={() => removeVoucher({ id: v._id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {vouchers.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada voucher.</p>}
          </div>
        </TabsContent>
        <TabsContent value="points" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari pelanggan…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
            <p className="text-xs text-muted-foreground">1 poin per Rp 1.000 belanja • 100 poin = voucher Rp 50.000</p>
          </div>
          <div className="space-y-3">
            {filteredCustomers.map((c: any) => (
              <Card key={c._id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className={`h-5 w-5 ${c.loyaltyPoints > 0 ? "text-amber-500" : "text-muted-foreground/40"}`} />
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone || "-"}{c.birthDate ? ` • 🎂 ${new Date(c.birthDate).toLocaleDateString("id", { day: "numeric", month: "short" })}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.loyaltyPoints > 0 ? "default" : "secondary"} className="text-xs">{c.loyaltyPoints} poin</Badge>
                    <Button size="sm" variant="outline" onClick={() => { setPointsDialog(c); setPointsMode("add"); setPointsQty("100"); setPointsResult(null); }}>
                      <Plus className="h-3 w-3 mr-1" /> Poin
                    </Button>
                    <Button size="sm" variant="outline" disabled={c.loyaltyPoints < 50} onClick={() => { setPointsDialog(c); setPointsMode("redeem"); setPointsQty("100"); setPointsResult(null); }}>
                      <Ticket className="h-3 w-3 mr-1" /> Tukar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCustomers.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada pelanggan. Tambahkan di menu Pelanggan.</p>}
          </div>

          <Dialog open={!!pointsDialog} onOpenChange={(o) => { if (!o) setPointsDialog(null); }}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>{pointsMode === "add" ? "Tambah Poin" : "Tukar Poin → Voucher"} — {pointsDialog?.name}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" variant={pointsMode === "add" ? "default" : "outline"} onClick={() => { setPointsMode("add"); setPointsResult(null); }}>➕ Tambah</Button>
                  <Button size="sm" variant={pointsMode === "redeem" ? "default" : "outline"} onClick={() => { setPointsMode("redeem"); setPointsResult(null); }}>🎟️ Tukar Voucher</Button>
                </div>
                <div>
                  <Label className="text-xs">Jumlah poin {pointsMode === "redeem" ? "(min. 50, kelipatan 50)" : ""}</Label>
                  <Input type="number" value={pointsQty} onChange={(e) => setPointsQty(e.target.value)} />
                </div>
                {pointsMode === "redeem" && pointsDialog && Number(pointsQty) >= 50 && (
                  <p className="text-xs text-muted-foreground">
                    Hasil: voucher diskon <strong>{formatRp(Math.round((Math.abs(Number(pointsQty)) / 100) * 50000))}</strong> (min. belanja {formatRp(Math.round((Math.abs(Number(pointsQty)) / 100) * 50000) * 2)})
                  </p>
                )}
                {pointsResult && <p className={`text-xs ${pointsResult.startsWith("✓") ? "text-emerald-600" : "text-red-600"}`}>{pointsResult}</p>}
                <Button onClick={doPoints} className="w-full" disabled={!pointsDialog}>Proses</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="loyalty" className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => setLDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Program Baru</Button></div>
          <div className="space-y-3">
            {programs.map((p: any) => (
              <Card key={p._id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Threshold: {p.threshold} • {p.rewardDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">{p.isActive ? "Active" : "Inactive"}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => updateProgram({ id: p._id, isActive: !p.isActive })}>{p.isActive ? "Off" : "On"}</Button>
                    <Button size="sm" variant="ghost" onClick={() => removeProgram({ id: p._id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {programs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada program loyalitas.</p>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={vDialogOpen} onOpenChange={setVDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Voucher Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Kode Voucher</Label><Input value={vForm.code} onChange={(e) => setVForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Tipe</Label><select value={vForm.type} onChange={(e) => setVForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="fixed">Fixed (Rp)</option><option value="percent">Persen (%)</option></select></div>
              <div><Label className="text-xs">Nilai</Label><Input type="number" value={vForm.value} onChange={(e) => setVForm((f) => ({ ...f, value: +e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Min. Belanja</Label><Input type="number" value={vForm.minPurchase} onChange={(e) => setVForm((f) => ({ ...f, minPurchase: +e.target.value }))} /></div>
              <div><Label className="text-xs">Quota</Label><Input type="number" value={vForm.quota} onChange={(e) => setVForm((f) => ({ ...f, quota: +e.target.value }))} /></div>
            </div>
            <Button onClick={saveVoucher} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={lDialogOpen} onOpenChange={setLDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Program Loyalty Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Nama Program</Label><Input value={lForm.name} onChange={(e) => setLForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Tipe</Label><select value={lForm.type} onChange={(e) => setLForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm"><option value="stamp">Stamp</option><option value="points">Points</option></select></div>
              <div><Label className="text-xs">Threshold</Label><Input type="number" value={lForm.threshold} onChange={(e) => setLForm((f) => ({ ...f, threshold: +e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Reward</Label><Input value={lForm.rewardDescription} onChange={(e) => setLForm((f) => ({ ...f, rewardDescription: e.target.value }))} /></div>
            <Button onClick={saveProgram} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
