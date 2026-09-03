import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, CreditCard, Truck, Mail, MessageSquare, Save, Database, Loader2 } from "lucide-react";

export default function PlatformSettings() {
  const allSettings = useQuery(api.platformSettings.getAll);
  const setSetting = useMutation(api.platformSettings.set);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (allSettings) {
      setForm({
        midtrans_server_key: allSettings.midtrans_server_key ?? "",
        midtrans_client_key: allSettings.midtrans_client_key ?? "",
        midtrans_production: allSettings.midtrans_production ?? "false",
        rajaongkir_api_key: allSettings.rajaongkir_api_key ?? "",
        rajaongkir_type: allSettings.rajaongkir_type ?? "starter",
        smtp_host: allSettings.smtp_host ?? "",
        smtp_port: allSettings.smtp_port ?? "587",
        smtp_user: allSettings.smtp_user ?? "",
        smtp_password: allSettings.smtp_password ?? "",
        wa_api_url: allSettings.wa_api_url ?? "",
        wa_api_key: allSettings.wa_api_key ?? "",
        wa_phone_number: allSettings.wa_phone_number ?? "",
        wa_chat_message: allSettings.wa_chat_message ?? "",
        platform_domain: allSettings.platform_domain ?? "tokobuilder.id",
        trial_days_global: allSettings.trial_days_global ?? "14",
      });
    }
  }, [allSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(form)) {
        await setSetting({ key, value });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const updateForm = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  if (!allSettings) return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Konfigurasi global untuk seluruh platform tokobuilder.id</p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saved ? "✓ Tersimpan!" : "Simpan"}
        </Button>
      </div>

      {/* Midtrans */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><CreditCard className="size-4 text-muted-foreground" /><CardTitle className="text-base">Midtrans Payment Gateway</CardTitle></div>
          <CardDescription>Server key, client key, mode production</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label>Server Key</Label><Input type="password" value={form.midtrans_server_key} onChange={(e) => updateForm("midtrans_server_key", e.target.value)} placeholder="SB-Mid-server-xxxxx" /></div>
          <div className="grid gap-2"><Label>Client Key</Label><Input type="password" value={form.midtrans_client_key} onChange={(e) => updateForm("midtrans_client_key", e.target.value)} placeholder="SB-Mid-client-xxxxx" /></div>
          <div className="flex items-center gap-3">
            <Label className="text-sm">Mode Production</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => updateForm("midtrans_production", "false")} className={`px-3 py-1 rounded-lg text-xs font-medium border ${form.midtrans_production === "false" ? "bg-emerald-500/10 text-emerald-600 border-emerald-300" : "bg-muted text-muted-foreground border-border"}`}>Development</button>
              <button type="button" onClick={() => updateForm("midtrans_production", "true")} className={`px-3 py-1 rounded-lg text-xs font-medium border ${form.midtrans_production === "true" ? "bg-emerald-500/10 text-emerald-600 border-emerald-300" : "bg-muted text-muted-foreground border-border"}`}>Production</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RajaOngkir */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><Truck className="size-4 text-muted-foreground" /><CardTitle className="text-base">RajaOngkir Shipping</CardTitle></div>
          <CardDescription>API key, tipe (starter/pro), cache 24 jam</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label>API Key</Label><Input type="password" value={form.rajaongkir_api_key} onChange={(e) => updateForm("rajaongkir_api_key", e.target.value)} placeholder="xxxxx" /></div>
          <div className="grid gap-2">
            <Label>Tipe</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => updateForm("rajaongkir_type", "starter")} className={`px-3 py-1 rounded-lg text-xs font-medium border ${form.rajaongkir_type === "starter" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>Starter</button>
              <button type="button" onClick={() => updateForm("rajaongkir_type", "pro")} className={`px-3 py-1 rounded-lg text-xs font-medium border ${form.rajaongkir_type === "pro" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>Pro</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /><CardTitle className="text-base">SMTP Email</CardTitle></div>
          <CardDescription>Server email untuk welcome email, reminder, dll</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Host</Label><Input value={form.smtp_host} onChange={(e) => updateForm("smtp_host", e.target.value)} placeholder="smtp.gmail.com" /></div>
            <div className="grid gap-2"><Label>Port</Label><Input value={form.smtp_port} onChange={(e) => updateForm("smtp_port", e.target.value)} placeholder="587" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>User</Label><Input value={form.smtp_user} onChange={(e) => updateForm("smtp_user", e.target.value)} placeholder="email@tokobuilder.id" /></div>
            <div className="grid gap-2"><Label>Password</Label><Input type="password" value={form.smtp_password} onChange={(e) => updateForm("smtp_password", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Chat (Floating Button) */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><MessageSquare className="size-4 text-muted-foreground" /><CardTitle className="text-base">WhatsApp Chat — Floating Button</CardTitle></div>
          <CardDescription>Tombol WhatsApp mengambang di pojok kanan bawah landing page & semua halaman. Kosongkan nomor untuk menyembunyikan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Nomor WhatsApp (format internasional, tanpa +)</Label>
            <Input value={form.wa_phone_number} onChange={(e) => updateForm("wa_phone_number", e.target.value)} placeholder="6281234567890" />
            <p className="text-[10px] text-muted-foreground">Contoh: 6281234567890 (kode negara 62 tanpa tanda +)</p>
          </div>
          <div className="grid gap-2">
            <Label>Teks Chat Default</Label>
            <textarea
              value={form.wa_chat_message}
              onChange={(e) => updateForm("wa_chat_message", e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="Halo! Saya tertarik dengan TokoBuilder. Boleh dibantu info lebih lanjut? 😊"
            />
            <p className="text-[10px] text-muted-foreground">Pesan ini otomatis terisi di chat pelanggan saat mengklik tombol. Jika kosong, memakai teks default.</p>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp API */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><MessageSquare className="size-4 text-muted-foreground" /><CardTitle className="text-base">WhatsApp API (Reminder Otomatis)</CardTitle></div>
          <CardDescription>Untuk reminder booking H-1, service reminder H-7, piutang H-3</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label>WA API URL</Label><Input value={form.wa_api_url} onChange={(e) => updateForm("wa_api_url", e.target.value)} placeholder="https://api.whatsapp.com/send" /></div>
          <div className="grid gap-2"><Label>WA API Key</Label><Input type="password" value={form.wa_api_key} onChange={(e) => updateForm("wa_api_key", e.target.value)} placeholder="xxxxx" /></div>
        </CardContent>
      </Card>

      {/* Platform Config */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><Database className="size-4 text-muted-foreground" /><CardTitle className="text-base">Platform Config</CardTitle></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Platform Domain</Label><Input value={form.platform_domain} onChange={(e) => updateForm("platform_domain", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Trial Days Default</Label><Input type="number" value={form.trial_days_global} onChange={(e) => updateForm("trial_days_global", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
