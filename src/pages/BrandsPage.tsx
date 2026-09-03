import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";

export default function BrandsPage() {
  const tenantId = useTenantId() ?? "";
  const brands = useQuery(api.brands.list, { tenantId }) ?? [];
  const createBrand = useMutation(api.brands.create);
  const updateBrand = useMutation(api.brands.update);
  const removeBrand = useMutation(api.brands.remove);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState("");

  const filtered = brands.filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setName(""); setDialogOpen(true); };
  const openEdit = (b: any) => { setEditing(b); setName(b.name); setDialogOpen(true); };

  const save = async () => {
    if (!name) return;
    if (editing) { await updateBrand({ id: editing._id, name }); }
    else { await createBrand({ tenantId, name }); }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Brands</h1><p className="text-sm text-muted-foreground">Kelola merek/brand produk</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Tambah Brand</Button>
      </div>
      <Input placeholder="Cari brand..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((b) => (
          <Card key={b._id}><CardContent className="p-4 text-center relative group">
            <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="font-semibold">{b.name}</p>
            <div className="flex gap-1 justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="outline" onClick={() => openEdit(b)}><Edit className="h-3 w-3" /></Button>
              <Button size="sm" variant="destructive" onClick={() => removeBrand({ id: b._id })}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada brand.</p>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Brand</DialogTitle></DialogHeader>
          <div className="space-y-3"><Input placeholder="Nama brand" value={name} onChange={(e) => setName(e.target.value)} /><Button onClick={save} className="w-full">Simpan</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
