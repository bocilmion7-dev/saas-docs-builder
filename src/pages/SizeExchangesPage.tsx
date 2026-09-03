import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenantId } from "@/hooks/use-tenant";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RefreshCcw, Check, X, Flag } from "lucide-react";
import { toast } from "sonner";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const fmtDate = (t: number) => new Date(t).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

const statusCfg: Record<string, { label: string; cls: string }> = {
  requested: { label: "Diminta", cls: "bg-amber-500/10 text-amber-600" },
  approved: { label: "Disetujui — tukar ukuran", cls: "bg-blue-500/10 text-blue-600" },
  completed: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600" },
  rejected: { label: "Ditolak", cls: "bg-red-500/10 text-red-600" },
};

export default function SizeExchangesPage() {
  const tenantId = useTenantId() ?? "";
  const list = useQuery(api.clothing.listSizeExchanges, { tenantId }) ?? [];
  const productsRes = useQuery(api.products.list, { tenantId });
  const products = productsRes?.items ?? [];
  const customers = useQuery(api.customers.list, { tenantId }) ?? [];
  const allVariants = useQuery(api.clothing.listVariants, { tenantId }) ?? [];
  const create = useMutation(api.clothing.createSizeExchange);
  const update = useMutation(api.clothing.updateSizeExchange);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ customerId: "", orderId: "", productId: "", oldSize: "", newSize: "", color: "", reason: "" });

  const productById = (id: string) => products.find((p) => p._id === id);
  const variantsOf = (pid: string) => allVariants.filter((v) => v.productId === pid);

  const doAction = async (id: any, status: string, extra?: { tagsAttached?: boolean; conditionOk?: boolean; priceDiff?: number }) => {
    setBusy(true);
    try {
      await update({ id, status, ...extra });
      toast.success(status === "approved" ? "Disetujui — stok ukuran lama +1, ukuran baru −1" : status === "completed" ? "Exchange selesai" : "Permintaan ditolak");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
    setBusy(false);
  };

  const save = async () => {
    if (!form.productId || !form.oldSize || !form.newSize) return;
    setBusy(true);
    try {
      const p = productById(form.productId)!;
      await create({
        tenantId,
        customerId: form.customerId || undefined,
        orderId: form.orderId || undefined,
        productId: form.productId,
        productName: p.name,
        oldSize: form.oldSize,
        newSize: form.newSize,
        color: form.color || undefined,
        reason: form.reason || undefined,
      });
      toast.success("Permintaan size exchange dicatat");
      setOpen(false);
      setForm({ customerId: "", orderId: "", productId: "", oldSize: "", newSize: "", color: "", reason: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Size Exchange</h1>
          <p className="text-sm text-muted-foreground mt-1">Tukar ukuran (mis. M → L) — masalah #1 toko pakaian. Syarat: max 7–14 hari, hangtag utuh, tanpa noda/bekas pakai.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><RefreshCcw className="size-4" /> Catat Size Exchange</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold">{list.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-amber-500">{list.filter((x) => x.status === "requested").length}</p><p className="text-xs text-muted-foreground">Menunggu</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-blue-500">{list.filter((x) => x.status === "approved").length}</p><p className="text-xs text-muted-foreground">Disetujui</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-emerald-500">{list.filter((x) => x.status === "completed").length}</p><p className="text-xs text-muted-foreground">Selesai</p></CardContent></Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-center">Tukar</TableHead>
                <TableHead className="text-center">Warna</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((x) => (
                <TableRow key={x._id}>
                  <TableCell>
                    <p className="font-medium">{x.customerName ?? "—"}</p>
                    <p className="text-[11px] text-muted-foreground">{fmtDate(x.createdAt)}{x.orderId ? ` · ${x.orderId.slice(0, 8)}` : ""}</p>
                  </TableCell>
                  <TableCell className="text-sm">{x.productName}</TableCell>
                  <TableCell className="text-center"><Badge variant="secondary" className="font-mono">{x.oldSize}</Badge> <span className="text-muted-foreground">→</span> <Badge className="font-mono">{x.newSize}</Badge></TableCell>
                  <TableCell className="text-center">{x.color ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{x.reason ?? "—"}</TableCell>
                  <TableCell><Badge className={statusCfg[x.status]?.cls ?? ""}>{statusCfg[x.status]?.label ?? x.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {x.status === "requested" && (
                        <>
                          <Button size="sm" variant="default" className="gap-1" disabled={busy} onClick={() => doAction(x._id, "approved", { tagsAttached: true, conditionOk: true })}><Check className="size-3.5" /> Terima</Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-500" disabled={busy} onClick={() => doAction(x._id, "rejected", { conditionOk: false })}><X className="size-3.5" /> Tolak</Button>
                        </>
                      )}
                      {x.status === "approved" && (
                        <Button size="sm" variant="outline" className="gap-1 text-emerald-600" disabled={busy} onClick={() => doAction(x._id, "completed")}><Flag className="size-3.5" /> Selesai</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground"><RefreshCcw className="size-8 mx-auto mb-2 opacity-40" />Belum ada permintaan tukar ukuran. Log untuk evaluasi: apakah banyak customer salah ukuran?</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Permintaan Size Exchange</DialogTitle>
            <DialogDescription>Cek syarat dulu: hangtag/label belum dilepas, tidak ada noda/bekas pakai (max 7–14 hari).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Pelanggan</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih pelanggan (opsional)" /></SelectTrigger>
                <SelectContent className="max-h-60">{customers.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Produk</Label>
              <Select value={form.productId} onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                <SelectContent className="max-h-60">{products.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Ukuran Lama</Label>
                <Select value={form.oldSize} onValueChange={(v) => setForm((f) => ({ ...f, oldSize: v }))}>
                  <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
                  <SelectContent>{SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ukuran Baru</Label>
                <Select value={form.newSize} onValueChange={(v) => setForm((f) => ({ ...f, newSize: v }))}>
                  <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
                  <SelectContent>{SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Warna</Label>
                <Input value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} placeholder="cth: Putih" />
              </div>
            </div>
            {form.productId && (
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs font-semibold mb-2">Stok varian produk ini:</p>
                <div className="flex flex-wrap gap-1.5">
                  {variantsOf(form.productId).map((v: any) => (
                    <Badge key={v._id} variant={v.stockQuantity > 0 ? "secondary" : "outline"} className={`text-[11px] ${v.stockQuantity === 0 ? "opacity-50" : ""}`}>{v.name}: {v.stockQuantity}</Badge>
                  ))}
                  {variantsOf(form.productId).length === 0 && <span className="text-xs text-muted-foreground">Produk tanpa varian (stok mengikuti produk induk).</span>}
                </div>
              </div>
            )}
            <div>
              <Label>Alasan / Catatan</Label>
              <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="cth: kebesaran, minta ukuran L" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button disabled={busy || !form.productId || !form.oldSize || !form.newSize || form.oldSize === form.newSize} onClick={save}><RefreshCcw className="size-4 mr-1" /> Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
