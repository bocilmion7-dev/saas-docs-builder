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
import { RotateCcw, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (t: number) => new Date(t).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

const typeCfg: Record<string, string> = {
  cacat_produksi: "Cacat produksi",
  salah_produk: "Salah produk",
  tidak_cocok: "Tidak cocok",
  lainnya: "Lainnya",
};
const statusCfg: Record<string, { label: string; cls: string }> = {
  requested: { label: "Komplain masuk", cls: "bg-amber-500/10 text-amber-600" },
  approved: { label: "Disetujui", cls: "bg-blue-500/10 text-blue-600" },
  refunded: { label: "Refund diproses", cls: "bg-emerald-500/10 text-emerald-600" },
  rejected: { label: "Ditolak", cls: "bg-red-500/10 text-red-600" },
  completed: { label: "Selesai", cls: "bg-emerald-500/10 text-emerald-600" },
};

export default function RetailReturnsPage() {
  const tenantId = useTenantId() ?? "";
  const list = useQuery(api.clothing.listRetailReturns, { tenantId }) ?? [];
  const productsRes = useQuery(api.products.list, { tenantId });
  const products = productsRes?.items ?? [];
  const customers = useQuery(api.customers.list, { tenantId }) ?? [];
  const create = useMutation(api.clothing.createRetailReturn);
  const update = useMutation(api.clothing.updateRetailReturn);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ customerId: "", productId: "", returnType: "cacat_produksi", condition: "new_with_tag", reason: "" });
  const [approve, setApprove] = useState<any>(null);
  const [refund, setRefund] = useState({ method: "transfer", amount: 0, rejectBin: false });

  const productById = (id: string) => products.find((p) => p._id === id);

  const save = async () => {
    if (!form.productId || !form.reason) return;
    setBusy(true);
    try {
      const p = productById(form.productId)!;
      await create({
        tenantId,
        customerId: form.customerId || undefined,
        productId: form.productId,
        productName: p.name,
        returnType: form.returnType,
        reason: form.reason,
        condition: form.condition,
      });
      toast.success("Komplain retur dicatat");
      setOpen(false);
      setForm({ customerId: "", productId: "", returnType: "cacat_produksi", condition: "new_with_tag", reason: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
    setBusy(false);
  };

  const doApprove = async () => {
    if (!approve) return;
    setBusy(true);
    try {
      await update({
        id: approve._id,
        status: "approved",
        refundMethod: refund.method,
        refundAmount: refund.amount,
        rejectBin: refund.rejectBin,
      });
      toast.success(refund.rejectBin ? "Disetujui — produk masuk bin reject & klaim supplier dibuat" : "Disetujui — refund diproses");
      setApprove(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Retur & Refund</h1>
          <p className="text-sm text-muted-foreground mt-1">Komplain cacat produksi / salah produk dalam garansi 7–14 hari → refund / ganti produk / klaim supplier</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><RotateCcw className="size-4" /> Catat Retur</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold">{list.length}</p><p className="text-xs text-muted-foreground">Total retur</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-amber-500">{list.filter((x) => x.status === "requested").length}</p><p className="text-xs text-muted-foreground">Menunggu review</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-red-500">{list.filter((x) => x.rejectBin).length}</p><p className="text-xs text-muted-foreground">Bin reject (klaim)</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-emerald-500">{fmtRp(list.filter((x) => x.refundAmount).reduce((s, x) => s + (x.refundAmount ?? 0), 0))}</p><p className="text-xs text-muted-foreground">Total refund</p></CardContent></Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead className="max-w-[200px]">Alasan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((x) => (
                <TableRow key={x._id}>
                  <TableCell>
                    <p className="font-medium">{x.customerName ?? "—"}</p>
                    <p className="text-[11px] text-muted-foreground">{fmtDate(x.createdAt)}</p>
                  </TableCell>
                  <TableCell className="text-sm">{x.productName}</TableCell>
                  <TableCell><Badge variant="outline">{typeCfg[x.returnType] ?? x.returnType}</Badge></TableCell>
                  <TableCell className="text-xs">{x.condition === "new_with_tag" ? "Baru + hangtag" : x.condition === "used" ? "Sudah dipakai" : "Cacat"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{x.reason}</TableCell>
                  <TableCell>
                    <Badge className={statusCfg[x.status]?.cls ?? ""}>{statusCfg[x.status]?.label ?? x.status}</Badge>
                    {x.voucherCompensation && <p className="text-[10px] mt-0.5 text-muted-foreground">Voucher: {x.voucherCompensation}</p>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {x.status === "requested" && (
                        <>
                          <Button size="sm" className="gap-1" disabled={busy} onClick={() => { setRefund({ method: "transfer", amount: productById(x.productId)?.price ?? 0, rejectBin: x.returnType === "cacat_produksi" }); setApprove(x); }}><Check className="size-3.5" /> Approve</Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-500" disabled={busy} onClick={async () => { await update({ id: x._id, status: "rejected" }); toast.success("Klaim ditolak"); }}><X className="size-3.5" /> Tolak</Button>
                        </>
                      )}
                      {x.status === "approved" && (
                        <Button size="sm" variant="outline" className="gap-1 text-emerald-600" disabled={busy} onClick={async () => { await update({ id: x._id, status: x.refundMethod ? "refunded" : "completed" }); toast.success("Status diperbarui"); }}>{x.refundMethod ? "Tandai Refunded" : "Tandai Selesai"}</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {list.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground"><Trash2 className="size-8 mx-auto mb-2 opacity-40" />Belum ada komplain retur. Catat di log retur untuk evaluasi kualitas supplier.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Retur / Refund</DialogTitle>
            <DialogDescription>Cek: cacat produksi asli? Masih dalam garansi 7–14 hari? Bandingkan dengan produk sejenis.</DialogDescription>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Jenis</Label>
                <Select value={form.returnType} onValueChange={(v) => setForm((f) => ({ ...f, returnType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(typeCfg).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kondisi Produk</Label>
                <Select value={form.condition} onValueChange={(v) => setForm((f) => ({ ...f, condition: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_with_tag">Baru + hangtag</SelectItem>
                    <SelectItem value="defective">Cacat produksi</SelectItem>
                    <SelectItem value="used">Sudah dipakai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Alasan Detail</Label>
              <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="cth: jahitan lepas di bagian lengan kiri" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button disabled={busy || !form.productId || !form.reason} onClick={save}><RotateCcw className="size-4 mr-1" /> Simpan Komplain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve dialog */}
      <Dialog open={!!approve} onOpenChange={(o) => !o && setApprove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Retur — {approve?.productName}</DialogTitle>
            <DialogDescription>Pilih penyelesaian: refund / ganti produk baru. Produk cacat → masukkan ke bin reject untuk klaim supplier.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Metode Refund</Label>
              <Select value={refund.method} onValueChange={(v) => setRefund((f) => ({ ...f, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer bank</SelectItem>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="ganti_produk">Ganti produk baru</SelectItem>
                  <SelectItem value="voucher">Voucher diskon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nominal Refund</Label>
              <Input type="number" value={refund.amount || ""} onChange={(e) => setRefund((f) => ({ ...f, amount: Number(e.target.value) }))} />
            </div>
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="mt-0.5 size-4" checked={refund.rejectBin} onChange={(e) => setRefund((f) => ({ ...f, rejectBin: e.target.checked }))} />
              <span>Produk cacat → <strong>Bin Reject</strong> & buat klaim otomatis ke supplier</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprove(null)}>Batal</Button>
            <Button disabled={busy} onClick={doApprove}><Check className="size-4 mr-1" /> Approve & Proses</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
