import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function SuppliersPage() {
  const tenantId = useTenantId() ?? ""; // In production, derive from auth/tenant context
  const suppliers = useQuery(api.suppliers.list, { tenantId }) ?? [];
  const createSupplier = useMutation(api.suppliers.create);
  const updateSupplier = useMutation(api.suppliers.update);
  const removeSupplier = useMutation(api.suppliers.remove);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", contactName: "", phone: "", email: "", address: "", type: "lainnya" });

  const types = ["cat", "thinner", "tools", "bahan_baku", "tekstil", "sparepart", "oli", "bakery_supply", "roastery", "susu", "premium_spa", "kemasan", "lainnya"];
  const filtered = suppliers.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm({ name: "", contactName: "", phone: "", email: "", address: "", type: "lainnya" }); setDialogOpen(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ name: s.name, contactName: s.contactName ?? "", phone: s.phone ?? "", email: s.email ?? "", address: s.address ?? "", type: s.type }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name) return;
    if (editing) { await updateSupplier({ id: editing._id, ...form }); }
    else { await createSupplier({ tenantId, ...form }); }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Suppliers</h1><p className="text-sm text-muted-foreground">Kelola supplier/vendor</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Tambah Supplier</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
      <div className="space-y-2">
        {filtered.map((s) => (
          <Card key={s._id}><CardContent className="p-3 flex items-center justify-between">
            <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.contactName} • {s.phone} • {s.email}</p></div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">{s.type}</Badge>
              <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Edit className="h-3 w-3" /></Button>
              <Button size="sm" variant="destructive" onClick={() => removeSupplier({ id: s._id })}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada supplier. Klik "Tambah Supplier" untuk menambah.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Supplier</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Nama</label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-xs font-medium">Kontak</label><Input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-medium">Telepon</label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div><div><label className="text-xs font-medium">Email</label><Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div></div>
            <div><label className="text-xs font-medium">Tipe</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">{types.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <Button onClick={save} className="w-full">{editing ? "Simpan" : "Tambah"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
