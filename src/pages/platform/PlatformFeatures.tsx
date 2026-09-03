import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Loader2, Lock, Unlock } from "lucide-react";

const moduleColors: Record<string, string> = {
  pos: "bg-blue-500/10 text-blue-600", catalog: "bg-emerald-500/10 text-emerald-600",
  inventory: "bg-amber-500/10 text-amber-600", report: "bg-purple-500/10 text-purple-600",
  marketing: "bg-pink-500/10 text-pink-600", integration: "bg-cyan-500/10 text-cyan-600",
  cafe_specific: "bg-orange-500/10 text-orange-600", spa_specific: "bg-violet-500/10 text-violet-600",
  bakery_specific: "bg-rose-500/10 text-rose-600", bengkel_specific: "bg-slate-500/10 text-slate-600",
  sparepart_specific: "bg-sky-500/10 text-sky-600", kain_specific: "bg-yellow-500/10 text-yellow-600",
  cat_specific: "bg-green-500/10 text-green-600", platform: "bg-red-500/10 text-red-600",
};

export default function PlatformFeatures() {
  const features = useQuery(api.featureFlags.list);
  const toggleFlag = useMutation(api.featureFlags.toggle);
  const createFlag = useMutation(api.featureFlags.create);
  const removeFlag = useMutation(api.featureFlags.remove);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ key: "", name: "", description: "", categoryModule: "platform", isPaidDefault: true, isTrialAccessible: false });

  if (!features) return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat...</div>;

  const filtered = features.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.key.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || f.categoryModule === filter;
    return matchSearch && matchFilter;
  });

  const modules = [...new Set(features.map((f) => f.categoryModule))];

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createFlag(form);
      setOpen(false);
      setForm({ key: "", name: "", description: "", categoryModule: "platform", isPaidDefault: true, isTrialAccessible: false });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Feature Flags</h1>
          <p className="text-sm text-muted-foreground mt-1">Toggle 50+ fitur: is_paid_default & is_trial_accessible</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" /> Paid
            <Unlock className="size-3 ml-2" /> Trial
          </div>
          <Button onClick={() => setOpen(true)} size="sm" className="gap-1"><Plus className="size-3" /> Tambah</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari fitur..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("all")} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Semua ({features.length})</button>
          {modules.slice(0, 8).map((m) => (
            <button key={m} onClick={() => setFilter(m)} className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${filter === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{m}</button>
          ))}
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fitur</TableHead>
                <TableHead className="hidden sm:table-cell">Key</TableHead>
                <TableHead className="hidden md:table-cell">Module</TableHead>
                <TableHead className="text-center">Paid Default</TableHead>
                <TableHead className="text-center">Trial Accessible</TableHead>
                <TableHead className="text-center">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada feature flags</TableCell></TableRow>
              )}
              {filtered.map((f) => (
                <TableRow key={f._id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs font-mono text-muted-foreground">{f.key}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className={moduleColors[f.categoryModule] ?? "bg-muted text-muted-foreground"}>{f.categoryModule}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={f.isPaidDefault} onCheckedChange={(v) => toggleFlag({ id: f._id, isActive: f.isActive })} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={f.isTrialAccessible} onCheckedChange={() => {}} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={f.isActive} onCheckedChange={(v) => toggleFlag({ id: f._id, isActive: v })} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Feature Flag</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Key</Label><Input value={form.key} onChange={(e) => setForm(f => ({ ...f, key: e.target.value }))} placeholder="thermal_print" /></div>
            <div className="grid gap-2"><Label>Nama</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Thermal Print" /></div>
            <div className="grid gap-2"><Label>Deskripsi</Label><Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Module</Label><Input value={form.categoryModule} onChange={(e) => setForm(f => ({ ...f, categoryModule: e.target.value }))} placeholder="pos / cafe_specific / spa_specific" /></div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.isPaidDefault} onCheckedChange={(v) => setForm(f => ({ ...f, isPaidDefault: v }))} /><Label className="text-sm">Paid Default</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.isTrialAccessible} onCheckedChange={(v) => setForm(f => ({ ...f, isTrialAccessible: v }))} /><Label className="text-sm">Trial Accessible</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={saving || !form.key || !form.name}>
              {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : null} Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
