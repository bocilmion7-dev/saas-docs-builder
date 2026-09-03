import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Link2, Shield, MapPin } from "lucide-react";

export default function VINLookup() {
  const tenantId = useTenantId() ?? "";
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", brand: "", model: "", yearStart: 2020, yearEnd: 2024, engineType: "", vinPattern: "" });

  const parts = useQuery(api.sparepart.listCompatibility, { tenantId, search: brandFilter || modelFilter || undefined }) ?? [];
  const crossRefs = useQuery(api.sparepart.listCrossReferences, { tenantId }) ?? [];
  const createCompat = useMutation(api.sparepart.createCompatibility);

  const filtered = parts.filter((p) => {
    const matchBrand = !brandFilter || p.brand.toLowerCase().includes(brandFilter.toLowerCase());
    const matchModel = !modelFilter || p.model.toLowerCase().includes(modelFilter.toLowerCase());
    return matchBrand && matchModel;
  });

  const save = async () => {
    if (!form.productId || !form.brand) return;
    await createCompat({ tenantId, ...form });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Part Compatibility & VIN Lookup</h1>
          <p className="text-sm text-muted-foreground mt-1">Cari part berdasarkan brand/model/tahun/engine/VIN pattern</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="size-4" /> Tambah</Button>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input placeholder="Brand (Toyota, Honda, Yamaha)" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} />
            <Input placeholder="Model (Avanza, Civic, NMAX)" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} />
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.map((p) => {
          const refs = crossRefs.filter((r) => r.productId === p.productId);
          return (
            <Card key={p._id} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{p.brand} {p.model}</h3>
                    <p className="text-sm text-muted-foreground">{p.yearStart}–{p.yearEnd} • {p.engineType}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {p.vinPattern && <Badge variant="secondary"><MapPin className="size-3 mr-0.5" />VIN: {p.vinPattern}</Badge>}
                    </div>
                  </div>
                </div>
                {refs.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2">CROSS-REFERENCE</p>
                    <div className="space-y-1.5">
                      {refs.map((cr, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 text-xs">
                          <Link2 className="size-3 text-muted-foreground" />
                          <span className="font-medium">{cr.brand}</span>
                          <span className="font-mono text-muted-foreground">OEM: {cr.oemNumber}</span>
                          <span className="font-mono text-muted-foreground">→ {cr.aftermarketNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada data kompatibilitas part.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Part Compatibility</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Product ID" value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
              <Input placeholder="Model" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Year Start" value={form.yearStart} onChange={(e) => setForm((f) => ({ ...f, yearStart: +e.target.value }))} />
              <Input type="number" placeholder="Year End" value={form.yearEnd} onChange={(e) => setForm((f) => ({ ...f, yearEnd: +e.target.value }))} />
            </div>
            <Input placeholder="Engine Type" value={form.engineType} onChange={(e) => setForm((f) => ({ ...f, engineType: e.target.value }))} />
            <Input placeholder="VIN Pattern (contoh: MHGM132Hxxxxxx)" value={form.vinPattern} onChange={(e) => setForm((f) => ({ ...f, vinPattern: e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
