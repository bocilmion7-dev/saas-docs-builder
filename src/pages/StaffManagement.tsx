import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, Shield, Key, Smartphone, Edit, Trash2 } from "lucide-react";

const staff = [
  { id: "1", name: "Andi Wijaya", email: "andi@kopisenja.com", role: "Owner", pin: "••••", has2FA: true, isActive: true },
  { id: "2", name: "Sari Dewi", email: "sari@kopisenja.com", role: "Manager", pin: "••••", has2FA: false, isActive: true },
  { id: "3", name: "Budi Santoso", email: "budi@kopisenja.com", role: "Supervisor", pin: "••••", has2FA: false, isActive: true },
  { id: "4", name: "Rina Marlina", email: "rina@kopisenja.com", role: "Kasir", pin: "••••", has2FA: false, isActive: true },
  { id: "5", name: "Dedi Kurniawan", email: "dedi@kopisenja.com", role: "Barista", pin: "••••", has2FA: false, isActive: true },
  { id: "6", name: "Maya Putri", email: "maya@kopisenja.com", role: "Staff Dapur", pin: "—", has2FA: false, isActive: false },
];

const roleColors: Record<string, string> = {
  Owner: "bg-red-500/10 text-red-600", Manager: "bg-blue-500/10 text-blue-600",
  Supervisor: "bg-amber-500/10 text-amber-600", Kasir: "bg-emerald-500/10 text-emerald-600",
  Barista: "bg-purple-500/10 text-purple-600", "Staff Dapur": "bg-orange-500/10 text-orange-600",
};

export default function StaffManagement() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Staff & User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola staff, role, PIN login cepat, 2FA</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="size-4" /> Tambah Staff</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Staff", value: staff.length, icon: Users, color: "text-foreground" },
          { label: "Aktif", value: staff.filter((s) => s.isActive).length, icon: Shield, color: "text-emerald-500" },
          { label: "2FA Enabled", value: staff.filter((s) => s.has2FA).length, icon: Smartphone, color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60"><CardContent className="p-3 flex items-center gap-3">
            <div className={`rounded-lg bg-muted p-2 ${s.color}`}><s.icon className="size-4" /></div>
            <div><p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Staff Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">PIN</TableHead>
                <TableHead className="text-center hidden sm:table-cell">2FA</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{s.email}</TableCell>
                  <TableCell><Badge variant="secondary" className={roleColors[s.role]}>{s.role}</Badge></TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" variant="ghost" className="text-[10px] h-7 gap-1"><Key className="size-3" />{s.pin}</Button>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    {s.has2FA ? <Badge className="bg-emerald-500/10 text-emerald-600">Aktif</Badge> : <Badge variant="secondary">Off</Badge>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Aktif" : "Nonaktif"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="size-8"><Edit className="size-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Staff Baru</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nama Lengkap</Label><Input placeholder="Nama staff" /></div>
            <div className="grid gap-2"><Label>Email</Label><Input type="email" placeholder="email@toko.com" /></div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <div className="flex flex-wrap gap-2">
                {["Manager", "Supervisor", "Kasir", "Barista", "Staff Dapur", "Sales", "Gudang"].map((r) => (
                  <button key={r} className="px-3 py-1 rounded-lg text-xs font-medium border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors">{r}</button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>PIN Login Cepat (4 digit)</Label>
              <Input placeholder="1234" maxLength={4} type="password" />
              <p className="text-[10px] text-muted-foreground">Untuk login cepat di POS</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => setOpen(false)}>Tambah Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
