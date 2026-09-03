import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Edit } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function ProductsPage() {
  const tenantId = useTenantId() ?? "";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const result = useQuery(api.products.list, { tenantId });
  const items = (result && typeof result === "object" && "items" in result) ? result.items : [];
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const filtered = items.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const [form, setForm] = useState({ name: "", sku: "", price: 0, costPrice: 0, stockQuantity: 0, minStock: 10, categoryId: "", description: "", barcode: "" });

  const resetForm = () => setForm({ name: "", sku: "", price: 0, costPrice: 0, stockQuantity: 0, minStock: 10, categoryId: "", description: "", barcode: "" });

  const save = async () => {
    if (editItem) {
      await updateProduct({ id: editItem._id, ...form });
    } else {
      await createProduct({ tenantId, ...form, slug: form.name.toLowerCase().replace(/\s+/g, "-"), weightGram: 0 });
    }
    setOpen(false); setEditItem(null); resetForm();
  };

  const edit = (p: any) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, costPrice: p.costPrice, stockQuantity: p.stockQuantity, minStock: p.minStock, categoryId: p.categoryId ?? "", description: p.description ?? "", barcode: p.barcode ?? "" });
    setEditItem(p); setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Produk</h1>
          <p className="text-sm text-muted-foreground">{items.length} produk terdaftar</p>
        </div>
        <Button onClick={() => { resetForm(); setEditItem(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Tambah Produk</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari nama atau SKU..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Harga</TableHead><TableHead className="text-right">Stok</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.map((p: any) => (
            <TableRow key={p._id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">{p.sku}</TableCell>
              <TableCell className="text-right">{formatRp(p.price)}</TableCell>
              <TableCell className="text-right"><span className={p.stockQuantity <= p.minStock ? "text-destructive font-semibold" : ""}>{p.stockQuantity}</span></TableCell>
              <TableCell className="text-right space-x-1">
                <Button size="sm" variant="ghost" onClick={() => edit(p)}><Edit className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => removeProduct({ id: p._id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada produk ditemukan.</TableCell></TableRow>}
        </TableBody>
      </Table></CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit" : "Tambah"} Produk</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Nama Produk</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">SKU</Label><Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} /></div>
              <div><Label className="text-xs">Barcode</Label><Input value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Harga Jual</Label><Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value }))} /></div>
              <div><Label className="text-xs">Harga Beli</Label><Input type="number" value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: +e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Stok</Label><Input type="number" value={form.stockQuantity} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: +e.target.value }))} /></div>
              <div><Label className="text-xs">Min Stok</Label><Input type="number" value={form.minStock} onChange={(e) => setForm((f) => ({ ...f, minStock: +e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Deskripsi</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editItem ? "Update" : "Simpan"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
