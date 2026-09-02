import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Edit, Trash2, CheckCircle } from "lucide-react";

const plans = [
  { id: "1", name: "Free Trial", slug: "free", priceMonthly: 0, priceYearly: 0, trialDays: 14, maxProducts: 20, maxStaff: 1, maxTransactions: 50, isActive: true },
  { id: "2", name: "Starter", slug: "starter", priceMonthly: 99000, priceYearly: 990000, trialDays: 14, maxProducts: 200, maxStaff: 5, maxTransactions: 1000, isActive: true },
  { id: "3", name: "Pro", slug: "pro", priceMonthly: 199000, priceYearly: 1990000, trialDays: 14, maxProducts: 999999, maxStaff: 15, maxTransactions: 5000, isActive: true },
  { id: "4", name: "Enterprise", slug: "enterprise", priceMonthly: 499000, priceYearly: 4990000, trialDays: 30, maxProducts: 999999, maxStaff: 999, maxTransactions: 999999, isActive: true },
];

const formatRp = (n: number) => n === 0 ? "Gratis" : "Rp " + n.toLocaleString("id-ID");

export default function PlatformPlans() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola paket langganan (Free, Starter, Pro, Enterprise)</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="size-4" /> Tambah Plan</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <Card key={p.id} className={`border-border/60 ${p.slug === "pro" ? "ring-2 ring-primary" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <Badge variant={p.isActive ? "default" : "secondary"}>{p.isActive ? "Aktif" : "Nonaktif"}</Badge>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-extrabold">{formatRp(p.priceMonthly)}</span>
                <span className="text-xs text-muted-foreground">/bulan</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Tahunan</span><span className="font-medium text-foreground">{formatRp(p.priceYearly)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Trial</span><span className="font-medium text-foreground">{p.trialDays} hari</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Max Produk</span><span className="font-medium text-foreground">{p.maxProducts.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Max Staff</span><span className="font-medium text-foreground">{p.maxStaff.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Max Transaksi/bln</span><span className="font-medium text-foreground">{p.maxTransactions.toLocaleString()}</span></div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1"><Edit className="size-3 mr-1" /> Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Plan Baru</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nama Plan</Label><Input placeholder="Contoh: Premium" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Harga/Bulan (Rp)</Label><Input type="number" /></div>
              <div className="grid gap-2"><Label>Harga/Tahun (Rp)</Label><Input type="number" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Max Produk</Label><Input type="number" /></div>
              <div className="grid gap-2"><Label>Max Staff</Label><Input type="number" /></div>
              <div className="grid gap-2"><Label>Max Transaksi</Label><Input type="number" /></div>
            </div>
            <div className="grid gap-2"><Label>Trial Days</Label><Input type="number" defaultValue={14} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => setOpen(false)}>Simpan Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
