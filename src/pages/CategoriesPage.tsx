import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Tags, Trash2 } from "lucide-react";

const sampleCategories = [
  { id: "1", name: "Coffee", slug: "coffee", type: "menu_category", count: 5 },
  { id: "2", name: "Non-Coffee", slug: "non-coffee", type: "menu_category", count: 4 },
  { id: "3", name: "Food", slug: "food", type: "menu_category", count: 6 },
  { id: "4", name: "Minuman Dingin", slug: "minuman-dingin", type: "menu_category", count: 3 },
  { id: "5", name: "Snack", slug: "snack", type: "menu_category", count: 2 },
];

export default function CategoriesPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Kategori</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola kategori produk dan menu</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="size-4" /> Tambah Kategori
        </Button>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="hidden md:table-cell">Tipe</TableHead>
                <TableHead className="text-right">Jumlah Item</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleCategories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground font-mono text-xs">{c.slug}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{c.type}</span>
                  </TableCell>
                  <TableCell className="text-right">{c.count} item</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Kategori</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nama Kategori</Label>
              <Input placeholder="Contoh: Coffee" />
            </div>
            <div className="grid gap-2">
              <Label>Tipe</Label>
              <Input placeholder="menu_category / product_category" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => setOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
