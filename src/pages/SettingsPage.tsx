import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Store, CreditCard, Truck, Printer, Save, Coffee, UtensilsCrossed, ShoppingCart, Wrench, Cake, Paintbrush, Sparkles, Car, Scissors } from "lucide-react";
import { useTenantCategory } from "@/components/DashboardLayout";
import { CATEGORY_LABELS } from "@/config/categoryMenus";

const categoryOptions = [
  { value: "cafe", icon: Coffee, label: "Cafe" },
  { value: "restoran", icon: UtensilsCrossed, label: "Restoran" },
  { value: "toko_retail", icon: ShoppingCart, label: "Retail" },
  { value: "bakery", icon: Cake, label: "Bakery" },
  { value: "toko_cat", icon: Paintbrush, label: "Toko Cat" },
  { value: "spa", icon: Sparkles, label: "Spa" },
  { value: "bengkel", icon: Wrench, label: "Bengkel" },
  { value: "toko_sparepart", icon: Car, label: "Sparepart" },
  { value: "toko_kain", icon: Scissors, label: "Kain" },
];

export default function SettingsPage() {
  const { category, setCategory, tenantName } = useTenantCategory();
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

      {/* Category Switcher (Demo) */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">🏷️ Kategori Bisnis</CardTitle>
          <CardDescription>Ganti kategori untuk melihat menu dashboard yang berbeda (demo)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {categoryOptions.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium transition-all border ${
                  category === c.value
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border/60 bg-background hover:border-primary/30"
                }`}
              >
                <c.icon className="size-4" />
                {c.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Saat ini: <strong>{CATEGORY_LABELS[category]}</strong> — Sidebar akan menampilkan menu spesifik untuk kategori ini.
          </p>
        </CardContent>
      </Card>

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
              <Input defaultValue={tenantName} />
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
