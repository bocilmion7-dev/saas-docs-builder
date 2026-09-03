import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Clock } from "lucide-react";

export default function PreOrder() {
  const tenantId = "demo";
  const returns = useQuery(api.sparepart.listReturns, { tenantId }) ?? [];
  // Pre-orders could use a dedicated table, using returns list for now as a proxy
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Pre-Order Parts</h1><p className="text-sm text-muted-foreground">Deposit 50-100% • Estimasi 1-3 hari</p></div>
        <Button disabled><Plus className="mr-2 h-4 w-4" /> Pre-Order Baru (Coming Soon)</Button>
      </div>
      <Card><CardContent className="p-6 text-center text-muted-foreground"><ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Halaman Pre-Order sedang dalam pengembangan.</p><p className="text-xs mt-1">Fitur ini akan tersedia setelah integrasi supplier API.</p></CardContent></Card>
    </div>
  );
}
