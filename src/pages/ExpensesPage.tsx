import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, Plus, Receipt, TrendingDown } from "lucide-react";

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  receiptUrl?: string;
}

const EXPENSE_CATEGORIES = ["Gaji", "Listrik", "Air", "Internet", "ATK", "Kebersihan", "Sewa", "Maintenance", "Marketing", "Lainnya"];

const MOCK_EXPENSES: Expense[] = [
  { id: "1", category: "Listrik", description: "Tagihan listrik bulan Agustus", amount: 2500000, date: "2026-09-01", paidBy: "Owner" },
  { id: "2", category: "Gaji", description: "Gaji karyawan bulan Agustus", amount: 15000000, date: "2026-09-01", paidBy: "Owner" },
  { id: "3", category: "Internet", description: "IndiHome fiber 50Mbps", amount: 450000, date: "2026-09-01", paidBy: "Owner" },
  { id: "4", category: "Kebersihan", description: "Sabun, sapu, pel", amount: 150000, date: "2026-09-02", paidBy: "Kasir" },
  { id: "5", category: "ATK", description: "Printer thermal paper roll x5", amount: 75000, date: "2026-09-03", paidBy: "Kasir" },
];

export default function ExpensesPage() {
  const [expenses] = useState(MOCK_EXPENSES);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ category: "Lainnya", description: "", amount: 0 });

  const filtered = expenses.filter(e => !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()));

  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses & Petty Cash</h1>
          <p className="text-sm text-muted-foreground">Biaya operasional, kas kecil, rekap bulanan</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Expense</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Bulan Ini</p>
                <p className="text-lg font-bold">Rp {totalThisMonth.toLocaleString("id")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Transaksi</p>
                <p className="text-lg font-bold">{expenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Input placeholder="Cari expense..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="space-y-2">
        {filtered.map(exp => (
          <Card key={exp.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{exp.category}</Badge>
                    <span className="text-sm">{exp.description}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">📅 {exp.date} • 👤 {exp.paidBy}</p>
                </div>
                <span className="text-sm font-bold text-red-600">- Rp {exp.amount.toLocaleString("id")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Tambah Expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Kategori</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm mt-1">
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Input placeholder="Deskripsi" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input type="number" placeholder="Jumlah (Rp)" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} />
            <Button className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
