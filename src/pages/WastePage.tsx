import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle, Plus, TrendingDown, DollarSign, Camera } from "lucide-react";

const sampleWaste = [
  { id: "1", item: "Susu Full Cream", qty: 2, unit: "liter", type: "expired", cost: 16000, date: "2026-09-02", notedBy: "Andi" },
  { id: "2", item: "Es Batu", qty: 5, unit: "kg", type: "spill", cost: 5000, date: "2026-09-02", notedBy: "Sari" },
  { id: "3", item: "Biji Kopi Roasted", qty: 0.5, unit: "kg", type: "overbrew", cost: 25000, date: "2026-09-01", notedBy: "Rudi" },
  { id: "4", item: "Croissant", qty: 8, unit: "pcs", type: "expired", cost: 72000, date: "2026-09-01", notedBy: "Andi" },
  { id: "5", item: "Sirup Vanilla", qty: 0.3, unit: "liter", type: "spill", cost: 9000, date: "2026-08-31", notedBy: "Sari" },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const typeLabels: Record<string, string> = { expired: "Kadaluarsa", spill: "Tumpah", overbrew: "Overbrew", damaged: "Rusak", other: "Lainnya" };
const typeColors: Record<string, string> = { expired: "bg-red-500/10 text-red-600", spill: "bg-amber-500/10 text-amber-600", overbrew: "bg-blue-500/10 text-blue-600", damaged: "bg-purple-500/10 text-purple-600", other: "bg-muted text-muted-foreground" };

export default function WastePage() {
  const [open, setOpen] = useState(false);
  const totalCost = sampleWaste.reduce((s, w) => s + w.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Waste Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Catat dan pantau limbah / waste toko</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="size-4" /> Catat Waste</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2.5 text-red-500"><AlertTriangle className="size-5" /></div>
            <div><p className="text-2xl font-extrabold">{sampleWaste.length}</p><p className="text-xs text-muted-foreground">Total Insiden</p></div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500"><DollarSign className="size-5" /></div>
            <div><p className="text-2xl font-extrabold">{formatRp(totalCost)}</p><p className="text-xs text-muted-foreground">Total Kerugian</p></div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500"><TrendingDown className="size-5" /></div>
            <div><p className="text-2xl font-extrabold">3.2%</p><p className="text-xs text-muted-foreground">Waste % (target &lt;5%)</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="hidden sm:table-cell">Jumlah</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Biaya</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                <TableHead className="hidden md:table-cell">Dicatat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleWaste.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.item}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{w.qty} {w.unit}</TableCell>
                  <TableCell><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[w.type]}`}>{typeLabels[w.type]}</span></TableCell>
                  <TableCell className="text-right font-medium text-red-500">-{formatRp(w.cost)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{w.date}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{w.notedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Catat Waste Baru</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Item</Label><Input placeholder="Nama item" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Jumlah</Label><Input type="number" placeholder="0" /></div>
              <div className="grid gap-2"><Label>Satuan</Label><Input placeholder="liter / kg / pcs" /></div>
              <div className="grid gap-2"><Label>Tipe</Label><Input placeholder="expired / spill / damaged" /></div>
            </div>
            <div className="grid gap-2"><Label>Catatan</Label><Input placeholder="Keterangan (opsional)" /></div>
            <div className="grid gap-2">
              <Label>Bukti Foto</Label>
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                <Camera className="size-4" /> Upload foto bukti (opsional)
              </div>
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
