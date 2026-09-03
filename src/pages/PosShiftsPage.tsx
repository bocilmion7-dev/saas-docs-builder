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
import { Wallet, Clock, AlertCircle } from "lucide-react";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PosShiftsPage() {
  const tenantId = useTenantId() ?? "";
  const shifts = useQuery(api.posShifts.list, { tenantId }) ?? [];
  const current = useQuery(api.posShifts.getCurrent, { tenantId });
  const openShift = useMutation(api.posShifts.openShift);
  const closeShift = useMutation(api.posShifts.closeShift);
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [openingCash, setOpeningCash] = useState(500000);
  const [closingCash, setClosingCash] = useState(0);

  const isOpen = current && current.status === "open";

  const handleOpen = async () => {
    await openShift({ tenantId, userId: "current-user", openingCash });
    setOpenDialog(false); setOpeningCash(500000);
  };

  const handleClose = async () => {
    if (!current) return;
    await closeShift({ shiftId: current._id, closingCashActual: closingCash });
    setCloseDialog(false); setClosingCash(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Shift POS</h1>
          <p className="text-sm text-muted-foreground">Status: {isOpen ? <span className="text-green-600 font-semibold">SHIFT BUKA</span> : <span className="text-muted-foreground">Tidak ada shift aktif</span>}</p>
        </div>
        {!isOpen ? (
          <Button onClick={() => setOpenDialog(true)}><Wallet className="mr-2 h-4 w-4" /> Buka Shift</Button>
        ) : (
          <Button variant="destructive" onClick={() => setCloseDialog(true)}>Tutup Shift</Button>
        )}
      </div>

      {current && isOpen && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-600 animate-pulse" />
              <div>
                <p className="font-semibold">Shift Aktif: {current.userId}</p>
                <p className="text-xs text-muted-foreground">Buka: {new Date(current.openedAt).toLocaleString("id-ID")} • Modal: {formatRp(current.openingCash)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {shifts.map((s: any) => (
          <Card key={s._id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {s.status === "open" ? <Clock className="h-5 w-5 text-green-500" /> : <Wallet className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <p className="font-semibold">{s.userId}</p>
                  <p className="text-xs text-muted-foreground">
                    Buka: {new Date(s.openedAt).toLocaleTimeString("id-ID")}
                    {s.closedAt && ` • Tutup: ${new Date(s.closedAt).toLocaleTimeString("id-ID")}`}
                    {s.closingCashActual != null && ` • Modal: ${formatRp(s.openingCash)} → ${formatRp(s.closingCashActual)}`}
                    {s.variance != null && s.variance !== 0 && ` • Selisih: ${formatRp(s.variance)}`}
                  </p>
                </div>
              </div>
              <Badge variant={s.status === "open" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {shifts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada shift.</p>}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Buka Shift Baru</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Modal Awal (Rp)</Label><Input type="number" value={openingCash} onChange={(e) => setOpeningCash(+e.target.value)} /></div>
            <Button onClick={handleOpen} className="w-full">Buka Shift</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Tutup Shift</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {current && <p className="text-sm text-muted-foreground">Modal awal: {formatRp(current.openingCash)}</p>}
            <div><Label className="text-xs">Uang Tunai Aktual (Rp)</Label><Input type="number" value={closingCash} onChange={(e) => setClosingCash(+e.target.value)} /></div>
            {current && <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Selisih: {formatRp(closingCash - current.openingCash)}</p>}
            <Button onClick={handleClose} className="w-full">Tutup Shift</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
