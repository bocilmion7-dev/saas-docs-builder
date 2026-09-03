import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Loader2 } from "lucide-react";

const formatRp = (n: number) => n === 0 ? "Gratis" : "Rp " + n.toLocaleString("id-ID");

export default function PlatformPlans() {
  const plans = useQuery(api.subscriptionPlans.list);
  const createPlan = useMutation(api.subscriptionPlans.create);
  const updatePlan = useMutation(api.subscriptionPlans.update);
  const removePlan = useMutation(api.subscriptionPlans.remove);

  const [open, setOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", priceMonthly: 0, priceYearly: 0,
    trialDaysDefault: 14, maxProducts: 100, maxStaff: 3, maxTransactionsMonth: 500,
  });

  const openCreate = () => {
    setEditPlan(null);
    setForm({ name: "", slug: "", priceMonthly: 0, priceYearly: 0, trialDaysDefault: 14, maxProducts: 100, maxStaff: 3, maxTransactionsMonth: 500 });
    setOpen(true);
  };

  const openEdit = (plan: any) => {
    setEditPlan(plan);
    setForm({
      name: plan.name, slug: plan.slug, priceMonthly: plan.priceMonthly, priceYearly: plan.priceYearly,
      trialDaysDefault: plan.trialDaysDefault, maxProducts: plan.maxProducts, maxStaff: plan.maxStaff, maxTransactionsMonth: plan.maxTransactionsMonth,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editPlan) {
        await updatePlan({ id: editPlan._id, name: form.name, priceMonthly: form.priceMonthly, priceYearly: form.priceYearly, trialDaysDefault: form.trialDaysDefault, maxProducts: form.maxProducts, maxStaff: form.maxStaff, maxTransactionsMonth: form.maxTransactionsMonth });
      } else {
        await createPlan(form);
      }
      setOpen(false);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (!plans) return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola paket langganan (Free, Starter, Pro, Enterprise)</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="size-4" /> Tambah Plan</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <Card key={p._id} className={`border-border/60 ${p.slug === "pro" ? "ring-2 ring-primary" : ""}`}>
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
              <div className="flex justify-between text-muted-foreground"><span>Trial</span><span className="font-medium text-foreground">{p.trialDaysDefault} hari</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Max Produk</span><span className="font-medium text-foreground">{p.maxProducts.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Max Staff</span><span className="font-medium text-foreground">{p.maxStaff.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Max Transaksi/bln</span><span className="font-medium text-foreground">{p.maxTransactionsMonth.toLocaleString()}</span></div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}><Edit className="size-3 mr-1" /> Edit</Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => { if (confirm(`Hapus plan ${p.name}?`)) removePlan({ id: p._id }); }}>Hapus</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editPlan ? "Edit Plan" : "Tambah Plan Baru"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nama Plan</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Premium" /></div>
            {!editPlan && <div className="grid gap-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="premium" /></div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Harga/Bulan (Rp)</Label><Input type="number" value={form.priceMonthly} onChange={(e) => setForm(f => ({ ...f, priceMonthly: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Harga/Tahun (Rp)</Label><Input type="number" value={form.priceYearly} onChange={(e) => setForm(f => ({ ...f, priceYearly: Number(e.target.value) }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2"><Label>Max Produk</Label><Input type="number" value={form.maxProducts} onChange={(e) => setForm(f => ({ ...f, maxProducts: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Max Staff</Label><Input type="number" value={form.maxStaff} onChange={(e) => setForm(f => ({ ...f, maxStaff: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Max Transaksi/bln</Label><Input type="number" value={form.maxTransactionsMonth} onChange={(e) => setForm(f => ({ ...f, maxTransactionsMonth: Number(e.target.value) }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Trial Days</Label><Input type="number" value={form.trialDaysDefault} onChange={(e) => setForm(f => ({ ...f, trialDaysDefault: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : null} Simpan Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
