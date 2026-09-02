import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Wallet, Clock, CheckCircle, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";

const sampleShifts = [
  { id: "1", user: "Andi Wijaya", openedAt: "07:00", closedAt: "15:00", openingCash: 500000, closingCash: 1850000, expected: 1835000, variance: 15000, status: "closed", transactions: 42 },
  { id: "2", user: "Sari Dewi", openedAt: "15:00", closedAt: null, openingCash: 500000, closingCash: null, expected: null, variance: null, status: "open", transactions: 18 },
  { id: "3", user: "Rudi Hartono", openedAt: "07:00", closedAt: "15:00", openingCash: 500000, closingCash: 2100000, expected: 2087000, variance: 13000, status: "closed", transactions: 56 },
  { id: "4", user: "Andi Wijaya", openedAt: "15:00", closedAt: "22:00", openingCash: 500000, closingCash: 1650000, expected: 1648000, variance: 2000, status: "closed", transactions: 38 },
];

const formatRp = (n: number | null) => n !== null ? "Rp " + n.toLocaleString("id-ID") : "-";

export default function PosShiftsPage() {
  const [openDialog, setOpenDialog] = useState<"open" | "close" | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Shift POS</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola shift kasir dan rekonsiliasi</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenDialog("open")} className="gap-2">
            <Wallet className="size-4" /> Buka Shift
          </Button>
          <Button variant="outline" onClick={() => setOpenDialog("close")} className="gap-2">
            <CheckCircle className="size-4" /> Tutup Shift
          </Button>
        </div>
      </div>

      {/* Active Shift */}
      {sampleShifts.find((s) => s.status === "open") && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Shift Aktif — {sampleShifts.find((s) => s.status === "open")?.user}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Mulai</p>
                <p className="text-sm font-bold">{sampleShifts.find((s) => s.status === "open")?.openedAt}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kas Awal</p>
                <p className="text-sm font-bold">{formatRp(500000)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transaksi</p>
                <p className="text-sm font-bold">18</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimasi Kas</p>
                <p className="text-sm font-bold text-emerald-600">Rp 1.280.000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shift History */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            Riwayat Shift
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kasir</TableHead>
                <TableHead className="hidden sm:table-cell">Jam</TableHead>
                <TableHead className="text-right">Kas Awal</TableHead>
                <TableHead className="text-right">Kas Akhir</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Selisih</TableHead>
                <TableHead className="text-right hidden md:table-cell">Transaksi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleShifts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.user}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {s.openedAt} - {s.closedAt ?? "sekarang"}
                  </TableCell>
                  <TableCell className="text-right text-sm">{formatRp(s.openingCash)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatRp(s.closingCash)}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {s.variance !== null ? (
                      <span className={`text-sm font-bold ${Math.abs(s.variance) > 10000 ? "text-amber-500" : "text-emerald-500"}`}>
                        {s.variance > 0 ? "+" : ""}{formatRp(s.variance)}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell text-sm">{s.transactions}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "open" ? "default" : "secondary"} className={s.status === "open" ? "bg-emerald-500/10 text-emerald-600" : ""}>
                      {s.status === "open" ? "Aktif" : "Selesai"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Open Shift Dialog */}
      <Dialog open={openDialog === "open"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Buka Shift Baru</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Kas Awal (Rp)</Label>
              <Input type="number" defaultValue="500000" placeholder="500000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Batal</Button>
            <Button onClick={() => setOpenDialog(null)} className="gap-1.5">
              <Wallet className="size-4" /> Buka Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={openDialog === "close"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tutup Shift & Rekonsiliasi</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Kas Akhir Fisik (Rp)</Label>
              <Input type="number" placeholder="Hitung uang di drawer" />
            </div>
            <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Kas Awal</span><span>{formatRp(500000)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Penjualan Tunai</span><span>{formatRp(780000)}</span></div>
              <div className="flex justify-between font-bold border-t border-border/60 pt-2"><span>Expected</span><span>{formatRp(1280000)}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Batal</Button>
            <Button onClick={() => setOpenDialog(null)} className="gap-1.5">
              <CheckCircle className="size-4" /> Tutup Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
