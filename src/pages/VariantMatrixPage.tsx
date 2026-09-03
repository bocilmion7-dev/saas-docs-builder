import { Fragment, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenantId } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, ChevronDown, ChevronRight, Minus, Trash2, Shirt, Layers } from "lucide-react";
import { toast } from "sonner";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_CODES: Record<string, string> = { Putih: "WHT", Hitam: "BLK", Biru: "BLU", Abu: "GRY", Merah: "RED", Krem: "CRM", Coklat: "BRN", Hijau: "GRN", Pink: "PNK", Navy: "NVY" };
const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function useTenantContext() {
  const tenantId = useTenantId() ?? "";
  const { user } = useAuth();
  return { tenantId, user };
}

export default function VariantMatrixPage() {
  const { tenantId, user } = useTenantContext();
  const rows = useQuery(api.clothing.matrix, { tenantId }) ?? [];
  const createVariant = useMutation(api.clothing.createVariant);
  const adjustVariant = useMutation(api.clothing.adjustVariant);
  const removeVariant = useMutation(api.clothing.removeVariant);

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ productId: "", size: "", color: "", price: 0, stockQuantity: 0 });
  const [busy, setBusy] = useState(false);

  const productOptions = rows.filter((r) => !r.hasVariants || r.variants.length < SIZES.length);

  const save = async () => {
    if (!form.productId || !form.size || !form.color) return;
    setBusy(true);
    try {
      const product = rows.find((r) => r.productId === form.productId);
      const colorCode = COLOR_CODES[form.color] ?? form.color.slice(0, 3).toUpperCase();
      await createVariant({
        tenantId, productId: form.productId,
        size: form.size, color: form.color,
        sku: `${product?.sku ?? "SKU"}-${colorCode}-${form.size}`,
        price: form.price || product?.price || 0,
        stockQuantity: form.stockQuantity,
      });
      toast.success("Varian berhasil dibuat");
      setOpen(false);
      setForm({ productId: "", size: "", color: "", price: 0, stockQuantity: 0 });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat varian");
    }
    setBusy(false);
  };

  const quickAdjust = async (variantId: any, delta: number, reason: string) => {
    try {
      await adjustVariant({ variantId, tenantId, stockDelta: delta, reason });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyesuaikan stok");
    }
  };

  const totalVariants = rows.reduce((n, r) => n + r.variants.length, 0);
  const lowStock = rows.reduce((n, r) => n + r.variants.filter((v) => v.stockQuantity <= 2).length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Varian & SKU Matrix</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola matrix Ukuran × Warna per produk (barcode unik per SKU)</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="size-4" /> Buat Varian</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold">{rows.length}</p><p className="text-xs text-muted-foreground">Produk Aktif</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-primary">{totalVariants}</p><p className="text-xs text-muted-foreground">Total SKU (Size × Warna)</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-amber-500">{lowStock}</p><p className="text-xs text-muted-foreground">Stok Kritis (≤ 2)</p></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4"><p className="text-2xl font-extrabold text-emerald-500">{rows.reduce((n, r) => n + r.variants.filter((v) => v.stockQuantity > 2).length, 0)}</p><p className="text-xs text-muted-foreground">SKU Tersedia</p></CardContent></Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Layers className="size-4 text-primary" /> Matrix Stok per Produk</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Produk</TableHead>
                <TableHead>SKU Induk</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead className="text-right">Stok (roll-up)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <Fragment key={r.productId}>
                  <TableRow key={r.productId} className="cursor-pointer" onClick={() => setExpanded((e) => ({ ...e, [r.productId]: !e[r.productId] }))}>
                    <TableCell>{expanded[r.productId] ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</TableCell>
                    <TableCell className="font-semibold">{r.name} {!r.hasVariants && <Badge variant="outline" className="ml-2 text-[10px]">Tanpa varian</Badge>}</TableCell>
                    <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                    <TableCell>{formatRp(r.price)}</TableCell>
                    <TableCell className="text-right font-bold">{r.stockQuantity}</TableCell>
                  </TableRow>
                  {expanded[r.productId] && (
                    <TableRow key={r.productId + "-v"} className="bg-muted/30">
                      <TableCell />
                      <TableCell colSpan={4} className="p-0">
                        <div className="p-3 space-y-2">
                          {r.variants.length === 0 && <p className="text-xs text-muted-foreground">Belum ada varian. Klik "Buat Varian" untuk menambahkan matrix ukuran & warna.</p>}
                          {r.variants.map((v: any) => (
                            <div key={v._id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2">
                              <Badge variant="secondary" className="font-mono">{v.name}</Badge>
                              <span className="font-mono text-[11px] text-muted-foreground">{v.sku}</span>
                              <span className="text-xs">{formatRp(v.price)}</span>
                              <span className={`text-xs font-bold ${v.stockQuantity <= 2 ? "text-red-500" : "text-emerald-600"}`}>Stok: {v.stockQuantity}</span>
                              <div className="ml-auto flex items-center gap-1.5">
                                <Button variant="outline" size="icon" className="size-7" onClick={() => quickAdjust(v._id, -1, `Penjualan/retur ${r.name} ${v.name}`)}><Minus className="size-3.5" /></Button>
                                <Button variant="outline" size="icon" className="size-7" onClick={() => quickAdjust(v._id, 1, `Tambah stok ${r.name} ${v.name}`)}><Plus className="size-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="size-7 text-red-500 hover:text-red-600" onClick={async () => { await removeVariant({ variantId: v._id, tenantId }); toast.success("Varian dihapus"); }}><Trash2 className="size-3.5" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground"><Shirt className="size-8 mx-auto mb-2 opacity-40" />Belum ada produk. Buat produk dulu di menu Produk.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Varian Baru</DialogTitle>
            <DialogDescription>SKU unik per kombinasi Ukuran × Warna (contoh: KM-01-WHT-M)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Produk</Label>
              <Select value={form.productId} onValueChange={(v) => { const p = rows.find((r) => r.productId === v); setForm((f) => ({ ...f, productId: v, price: p?.price ?? 0 })); }}>
                <SelectTrigger><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                <SelectContent>
                  {productOptions.map((p) => <SelectItem key={p.productId} value={p.productId}>{p.name} ({p.sku})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ukuran (Size)</Label>
                <Select value={form.size} onValueChange={(v) => setForm((f) => ({ ...f, size: v }))}>
                  <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
                  <SelectContent>{SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Warna</Label>
                <Input placeholder="cth: Putih, Hitam, Navy" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Harga Jual</Label>
                <Input type="number" value={form.price || ""} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Stok Awal</Label>
                <Input type="number" value={form.stockQuantity || ""} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: Number(e.target.value) }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={busy || !form.productId || !form.size || !form.color}>
              <Plus className="size-4 mr-1" /> Simpan Varian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
