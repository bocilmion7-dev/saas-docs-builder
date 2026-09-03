import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, AlertTriangle, User, CheckCircle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function HealthForms() {
  const tenantId = "demo";
  const forms = useQuery(api.spa.listHealthForms, { tenantId }) ?? [];
  const createForm = useMutation(api.spa.createHealthForm);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    bookingId: "", customerId: "", jantung: false, darahTinggi: false, hamil: false,
    alergi: "", tekanan: "sedang", areaFokus: "", aroma: "lavender", informedConsent: true,
  });

  const filtered = forms.filter((f: any) => !search || f.customerId.toLowerCase().includes(search.toLowerCase()));

  const hasAlert = (f: any) => f.jantung || f.darahTinggi || f.hamil || (f.alergi && f.alergi.length > 0);

  const save = async () => {
    if (!form.bookingId || !form.customerId) return;
    await createForm({
      tenantId, bookingId: form.bookingId, customerId: form.customerId,
      jantung: form.jantung, darahTinggi: form.darahTinggi, hamil: form.hamil,
      alergi: form.alergi || undefined, tekanan: form.tekanan,
      areaFokus: form.areaFokus || undefined, aroma: form.aroma,
      informedConsent: form.informedConsent,
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Forms</h1>
          <p className="text-sm text-muted-foreground">Pre-arrival wellness forms • Health screening before treatment</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tambah Form</Button>
      </div>

      <Input placeholder="Cari customer ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((form: any) => (
          <Card key={form._id} className={hasAlert(form) ? "border-amber-300" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Customer: {form.customerId}</CardTitle>
                    <p className="text-xs text-muted-foreground">Booking: {form.bookingId}</p>
                  </div>
                </div>
                {form.informedConsent && <Badge variant="outline" className="text-xs"><CheckCircle className="mr-1 h-3 w-3" /> Consent</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasAlert(form) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-amber-800">Perhatian:</p>
                    <ul className="text-amber-700 mt-1 space-y-0.5">
                      {form.jantung && <li>• Riwayat jantung</li>}
                      {form.darahTinggi && <li>• Darah tinggi</li>}
                      {form.hamil && <li>• Hamil</li>}
                      {form.alergi && <li>• Alergi: {form.alergi}</li>}
                    </ul>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Tekanan:</span> <Badge variant="outline" className="capitalize">{form.tekanan}</Badge></div>
                <div><span className="text-muted-foreground">Aroma:</span> {form.aroma}</div>
                <div><span className="text-muted-foreground">Area Fokus:</span> {form.areaFokus || "-"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        {forms.length === 0 && <p className="text-sm text-muted-foreground text-center py-8 col-span-2">Belum ada health forms.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Health Form</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Booking ID" value={form.bookingId} onChange={(e) => setForm((f) => ({ ...f, bookingId: e.target.value }))} />
            <Input placeholder="Customer ID" value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))} />
            <div className="flex gap-2 text-xs">
              <label><input type="checkbox" checked={form.jantung} onChange={(e) => setForm((f) => ({ ...f, jantung: e.target.checked }))} /> Jantung</label>
              <label><input type="checkbox" checked={form.darahTinggi} onChange={(e) => setForm((f) => ({ ...f, darahTinggi: e.target.checked }))} /> Darah Tinggi</label>
              <label><input type="checkbox" checked={form.hamil} onChange={(e) => setForm((f) => ({ ...f, hamil: e.target.checked }))} /> Hamil</label>
            </div>
            <Input placeholder="Alergi" value={form.alergi} onChange={(e) => setForm((f) => ({ ...f, alergi: e.target.value }))} />
            <div className="flex gap-2">
              {["ringan", "sedang", "kuat"].map((t) => (
                <Button key={t} size="sm" variant={form.tekanan === t ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, tekanan: t }))}>{t}</Button>
              ))}
            </div>
            <Input placeholder="Area Fokus (pisah koma)" value={form.areaFokus} onChange={(e) => setForm((f) => ({ ...f, areaFokus: e.target.value }))} />
            <Button onClick={save} className="w-full">Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
