import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, TrendingDown, Receipt, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["Gaji", "Listrik", "Air", "Internet", "ATK", "Kebersihan", "Sewa", "Maintenance", "Marketing", "Lainnya"];

export default function ExpensesPage() {
  const tenantId = useTenantId() ?? "";
  const expenses = useQuery(api.expenses.list, { tenantId }) ?? [];
  const createExpense = useMutation(api.expenses.create);
  const removeExpense = useMutation(api.expenses.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ description: "", amount: 0, category: "Lainnya" });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const save = async () => {
    if (!form.description || form.amount <= 0) return;
    await createExpense({ tenantId, categoryId: form.category, description: form.description, amount: form.amount, createdBy: "owner" });
    setForm({ description: "", amount: 0, category: "Lainnya" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Expenses & Petty Cash</h1><p className="text-sm text-muted-foreground">Biaya operasional, kas kecil, rekap bulanan</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Expense</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Bulan Ini</p><p className="text-lg font-bold">Rp {total.toLocaleString("id")}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Receipt className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Transaksi</p><p className="text-lg font-bold">{expenses.length}</p></div>
        </CardContent></Card>
      </div>
      <div className="space-y-2">
        {expenses.map((e) => (
          <Card key={e._id}><CardContent className="p-3 flex items-center justify-between">
            <div>
              <Badge variant="outline" className="text-xs">{e.categoryId ?? "Umum"}</Badge>
              <p className="text-sm mt-1">{e.description}</p>
              <p className="text-xs text-muted-foreground">📅 {new Date(e.date).toLocaleDateString("id")} • 👤 {e.createdBy}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-600">- Rp {e.amount.toLocaleString("id")}</span>
              <Button size="sm" variant="destructive" onClick={() => removeExpense({ id: e._id })}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {expenses.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada expense.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Tambah Expense</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <Input placeholder="Deskripsi" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <Input type="number" placeholder="Jumlah (Rp)" value={form.amount || ""} onChange={(e) => setForm((f) => ({ ...f, amount: +e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
