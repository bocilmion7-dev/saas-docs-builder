import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, User, Settings, AlertTriangle } from "lucide-react";

const auditLogs = [
  { id: 1, timestamp: "2026-09-02 10:15", user: "Super Admin", action: "override_status", entity: "Tenant: Kopi Senja", oldValue: "trialing", newValue: "active", ip: "103.28.xx.xx" },
  { id: 2, timestamp: "2026-09-02 09:30", user: "Super Admin", action: "update_plan", entity: "Tenant: Roti Enak", oldValue: "Free Trial", newValue: "Starter", ip: "103.28.xx.xx" },
  { id: 3, timestamp: "2026-09-01 22:00", user: "Cron Job", action: "trial_expired", entity: "Tenant: Bengkel Jaya", oldValue: "trialing", newValue: "expired", ip: "system" },
  { id: 4, timestamp: "2026-09-01 15:45", user: "Super Admin", action: "update_settings", entity: "Platform: Midtrans", oldValue: "mode=development", newValue: "mode=production", ip: "103.28.xx.xx" },
  { id: 5, timestamp: "2026-09-01 14:00", user: "Super Admin", action: "feature_toggle", entity: "Feature: thermal_print", oldValue: "is_paid=false", newValue: "is_paid=true", ip: "103.28.xx.xx" },
  { id: 6, timestamp: "2026-08-31 09:00", user: "Super Admin", action: "suspend_tenant", entity: "Tenant: Sparepart Murah", oldValue: "active", newValue: "suspended", ip: "103.28.xx.xx" },
];

const actionColors: Record<string, string> = {
  override_status: "bg-blue-500/10 text-blue-600",
  update_plan: "bg-emerald-500/10 text-emerald-600",
  trial_expired: "bg-amber-500/10 text-amber-600",
  update_settings: "bg-purple-500/10 text-purple-600",
  feature_toggle: "bg-cyan-500/10 text-cyan-600",
  suspend_tenant: "bg-red-500/10 text-red-600",
};

export default function PlatformAudit() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Platform Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Riwayat semua aksi admin platform — timestamp, user, action, old/new value</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari audit log..." className="pl-9" />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead className="hidden sm:table-cell">Old → New</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell className="text-sm font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={actionColors[log.action]}>{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.entity}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {log.oldValue} → <span className="font-medium text-foreground">{log.newValue}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
