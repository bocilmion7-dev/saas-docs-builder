import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ScanBarcode, Monitor, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HardwareSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Hardware Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Test & konfigurasi perangkat keras — Printer, Barcode Scanner, Display</p>
      </div>

      {/* Thermal Printer */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><Printer className="size-4 text-muted-foreground" /><CardTitle className="text-base">Thermal Printer (ESC/POS)</CardTitle></div>
          <CardDescription>Cetak struk 58mm / 80mm via WebUSB atau window.print fallback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-500"><CheckCircle className="size-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Printer Status</p>
              <p className="text-xs text-muted-foreground">Menggunakan window.print fallback (ESC/POS via WebUSB)</p>
            </div>
            <Button size="sm" className="gap-1.5">Test Print</Button>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Preview Struk 80mm:</p>
            <div className="inline-block text-left bg-white text-black p-4 rounded border font-mono text-[10px] leading-4 w-[300px]">
              <p className="text-center font-bold text-xs">KOPI SENJA</p>
              <p className="text-center">Jl. Sudirman No. 123</p>
              <p className="text-center">Telp: 081234567890</p>
              <p className="border-t border-dashed border-black mt-2 pt-1">═══════════════════════</p>
              <p>No: ORD-001 | 02/09/2026 10:15</p>
              <p className="border-t border-dashed border-black mt-1 pt-1">───────────────────────</p>
              <p>1x Kopi Susu Gula Aren  28,000</p>
              <p>1x Es Teh Manis          15,000</p>
              <p className="border-t border-dashed border-black mt-1 pt-1">───────────────────────</p>
              <p>Subtotal:               43,000</p>
              <p>Pajak 10%:               4,300</p>
              <p className="font-bold">TOTAL:                 47,300</p>
              <p>Bayar: QRIS            47,300</p>
              <p className="border-t border-dashed border-black mt-2 pt-1 text-center">Terima kasih! 😊</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barcode Scanner */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><ScanBarcode className="size-4 text-muted-foreground" /><CardTitle className="text-base">Barcode Scanner</CardTitle></div>
          <CardDescription>Scan via kamera HP (html5-qrcode) atau USB keyboard wedge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500"><ScanBarcode className="size-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Scanner Mode</p>
              <p className="text-xs text-muted-foreground">Kamera HP / USB Barcode Scanner (keyboard wedge)</p>
            </div>
            <Button size="sm" className="gap-1.5">Test Scan</Button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium text-foreground mb-1">📱 Kamera HP</p>
              <p>html5-qrcode / @zxing/library</p>
              <p>Menggunakan kamera perangkat</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium text-foreground mb-1">🔌 USB Scanner</p>
              <p>Keyboard wedge mode</p>
              <p>Buffer input sampai Enter key</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><Monitor className="size-4 text-muted-foreground" /><CardTitle className="text-base">Display & Mode</CardTitle></div>
          <CardDescription>Mode offline, sync, conflict resolution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Mode Offline</p>
              <p className="text-xs text-muted-foreground">Simpan transaksi ke IndexedDB saat internet down</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600">Aktif</Badge>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sync Otomatis</p>
              <p className="text-xs text-muted-foreground">Antrian sync saat online kembali</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600">Aktif</Badge>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Conflict Resolution</p>
              <p className="text-xs text-muted-foreground">Last write wins</p>
            </div>
            <Badge variant="secondary">Default</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
