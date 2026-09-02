import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Truck, Trash2, Phone, Mail } from "lucide-react";

const sampleSuppliers = [
  { id: "1", name: "Roastery Kopi ABC", contact: "Pak Budi", phone: "081234567890", email: "budi@roastery.co.id", type: "bahan_baku" },
  { id: "2", name: "Dairy Susu Segar", contact: "Ibu Sari", phone: "085678901234", email: "sari@dairy.co.id", type: "susu" },
  { id: "3", name: "Toko Packaging", contact: "Pak Dedi", phone: "087890123456", email: "", type: "kemasan" },
  { id: "4", name: "Supplier Gula Aren", contact: "Pak Rudi", phone: "081345678901", email: "rudi@gula.co.id", type: "bahan_baku" },
  { id: "5", name: "Premium Syrup Co", contact: "Ibu Maya", phone: "085612345678", email: "maya@syrup.co.id", type: "bahan_baku" },
];

const typeLabels: Record<string, string> = {
  bahan_baku: "Bahan Baku",
  susu: "Susu & Dairy",
  kemasan: "Packaging",
  lainnya: "Lainnya",
};

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = sampleSuppliers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Supplier</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data supplier dan vendor</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="size-4" /> Tambah Supplier
        </Button>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari supplier..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead className="hidden sm:table-cell">Kontak</TableHead>
                <TableHead className="hidden md:table-cell">Tipe</TableHead>
                <TableHead className="hidden md:table-cell">Telepon</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{s.contact}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{s.contact}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{typeLabels[s.type] ?? s.type}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.phone}</TableCell>
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Supplier</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nama Supplier</Label><Input placeholder="Nama perusahaan" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Kontak Person</Label><Input placeholder="Nama PIC" /></div>
              <div className="grid gap-2"><Label>Telepon</Label><Input placeholder="08xxx" /></div>
            </div>
            <div className="grid gap-2"><Label>Email</Label><Input placeholder="email (opsional)" /></div>
            <div className="grid gap-2"><Label>Tipe</Label><Input placeholder="bahan_baku / susu / kemasan" /></div>
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
