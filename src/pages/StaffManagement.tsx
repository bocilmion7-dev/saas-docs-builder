import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Shield, Edit, Trash2 } from "lucide-react";

const roleColors: Record<string, string> = {
  Owner: "bg-red-500/10 text-red-600", Manager: "bg-blue-500/10 text-blue-600",
  Supervisor: "bg-amber-500/10 text-amber-600", Kasir: "bg-emerald-500/10 text-emerald-600",
  Barista: "bg-purple-500/10 text-purple-600", Staff: "bg-orange-500/10 text-orange-600",
};

export default function StaffManagement() {
  const tenantId = useTenantId() ?? "";
  const staff = useQuery(api.staff.list, { tenantId }) ?? [];
  const createStaff = useMutation(api.staff.create);
  const updateStaff = useMutation(api.staff.update);
  const removeStaff = useMutation(api.staff.remove);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Kasir", pin: "" });

  const save = async () => {
    if (!form.name) return;
    if (editItem) {
      await updateStaff({ id: editItem._id, name: form.name, phone: form.phone, role: form.role, pin: form.pin || undefined });
    } else {
      await createStaff({ tenantId, ...form });
    }
    setDialogOpen(false); setEditItem(null); setForm({ name: "", email: "", phone: "", role: "Kasir", pin: "" });
  };

  const edit = (s: any) => {
    setForm({ name: s.name, email: s.email, phone: s.phone ?? "", role: s.role, pin: "" });
    setEditItem(s); setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Staff & Roles</h1>
          <p className="text-sm text-muted-foreground">{staff.length} staff terdaftar</p>
        </div>
        <Button onClick={() => { setForm({ name: "", email: "", phone: "", role: "Kasir", pin: "" }); setEditItem(null); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> Tambah Staff</Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s: any) => (
          <Card key={s._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">{s.name.charAt(0)}</div>
                  <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>
                </div>
                <Badge className={`text-xs capitalize ${roleColors[s.role] ?? "bg-muted"}`}>{s.role}</Badge>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                <Badge variant={s.isActive ? "default" : "secondary"} className="text-xs">{s.isActive ? "Active" : "Inactive"}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => edit(s)}><Edit className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeStaff({ id: s._id })}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {staff.length === 0 && <p className="text-sm text-muted-foreground text-center py-8 col-span-full">Belum ada staff.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editItem ? "Edit" : "Tambah"} Staff</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Nama</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} disabled={!!editItem} /></div>
            <div><Label className="text-xs">Telepon</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div>
              <Label className="text-xs">Role</Label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                {["Owner", "Manager", "Supervisor", "Kasir", "Barista", "Staff"].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><Label className="text-xs">PIN (opsional)</Label><Input type="password" placeholder="••••" value={form.pin} onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))} /></div>
            <Button onClick={save} className="w-full">{editItem ? "Update" : "Simpan"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
