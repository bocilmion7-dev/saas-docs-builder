import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, CreditCard, Truck, Mail, MessageSquare, Save, Database } from "lucide-react";

export default function PlatformSettings() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Konfigurasi global untuk seluruh platform tokobuilder.id</p>
        </div>
        <Button onClick={handleSave} className="gap-2"><Save className="size-4" />{saved ? "✓ Tersimpan!" : "Simpan"}</Button>
      </div>

      {/* Midtrans */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><CreditCard className="size-4 text-muted-foreground" /><CardTitle className="text-base">Midtrans Payment Gateway</CardTitle></div>
          <CardDescription>Server key, client key, mode production</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label>Server Key</Label><Input type="password" placeholder="SB-Mid-server-xxxxx" /></div>
          <div className="grid gap-2"><Label>Client Key</Label><Input type="password" placeholder="SB-Mid-client-xxxxx" /></div>
          <div className="flex items-center gap-3">
            <Label className="text-sm">Mode Production</Label>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-300">Development</button>
              <button className="px-3 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground border border-border">Production</button>
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
          <div className="grid gap-2"><Label>API Key</Label><Input type="password" placeholder="xxxxx" /></div>
          <div className="grid gap-2">
            <Label>Tipe</Label>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg text-xs font-medium bg-primary text-primary-foreground">Starter</button>
              <button className="px-3 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground border border-border">Pro</button>
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
            <div className="grid gap-2"><Label>Host</Label><Input placeholder="smtp.gmail.com" /></div>
            <div className="grid gap-2"><Label>Port</Label><Input placeholder="587" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>User</Label><Input placeholder="email@tokobuilder.id" /></div>
            <div className="grid gap-2"><Label>Password</Label><Input type="password" /></div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp API */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><MessageSquare className="size-4 text-muted-foreground" /><CardTitle className="text-base">WhatsApp API</CardTitle></div>
          <CardDescription>Untuk reminder booking H-1, service reminder H-7, piutang H-3</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label>WA API URL</Label><Input placeholder="https://api.whatsapp.com/send" /></div>
          <div className="grid gap-2"><Label>WA API Key</Label><Input type="password" placeholder="xxxxx" /></div>
        </CardContent>
      </Card>

      {/* Platform Config */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2"><Database className="size-4 text-muted-foreground" /><CardTitle className="text-base">Platform Config</CardTitle></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Platform Domain</Label><Input defaultValue="tokobuilder.id" /></div>
            <div className="grid gap-2"><Label>Trial Days Default</Label><Input type="number" defaultValue={14} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
