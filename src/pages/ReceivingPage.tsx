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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Truck, Undo2, SearchCheck, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const fmtDate = (t: number) => new Date(t).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export default function ReceivingPage() {
  const tenantId = useTenantId() ?? "";
  const receivings = useQuery(api.clothing.listReceivings, { tenantId }) ?? [];
  const rtsList = useQuery(api.clothing.listRts, { tenantId }) ?? [];
  const productsRes = useQuery(api.products.list, { tenantId });
  const products = productsRes?.items ?? [];
  const suppliers = useQuery(api.suppliers.list, { tenantId }) ?? [];
  const allVariants = useQuery(api.clothing.listVariants, { tenantId }) ?? [];
  const createReceiving = useMutation(api.clothing.receiveGoods);
  const createRts = useMutation(api.clothing.createRts);
  const updateRts = useMutation(api.clothing.updateRtsStatus);

  const [grnOpen, setGrnOpen] = useState(false);
  const [rtsOpen, setRtsOpen] = useState(false);
  const [grnForm, setGrnForm] = useState({ supplierId: "", notes: "", items: [] as { productId: string; variantId?: string; qtyOrdered: number; qtyReceived: number; qtyRejected: number; batchNumber?: string }[], productId: "", variantId: "", qtyReceived: 1 });
  const [rtsForm, setRtsForm] = useState({ supplierId: "", reason: "Selisih quantity / cacat produksi", notes: "", items: [] as { productId: string; variantId?: string; qty: number; reason: string }[], productId: "", variantId: "", qty: 1 });

  const productById = (id: string) => products.find((p) => p._id === id);
  const variantsOf = (productId: string) => allVariants.filter((v) => v.productId === productId);
  const variantName = (id?: string) => {
    if (!id) return "";
    const v = allVariants.find((x) => x._id === id);
    return v ? ` — ${v.name}` : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Penerimaan Barang & QC</h1>
          <p className="text-sm text-muted-foreground mt-1">Cek quantity & kualitas (bahan, jahitan, label, ukuran) saat barang datang dari supplier</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setRtsOpen(true)}><Undo2 className="size-4" /> RTS / Klaim Supplier</Button>
          <Button className="gap-2" onClick={() => setGrnOpen(true)}><Truck className="size-4" /> Buat GRN</Button>
        </div>
      </div>

      <Tabs defaultValue="grn">
        <TabsList>
          <TabsTrigger value="grn">Goods Received ({receivings.length})</TabsTrigger>
          <TabsTrigger value="rts">Return to Supplier ({rtsList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="grn" className="space-y-4 mt-4">
          {receivings.map((g: any) => {
            const totalOk = g.items.reduce((s: number, i: any) => s + i.qtyReceived, 0);
            const totalBad = g.items.reduce((s: number, i: any) => s + i.qtyRejected, 0);
            return (
              <Card key={g._id} className="border-border/60">
                <CardContent className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="font-mono">{g.grnNumber}</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-0"><CheckCircle2 className="size-3 mr-1" /> {g.status}</Badge>
                    <span className="text-xs text-muted-foreground">{fmtDate(g.receivedAt)}</span>
                    <span className="text-xs font-semibold ml-auto">Diterima: <span className="text-emerald-600">{totalOk} pcs</span></span>
                    {totalBad > 0 && <span className="text-xs font-semibold text-red-500">Ditolak QC: {totalBad} pcs</span>}
                  </div>
                  {g.notes && <p className="text-xs text-muted-foreground">{g.notes}</p>}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-center">Order</TableHead>
                        <TableHead className="text-center">Diterima</TableHead>
                        <TableHead className="text-center">Ditolak QC</TableHead>
                        <TableHead>Batch / Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {g.items.map((i: any) => (
                        <TableRow key={i._id}>
                          <TableCell className="font-medium">{productById(i.productId)?.name ?? "Produk"}{variantName(i.variantId)}</TableCell>
                          <TableCell className="text-center">{i.qtyOrdered}</TableCell>
                          <TableCell className="text-center font-bold text-emerald-600">{i.qtyReceived}</TableCell>
                          <TableCell className="text-center">{i.qtyRejected > 0 ? <span className="font-bold text-red-500">{i.qtyRejected}</span> : "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{i.batchNumber ?? i.notes ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
          {receivings.length === 0 && (
            <Card className="border-dashed"><CardContent className="p-10 text-center text-muted-foreground"><Truck className="size-8 mx-auto mb-2 opacity-40" /><p className="font-medium text-sm">Belum ada penerimaan barang</p><p className="text-xs">Supplier kirim barang + DO → cek quantity, QC sampling (bahan/jahitan/label/ukuran) → Terima / Tolak</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="rts" className="space-y-4 mt-4">
          {rtsList.map((r: any) => (
            <Card key={r._id} className="border-border/60">
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="font-mono">{r.rtsNumber}</Badge>
                  <Badge variant={r.status === "requested" ? "outline" : r.status === "sent" ? "secondary" : "default"}>{r.status}</Badge>
                  <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>
                  <span className="text-xs font-semibold text-red-500 ml-auto">{r.items.reduce((s: number, i: any) => s + i.qty, 0)} pcs</span>
                  {(r.status === "requested" || r.status === "approved") && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={async () => { await updateRts({ id: r._id, status: "sent" }); toast.success("RTS dikirim ke supplier"); }}><ArrowRight className="size-3.5" /> Tandai Dikirim</Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground"><strong className="text-foreground">Alasan:</strong> {r.reason}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.items.map((i: any) => (
                    <Badge key={i._id} variant="outline" className="text-[11px]">{productById(i.productId)?.name ?? "Produk"}{variantName(i.variantId)} × {i.qty}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {rtsList.length === 0 && <Card className="border-dashed"><CardContent className="p-10 text-center text-muted-foreground"><Undo2 className="size-8 mx-auto mb-2 opacity-40" /><p className="font-medium text-sm">Tidak ada RTS aktif</p><p className="text-xs">Barang ditolak (quantity kurang / ukuran salah / cacat jahitan) → catat selisih → RTS / klaim supplier</p></CardContent></Card>}
        </TabsContent>
      </Tabs>

      {/* GRN Dialog */}
      <Dialog open={grnOpen} onOpenChange={setGrnOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terima Barang (GRN + QC)</DialogTitle>
            <DialogDescription>Tambah item yang diterima. QC dilakukan per item — qty ditolak tidak masuk stok.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Supplier</Label>
                <Select value={grnForm.supplierId} onValueChange={(v) => setGrnForm((f) => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Catatan</Label>
                <Input value={grnForm.notes} onChange={(e) => setGrnForm((f) => ({ ...f, notes: e.target.value }))} placeholder="No. DO / Faktur" />
              </div>
            </div>

            <div className="rounded-lg border border-border/60 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tambah Item (QC per item)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Select value={grnForm.productId} onValueChange={(v) => setGrnForm((f) => ({ ...f, productId: v, variantId: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Produk" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {products.map((p) => <SelectItem key={p._id} value={p._id}>{p.name} ({p.sku})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={grnForm.variantId} onValueChange={(v) => setGrnForm((f) => ({ ...f, variantId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Varian (jika ada)" /></SelectTrigger>
                  <SelectContent>{grnForm.productId ? variantsOf(grnForm.productId).map((v) => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>) : <SelectItem value="none" disabled>Pilih produk dulu</SelectItem>}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-[11px]">Qty Diterima</Label>
                  <Input type="number" value={grnForm.qtyReceived || ""} onChange={(e) => setGrnForm((f) => ({ ...f, qtyReceived: Number(e.target.value) }))} />
                </div>
                <Button size="sm" className="gap-1" onClick={() => {
                  if (!grnForm.productId || grnForm.qtyReceived <= 0) return;
                  setGrnForm((f) => ({
                    ...f,
                    items: [...f.items, { productId: f.productId, variantId: f.variantId || undefined, qtyOrdered: f.qtyReceived, qtyReceived: f.qtyReceived, qtyRejected: 0 }],
                    productId: "", variantId: "", qtyReceived: 1,
                  }));
                }}><Plus className="size-3.5" /> Tambah</Button>
              </div>
            </div>

            {grnForm.items.length > 0 && (
              <div className="space-y-1.5">
                {grnForm.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                    <span className="font-medium truncate">{productById(it.productId)?.name}{variantName(it.variantId)}</span>
                    <span className="ml-auto text-xs text-emerald-600">×{it.qtyReceived}</span>
                    <Button variant="ghost" size="icon" className="size-6 text-red-500" onClick={() => setGrnForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}><XCircle className="size-4" /></Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-muted-foreground flex items-center gap-1"><SearchCheck className="size-3.5" /> QC: cek quantity karton, total pcs per size & warna (sesuai PO), sampling 5% ukuran panjang/lebar, bahan/jahitan/label.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrnOpen(false)}>Batal</Button>
            <Button disabled={grnForm.items.length === 0} onClick={async () => {
              if (grnForm.items.length === 0) return;
              try {
                await createReceiving({
                  tenantId,
                  grnNumber: `GRN-${String(receivings.length + 1).padStart(3, "0")}`,
                  supplierId: grnForm.supplierId,
                  notes: grnForm.notes,
                  items: grnForm.items,
                });
                toast.success("Barang diterima — stok masuk otomatis");
                setGrnOpen(false);
                setGrnForm({ supplierId: "", notes: "", items: [], productId: "", variantId: "", qtyReceived: 1 });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Gagal simpan GRN");
              }
            }}><CheckCircle2 className="size-4 mr-1" /> Simpan Penerimaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RTS Dialog */}
      <Dialog open={rtsOpen} onOpenChange={setRtsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Return to Supplier / Klaim</DialogTitle>
            <DialogDescription>Catat selisih quantity, ukuran salah, atau cacat jahitan untuk dikembalikan ke supplier</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Supplier</Label>
                <Select value={rtsForm.supplierId} onValueChange={(v) => setRtsForm((f) => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Alasan</Label>
                <Select value={rtsForm.reason} onValueChange={(v) => setRtsForm((f) => ({ ...f, reason: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Selisih quantity", "Ukuran salah", "Cacat jahitan", "Warna luntur", "Bahan tidak sesuai sample"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item RTS</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select value={rtsForm.productId} onValueChange={(v) => setRtsForm((f) => ({ ...f, productId: v, variantId: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Produk" /></SelectTrigger>
                  <SelectContent className="max-h-60">{products.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={rtsForm.variantId} onValueChange={(v) => setRtsForm((f) => ({ ...f, variantId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Varian" /></SelectTrigger>
                  <SelectContent>{rtsForm.productId ? variantsOf(rtsForm.productId).map((v) => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>) : <SelectItem value="none" disabled>Pilih produk dulu</SelectItem>}</SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Qty" value={rtsForm.qty || ""} onChange={(e) => setRtsForm((f) => ({ ...f, qty: Number(e.target.value) }))} />
                  <Button size="icon" className="shrink-0" onClick={() => {
                    if (!rtsForm.productId || rtsForm.qty <= 0) return;
                    setRtsForm((f) => ({ ...f, items: [...f.items, { productId: f.productId, variantId: f.variantId || undefined, qty: f.qty, reason: f.reason }], productId: "", variantId: "", qty: 1 }));
                  }}><Plus className="size-4" /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rtsForm.items.map((it, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">
                    {productById(it.productId)?.name}{variantName(it.variantId)} × {it.qty}
                    <button className="text-red-400 hover:text-red-600" onClick={() => setRtsForm((f) => ({ ...f, items: f.items.filter((_, x) => x !== i) }))}>✕</button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRtsOpen(false)}>Batal</Button>
            <Button disabled={!rtsForm.supplierId || rtsForm.items.length === 0} onClick={async () => {
              try {
                await createRts({
                  tenantId, supplierId: rtsForm.supplierId, reason: rtsForm.reason,
                  rtsNumber: `RTS-${String(rtsList.length + 1).padStart(3, "0")}`,
                  items: rtsForm.items,
                });
                toast.success("Klaim RTS dicatat");
                setRtsOpen(false);
                setRtsForm({ supplierId: "", reason: "Selisih quantity / cacat produksi", notes: "", items: [], productId: "", variantId: "", qty: 1 });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Gagal");
              }
            }}>Simpan RTS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
