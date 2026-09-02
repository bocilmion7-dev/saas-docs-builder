import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Package, Trash2, Edit } from "lucide-react";

const sampleProducts = [
  { id: "1", name: "Kopi Susu Gula Aren", sku: "CF-001", price: 28000, costPrice: 12000, stock: 120, category: "Coffee" },
  { id: "2", name: "Es Teh Manis", sku: "CF-002", price: 15000, costPrice: 5000, stock: 200, category: "Non-Coffee" },
  { id: "3", name: "Nasi Goreng Spesial", sku: "FD-001", price: 35000, costPrice: 18000, stock: 50, category: "Food" },
  { id: "4", name: "Cappuccino Hot", sku: "CF-003", price: 32000, costPrice: 14000, stock: 85, category: "Coffee" },
  { id: "5", "name": "Croissant Butter", sku: "FD-002", price: 22000, costPrice: 9000, stock: 30, category: "Food" },
  { id: "6", name: "Matcha Latte", sku: "CF-004", price: 35000, costPrice: 15000, stock: 0, category: "Non-Coffee" },
  { id: "7", name: "Chicken Katsu", sku: "FD-003", price: 42000, costPrice: 22000, stock: 45, category: "Food" },
  { id: "8", name: "Americano", sku: "CF-005", price: 25000, costPrice: 8000, stock: 150, category: "Coffee" },
];

const formatRp = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof sampleProducts[0] | null>(null);

  const filtered = sampleProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const openNew = () => { setEditItem(null); setOpen(true); };
  const openEdit = (item: typeof sampleProducts[0]) => { setEditItem(item); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Produk</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola produk dan inventaris toko</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" />
          Tambah Produk
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama produk atau SKU..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} produk</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="hidden md:table-cell">Kategori</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{p.category}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatRp(p.price)}</TableCell>
                  <TableCell className="text-right">
                    <span className={p.stock === 0 ? "text-red-500 font-medium" : p.stock < 10 ? "text-amber-500 font-medium" : ""}>
                      {p.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(p)}>
                        <Edit className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Package className="size-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Tidak ada produk ditemukan</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nama Produk</Label>
              <Input defaultValue={editItem?.name} placeholder="Contoh: Kopi Susu" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Harga Jual (Rp)</Label>
                <Input type="number" defaultValue={editItem?.price} placeholder="28000" />
              </div>
              <div className="grid gap-2">
                <Label>Harga Modal (Rp)</Label>
                <Input type="number" defaultValue={editItem?.costPrice} placeholder="12000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>SKU</Label>
                <Input defaultValue={editItem?.sku} placeholder="CF-001" />
              </div>
              <div className="grid gap-2">
                <Label>Stok</Label>
                <Input type="number" defaultValue={editItem?.stock} placeholder="0" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Barcode</Label>
              <Input placeholder="8991234567890 (opsional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => setOpen(false)}>
              {editItem ? "Simpan Perubahan" : "Tambah Produk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
