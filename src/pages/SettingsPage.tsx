import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Store, Printer, CreditCard, Truck, Loader2, CheckCircle2 } from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";
import { CATEGORY_LABELS } from "@/config/categoryMenus";

export default function SettingsPage() {
  const tenantId = useTenantId() ?? "";
  const tenant = useQuery(api.tenants.getById, tenantId ? { id: tenantId } : "skip");
  const updateProfile = useMutation(api.tenants.updateProfile);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    cityId: "151",
  });
  const [settings, setSettings] = useState({
    taxPercent: "10",
    receiptWidth: "80mm",
    receiptFooter: "Terima kasih! Kunjungi kami lagi ya 😊",
    kurir: "JNE, J&T, SiCepat",
    paymentAction: "midtrans" as "midtrans" | "whatsapp",
    paymentWhatsappNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (tenant) {
      const s = tenant.settings ?? {};
      setForm({
        name: tenant.name ?? "",
        phone: tenant.phone ?? "",
        email: tenant.email ?? "",
        address: tenant.address ?? "",
        cityId: String(tenant.cityId ?? 151),
      });
      setSettings({
        taxPercent: String(s.taxPercent ?? 10),
        receiptWidth: s.receiptWidth ?? "80mm",
        receiptFooter: s.receiptFooter ?? "Terima kasih! Kunjungi kami lagi ya 😊",
        kurir: s.kurir ?? "JNE, J&T, SiCepat",
        paymentAction: s.paymentAction ?? "midtrans",
        paymentWhatsappNumber: s.paymentWhatsappNumber ?? tenant.phone ?? "",
      });
    }
  }, [tenant]);

  if (!tenant) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat pengaturan...</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        id: tenantId,
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        cityId: Number(form.cityId) || undefined,
        settings: {
          taxPercent: Number(settings.taxPercent) || 10,
          receiptWidth: settings.receiptWidth,
          receiptFooter: settings.receiptFooter,
          kurir: settings.kurir,
          paymentAction: settings.paymentAction,
          paymentWhatsappNumber: settings.paymentWhatsappNumber,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Gagal menyimpan pengaturan: " + (e as Error).message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pengaturan Toko</h1>
          <p className="text-sm text-muted-foreground mt-1">Profil toko, pajak, dan konfigurasi pengiriman</p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saved ? "✓ Tersimpan!" : "Simpan"}
        </Button>
      </div>

      {/* Kategori bisnis — read-only, ditentukan saat provisioning */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="size-4 text-primary" /> Kategori Bisnis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Kategori toko Anda:</span>
            <span className="rounded-full bg-primary text-primary-foreground text-xs font-bold px-3 py-1">
              {CATEGORY_LABELS[tenant.category] ?? tenant.category}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Menu dashboard dan template storefront mengikuti kategori ini dan tidak dapat diubah setelah toko dibuat.
            Untuk melihat kategori lain, daftarkan toko baru dengan kategori berbeda.
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
          <CardDescription>Detail dasar toko kamu — ditampilkan di storefront & struk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Nama Toko</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Subdomain</Label>
              <Input value={tenant.subdomain} disabled className="bg-muted/50" />
              <p className="text-[10px] text-muted-foreground">Subdomain tidak dapat diubah</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Telepon</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="08xxxx" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Alamat</Label>
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Jl. ..., Kota" />
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
          <CardDescription>Pengaturan pajak transaksi dan tampilan struk POS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Pajak (%)</Label>
              <Input type="number" value={settings.taxPercent} onChange={(e) => setSettings((s) => ({ ...s, taxPercent: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Ukuran Struk</Label>
              <Input value={settings.receiptWidth} onChange={(e) => setSettings((s) => ({ ...s, receiptWidth: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Footer Struk</Label>
            <Input value={settings.receiptFooter} onChange={(e) => setSettings((s) => ({ ...s, receiptFooter: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      {/* Pengiriman */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Pengiriman (RajaOngkir)</CardTitle>
          </div>
          <CardDescription>Kota asal pengiriman — dipakai untuk menghitung ongkir checkout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Kota Asal — ID RajaOngkir</Label>
              <Input type="number" value={form.cityId} onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value }))} placeholder="151 = Jakarta Selatan" />
              <p className="text-[10px] text-muted-foreground">
                151 = Jakarta Selatan, 22 = Bandung, 44 = Surabaya, 23 = Bekasi, 76 = Tangerang, 21 = Bogor
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Kurir Aktif</Label>
              <Input value={settings.kurir} onChange={(e) => setSettings((s) => ({ ...s, kurir: e.target.value }))} placeholder="JNE, J&T, SiCepat" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            API key RajaOngkir dikelola oleh admin platform (Pengaturan Platform → RajaOngkir).
          </p>
        </CardContent>
      </Card>

      {/* Payment Action */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Payment Action — Checkout Storefront</CardTitle>
          </div>
          <CardDescription>
            Cara pelanggan menyelesaikan pesanan di toko online Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pilihan mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, paymentAction: "midtrans" }))}
              className={`rounded-2xl border p-4 text-left transition-all ${
                settings.paymentAction === "midtrans"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/60 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">💳 Online — Midtrans</p>
                {settings.paymentAction === "midtrans" && <CheckCircle2 className="size-4 text-primary" />}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Pelanggan membayar langsung di halaman checkout: QRIS, Virtual Account, Bank Transfer, Kartu.
                Server key dikelola admin platform.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, paymentAction: "whatsapp" }))}
              className={`rounded-2xl border p-4 text-left transition-all ${
                settings.paymentAction === "whatsapp"
                  ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/25"
                  : "border-border/60 hover:border-emerald-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-emerald-600">💬 WhatsApp</p>
                {settings.paymentAction === "whatsapp" && <CheckCircle2 className="size-4 text-emerald-500" />}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Tombol checkout langsung membuka chat WhatsApp ke nomor toko Anda dengan ringkasan pesanan,
                lalu pembayaran diatur manual lewat chat.
              </p>
            </button>
          </div>

          {/* Nomor WA untuk mode WhatsApp */}
          <div className={`rounded-xl border p-4 space-y-3 transition-opacity ${settings.paymentAction === "whatsapp" ? "border-emerald-500/25 bg-emerald-500/5" : "border-border/60 opacity-60"}`}>
            <div className="grid gap-2">
              <Label>Nomor WhatsApp Penerima Order (format internasional, tanpa +)</Label>
              <Input
                value={settings.paymentWhatsappNumber}
                onChange={(e) => setSettings((s) => ({ ...s, paymentWhatsappNumber: e.target.value }))}
                placeholder="6281234567890"
              />
              <p className="text-[10px] text-muted-foreground">
                Contoh: 6281234567890. Nomor ini dipakai saat pelanggan mengklik tombol checkout (mode WhatsApp).
                Jika kosong, memakai nomor telepon toko.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Mode <strong>COD</strong> tetap tersedia di checkout untuk pelanggan lokal saat mode Online aktif.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
