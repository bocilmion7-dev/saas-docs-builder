import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";

export default function CustomerReturns() {
  const tenantId = "demo";
  const returns = useQuery(api.sparepart.listReturns, { tenantId }) ?? [];
  const updateStatus = useMutation(api.sparepart.updateReturnStatus);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Customer Returns</h1><p className="text-sm text-muted-foreground">Max 3 hari • Kemasan utuh • Belum terpasang</p></div>
      <div className="space-y-3">
        {returns.map((r) => (
          <Card key={r._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3"><RotateCcw className="h-4 w-4" /><div><p className="font-semibold">{r.productId}</p><p className="text-xs text-muted-foreground">Order: {r.orderId} • Alasan: {r.reason}</p>
              <div className="flex gap-1 mt-1"><Badge variant={r.withinThreeDays ? "outline" : "destructive"} className="text-xs">{r.withinThreeDays ? "≤3 hari ✓" : ">3 hari"}</Badge><Badge variant="outline" className="text-xs capitalize">{r.condition.replace("_", " ")}</Badge></div></div></div>
            <div className="flex items-center gap-2"><Badge variant={r.status === "approved" ? "default" : "destructive"}>{r.status}</Badge>
              {r.status === "pending" && <><Button size="sm" onClick={() => updateStatus({ id: r._id, status: "approved" })}>✓</Button><Button size="sm" variant="destructive" onClick={() => updateStatus({ id: r._id, status: "rejected" })}>✗</Button></>}
            </div>
          </CardContent></Card>
        ))}
        {returns.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada return.</p>}
      </div>
    </div>
  );
}
