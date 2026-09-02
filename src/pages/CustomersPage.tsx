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
import { Plus, Search, Users, Trash2, Award } from "lucide-react";

const sampleCustomers = [
  { id: "1", name: "Andi Wijaya", phone: "081234567890", email: "andi@mail.com", type: "regular", points: 1250, total: 1250000 },
  { id: "2", name: "Sari Dewi", phone: "085678901234", email: "sari@mail.com", type: "member", points: 3400, total: 3400000 },
  { id: "3", name: "PT Maju Jaya", phone: "0215551234", email: "order@majujaya.co.id", type: "corporate", points: 0, total: 8900000 },
  { id: "4", name: "Rina Marlina", phone: "087890123456", email: "", type: "regular", points: 560, total: 560000 },
  { id: "5", name: "Budi Santoso", phone: "081345678901", email: "budi@mail.com", type: "vip", points: 8900, total: 8900000 },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const typeColors: Record<string, string> = {
  regular: "bg-muted text-muted-foreground",
  member: "bg-blue-500/10 text-blue-600",
  corporate: "bg-purple-500/10 text-purple-600",
  vip: "bg-amber-500/10 text-amber-600",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = sampleCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pelanggan</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data pelanggan dan loyalitas</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="size-4" /> Tambah Pelanggan
        </Button>
      </div>

      <Card className="border-border/60">
        <CardContent className="pt-4">
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama atau nomor telepon..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="hidden sm:table-cell">Telepon</TableHead>
                <TableHead className="hidden md:table-cell">Tipe</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Poin</TableHead>
                <TableHead className="text-right">Total Belanja</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{c.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{c.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[c.type]}`}>
                      {c.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Award className="size-3 text-amber-500" />
                      {c.points.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">{formatRp(c.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Pelanggan</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nama</Label><Input placeholder="Nama pelanggan" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Telepon</Label><Input placeholder="08xxx" /></div>
              <div className="grid gap-2"><Label>Email</Label><Input placeholder="email (opsional)" /></div>
            </div>
            <div className="grid gap-2">
              <Label>Tipe</Label>
              <Input placeholder="regular / member / corporate / vip" />
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
