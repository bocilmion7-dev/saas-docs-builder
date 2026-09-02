import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Store, CreditCard, Truck, Printer, Save } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pengaturan</h1>
          <p className="text-sm text-muted-foreground mt-1">Konfigurasi toko dan integrasi</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="size-4" />
          {saved ? "✓ Tersimpan!" : "Simpan"}
        </Button>
      </div>

      {/* Store Info */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Informasi Toko</CardTitle>
          </div>
          <CardDescription>Detail dasar toko kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Nama Toko</Label>
              <Input defaultValue="Kopi Senja" />
            </div>
            <div className="grid gap-2">
              <Label>Subdomain</Label>
              <Input defaultValue="kopisenja" disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Telepon</Label>
              <Input defaultValue="081234567890" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input defaultValue="hello@kopisenja.com" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Alamat</Label>
            <Input defaultValue="Jl. Sudirman No. 123, Jakarta Selatan" />
          </div>
        </CardContent>
      </Card>

      {/* Tax & Receipt */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Printer className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Pajak & Struk</CardTitle>
          </div>
          <CardDescription>Pengaturan pajak dan template struk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Pajak (%)</Label>
              <Input type="number" defaultValue="10" />
            </div>
            <div className="grid gap-2">
              <Label>Ukuran Struk</Label>
              <Input defaultValue="80mm" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Footer Struk</Label>
            <Input defaultValue="Terima kasih! Kunjungi kami lagi ya 😊" />
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Pembayaran</CardTitle>
          </div>
          <CardDescription>Integrasi payment gateway</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Midtrans Client Key</Label>
            <Input type="password" placeholder="SB-Mid-client-xxxxx" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 font-medium">Mode Development</span>
            Server key diatur oleh admin platform
          </div>
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Pengiriman</CardTitle>
          </div>
          <CardDescription>Pengaturan RajaOngkir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Provinsi Asal</Label>
              <Input defaultValue="DKI Jakarta" />
            </div>
            <div className="grid gap-2">
              <Label>Kota Asal</Label>
              <Input defaultValue="Jakarta Selatan" />
            </div>
            <div className="grid gap-2">
              <Label>Kurir Aktif</Label>
              <Input defaultValue="JNE, J&T, SiCepat" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
