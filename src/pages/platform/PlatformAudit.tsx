import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";

const actionColors: Record<string, string> = {
  override_status: "bg-blue-500/10 text-blue-600",
  update_plan: "bg-emerald-500/10 text-emerald-600",
  trial_expired: "bg-amber-500/10 text-amber-600",
  update_settings: "bg-purple-500/10 text-purple-600",
  feature_toggle: "bg-cyan-500/10 text-cyan-600",
  suspend_tenant: "bg-red-500/10 text-red-600",
  create: "bg-emerald-500/10 text-emerald-600",
  update: "bg-blue-500/10 text-blue-600",
  delete: "bg-red-500/10 text-red-600",
  login: "bg-muted text-muted-foreground",
};

export default function PlatformAudit() {
  const [search, setSearch] = useState("");
  const logs = useQuery(api.auditLogs.list, { limit: 200 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Platform Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Riwayat semua aksi admin platform</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari audit log..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {(!logs || logs.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {logs === undefined ? "Memuat..." : "Belum ada audit log"}
                </TableCell></TableRow>
              )}
              {logs?.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.userId ?? "System"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={actionColors[log.action] ?? "bg-muted text-muted-foreground"}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.entityType}{log.entityId ? `: ${log.entityId}` : ""}</TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {log.oldValue ? JSON.stringify(log.oldValue) : "—"} →{" "}
                    <span className="font-medium text-foreground">{log.newValue ? JSON.stringify(log.newValue) : "—"}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">{log.ipAddress ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
