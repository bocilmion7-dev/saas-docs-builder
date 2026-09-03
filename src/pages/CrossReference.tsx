import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Link2, Search } from "lucide-react";

export default function CrossReference() {
  const tenantId = "demo";
  const [search, setSearch] = useState("");
  const refs = useQuery(api.sparepart.listCrossReferences, { tenantId, search: search || undefined }) ?? [];
  const createRef = useMutation(api.sparepart.createCrossReference);
  const removeRef = useMutation(api.sparepart.removeCrossReference);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", oemNumber: "", aftermarketNumber: "", brand: "NGK", type: "oem" });

  const save = async () => { await createRef({ tenantId, ...form }); setDialogOpen(false); setForm({ productId: "", oemNumber: "", aftermarketNumber: "", brand: "NGK", type: "oem" }); };
  const typeColor = (t: string) => { const m: Record<string, string> = { original: "bg-blue-100 text-blue-800", oem: "bg-green-100 text-green-800", aftermarket: "bg-orange-100 text-orange-800", kw_super: "bg-gray-100 text-gray-800" }; return m[t] ?? ""; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Part Cross-Reference</h1><p className="text-sm text-muted-foreground">OEM / Aftermarket / KW Super — NGK, Denso, Bosch</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah</Button>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Cari nomor part..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
      <div className="space-y-3">
        {refs.map((r) => (
          <Card key={r._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3"><Link2 className="h-4 w-4 text-muted-foreground" /><div><span className="text-xs font-mono font-medium w-20">{r.brand}</span> <span className="text-xs font-mono">{r.oemNumber} → {r.aftermarketNumber}</span></div></div>
            <div className="flex items-center gap-2"><Badge className={`text-xs capitalize ${typeColor(r.type)}`}>{r.type.replace("_", " ")}</Badge><Button size="sm" variant="destructive" onClick={() => removeRef({ id: r._id })}>×</Button></div>
          </CardContent></Card>
        ))}
        {refs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada cross-reference.</p>}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Tambah Cross-Reference</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="OEM Number" value={form.oemNumber} onChange={(e) => setForm((f) => ({ ...f, oemNumber: e.target.value }))} />
            <Input placeholder="Aftermarket Number" value={form.aftermarketNumber} onChange={(e) => setForm((f) => ({ ...f, aftermarketNumber: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="border rounded-md px-3 py-2 text-sm"><option>NGK</option><option>Denso</option><option>Bosch</option><option>Akebono</option></select>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="border rounded-md px-3 py-2 text-sm"><option value="original">Original</option><option value="oem">OEM</option><option value="aftermarket">Aftermarket</option><option value="kw_super">KW Super</option></select>
            </div>
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
