import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FlaskConical, Plus, Calculator, AlertTriangle, Edit, Trash2 } from "lucide-react";

const recipes = [
  { id: "1", name: "Kopi Susu Gula Aren", category: "Coffee", costPrice: 12000, sellPrice: 28000, margin: 57, ingredients: [
    { name: "Biji Kopi Arabica", qty: "18", unit: "gr", cost: 5400 },
    { name: "Susu Full Cream", qty: "200", unit: "ml", cost: 4000 },
    { name: "Gula Aren", qty: "20", unit: "ml", cost: 2000 },
    { name: "Es Batu", qty: "100", unit: "gr", cost: 500 },
  ]},
  { id: "2", name: "Cappuccino Hot", category: "Coffee", costPrice: 14000, sellPrice: 32000, margin: 56, ingredients: [
    { name: "Biji Kopi Arabica", qty: "24", unit: "gr", cost: 7200 },
    { name: "Susu Full Cream", qty: "180", unit: "ml", cost: 3600 },
    { name: "Gula Aren", qty: "15", unit: "ml", cost: 1500 },
    { name: "Es Batu", qty: "0", unit: "gr", cost: 0 },
  ]},
  { id: "3", name: "Matcha Latte", category: "Non-Coffee", costPrice: 15000, sellPrice: 35000, margin: 57, ingredients: [
    { name: "Matcha Powder", qty: "10", unit: "gr", cost: 5000 },
    { name: "Oat Milk", qty: "200", unit: "ml", cost: 6000 },
    { name: "Gula Aren", qty: "20", unit: "ml", cost: 2000 },
    { name: "Es Batu", qty: "100", unit: "gr", cost: 500 },
  ]},
  { id: "4", name: "Es Teh Manis", category: "Non-Coffee", costPrice: 5000, sellPrice: 15000, margin: 67, ingredients: [
    { name: "Teh Celup", qty: "1", unit: "pcs", cost: 500 },
    { name: "Gula Pasir", qty: "30", unit: "gr", cost: 1500 },
    { name: "Es Batu", qty: "150", unit: "gr", cost: 750 },
  ]},
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function BOMRecipe() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">BOM / Recipe</h1>
          <p className="text-sm text-muted-foreground mt-1">Resep menu dengan bahan baku & hitung COGS otomatis</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="size-4" /> Resep Baru</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/60"><CardContent className="p-3 text-center">
          <p className="text-2xl font-extrabold">{recipes.length}</p><p className="text-xs text-muted-foreground">Total Resep</p>
        </CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-3 text-center">
          <p className="text-2xl font-extrabold text-emerald-500">59%</p><p className="text-xs text-muted-foreground">Rata-rata Margin</p>
        </CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-3 text-center">
          <p className="text-2xl font-extrabold text-primary">&lt;35%</p><p className="text-xs text-muted-foreground">Target Food Cost</p>
        </CardContent></Card>
      </div>

      {/* Recipes */}
      <div className="space-y-4">
        {recipes.map((r) => (
          <Card key={r.id} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="size-4 text-primary" />{r.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{r.category}</Badge>
                  <Badge className={r.margin >= 50 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                    Margin {r.margin}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bahan Baku</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {r.ingredients.map((ing, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{ing.name}</TableCell>
                      <TableCell className="text-right text-sm">{ing.qty} {ing.unit}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatRp(ing.cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                <div className="text-sm">
                  <span className="text-muted-foreground">COGS: </span>
                  <span className="font-bold">{formatRp(r.costPrice)}</span>
                  <span className="text-muted-foreground ml-3">Harga Jual: </span>
                  <span className="font-bold text-primary">{formatRp(r.sellPrice)}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="text-[10px] h-7"><Edit className="size-3 mr-1" /> Edit</Button>
                  <Button size="sm" variant="ghost" className="text-[10px] h-7 text-destructive"><Trash2 className="size-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Recipe Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Resep Baru</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nama Menu</Label><Input placeholder="Contoh: Kopi Susu" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Harga Jual (Rp)</Label><Input type="number" /></div>
              <div className="grid gap-2"><Label>Kategori</Label><Input placeholder="Coffee / Non-Coffee" /></div>
            </div>
            <div className="border-t border-border/60 pt-4">
              <p className="text-sm font-bold mb-2">Bahan Baku:</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input placeholder="Nama bahan" className="flex-1" />
                  <Input placeholder="Qty" className="w-20" />
                  <Input placeholder="Satuan" className="w-20" />
                </div>
                <Button variant="outline" size="sm" className="w-full"><Plus className="size-3 mr-1" /> Tambah Bahan</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => setOpen(false)}>Simpan Resep</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
