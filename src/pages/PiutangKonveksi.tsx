import { useTenantId } from "@/hooks/use-tenant";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertTriangle } from "lucide-react";

export default function PiutangKonveksi() {
  const tenantId = useTenantId() ?? "";
  const piutangs = useQuery(api.kain.listPiutang, { tenantId }) ?? [];
  const updateStatus = useMutation(api.kain.updatePiutangStatus);

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      belum_lunas: "bg-red-100 text-red-800",
      sebagian: "bg-yellow-100 text-yellow-800",
      lunas: "bg-green-100 text-green-800",
    };
    return m[s] ?? "";
  };

  const totalOutstanding = piutangs
    .filter((p) => p.status !== "lunas")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueCount = piutangs.filter((p) => p.status !== "lunas" && p.dueDate < Date.now()).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Piutang Konveksi</h1>
          <p className="text-sm text-muted-foreground">Total outstanding: Rp{totalOutstanding.toLocaleString()} • {overdueCount} overdue</p>
        </div>
      </div>
      <div className="space-y-3">
        {piutangs.map((p) => {
          const isOverdue = p.status !== "lunas" && p.dueDate < Date.now();
          return (
            <Card key={p._id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Customer: {p.customerId}</p>
                    <p className="text-xs text-muted-foreground">
                      Rp{p.amount.toLocaleString()} • Due: {new Date(p.dueDate).toLocaleDateString("id-ID")}
                      {p.freezeNextOrder && " • 🔒 Frozen"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOverdue && <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" /> Overdue</Badge>}
                  <Badge className={`text-xs capitalize ${statusColor(p.status)}`}>{p.status.replace("_", " ")}</Badge>
                  {p.status === "belum_lunas" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus({ id: p._id, status: "lunas" })}>Bayar</Button>
                  )}
                  {p.status === "belum_lunas" && isOverdue && !p.freezeNextOrder && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus({ id: p._id, status: "belum_lunas", freezeNextOrder: true })}>Freeze</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {piutangs.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Tidak ada piutang.</p>}
      </div>
    </div>
  );
}
