import { useTenantId } from "@/hooks/use-tenant";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function FabricRemnants() {
  const tenantId = useTenantId() ?? "";
  const remnants = useQuery(api.kain.listRemnants, { tenantId }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Fabric Remnants {"<"} 0.5m</h1>
        <p className="text-sm text-muted-foreground mt-1">Sisa kain yang otomatis dibuat saat pemotongan</p>
      </div>
      <div className="space-y-3">
        {remnants.map((r: any) => (
          <Card key={r._id}><CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-mono font-bold text-sm">{r.barcode}</p>
                <p className="text-xs text-muted-foreground">{r.meterRemaining.toFixed(2)}m tersisa</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{formatRp(r.price)}</Badge>
            </div>
          </CardContent></Card>
        ))}
        {remnants.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada remnants.</p>}
      </div>
    </div>
  );
}
