import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, Star, Search } from "lucide-react";

export default function CustomersPage() {
  const tenantId = "demo";
  const customers = useQuery(api.customers.list, { tenantId }) ?? [];
  const createCustomer = useMutation(api.customers.create);
  const updateCustomer = useMutation(api.customers.update);
  const removeCustomer = useMutation(api.customers.remove);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", type: "regular" });

  const types = ["regular", "member", "kontraktor", "konveksi", "corporate", "vip"];
  const filtered = customers.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone ?? "").includes(search));

  const openNew = () => { setEditing(null); setForm({ name: "", phone: "", email: "", address: "", type: "regular" }); setDialogOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, phone: c.phone ?? "", email: c.email ?? "", address: c.address ?? "", type: c.type }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name) return;
    if (editing) { await updateCustomer({ id: editing._id, ...form }); }
    else { await createCustomer({ tenantId, ...form }); }
    setDialogOpen(false);
  };

  const typeColor = (t: string) => {
    const m: Record<string, string> = { regular: "bg-gray-100 text-gray-800", member: "bg-blue-100 text-blue-800", kontraktor: "bg-purple-100 text-purple-800", konveksi: "bg-pink-100 text-pink-800", corporate: "bg-amber-100 text-amber-800", vip: "bg-green-100 text-green-800" };
    return m[t] ?? "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Pelanggan</h1><p className="text-sm text-muted-foreground">{customers.length} pelanggan terdaftar</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Tambah</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari nama/telepon..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
      <div className="space-y-2">
        {filtered.map((c) => (
          <Card key={c._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.phone} • {c.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {c.loyaltyPoints > 0 && <span className="flex items-center gap-1 text-xs text-amber-600"><Star className="h-3 w-3" />{c.loyaltyPoints}</span>}
              <Badge className={`text-xs capitalize ${typeColor(c.type)}`}>{c.type}</Badge>
              <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Edit className="h-3 w-3" /></Button>
              <Button size="sm" variant="destructive" onClick={() => removeCustomer({ id: c._id })}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </CardContent></Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada pelanggan.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Pelanggan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Nama</label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-medium">Telepon</label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div><div><label className="text-xs font-medium">Email</label><Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div></div>
            <div><label className="text-xs font-medium">Alamat</label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
            <div><label className="text-xs font-medium">Tipe</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">{types.map((t) => <option key={t}>{t}</option>)}</select></div>
            <Button onClick={save} className="w-full">{editing ? "Simpan" : "Tambah"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
