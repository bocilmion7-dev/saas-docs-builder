import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, Crown, Zap, Star, Building2, CreditCard, ArrowRight } from "lucide-react";

const PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    price: "Gratis",
    period: "14 hari",
    icon: Zap,
    color: "border-muted",
    features: [
      "Maks 20 produk",
      "Maks 1 staff",
      "Maks 50 transaksi/bulan",
      "POS standar",
      "Laporan dasar",
    ],
    locked: [
      "Multi-staff", "Pro/COGS reports", "Waste tracking",
      "Barcode scanner", "Thermal print", "Loyalty program",
      "KDS/Production Plan", "Volume Calculator", "Tinting Mix",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "Rp 99.000",
    period: "/bulan",
    icon: Star,
    color: "border-primary",
    popular: true,
    features: [
      "Maks 50 produk",
      "Maks 2 staff",
      "Maks 100 transaksi/bulan",
      "POS + Barcode",
      "Laporan lengkap",
      "Waste tracking",
      "Loyalty (basic)",
      "Thermal print",
    ],
    locked: [
      "Multi-staff unlimited", "KDS", "Production Plan",
      "Volume Calculator", "Tinting Mix", "Custom domain",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rp 199.000",
    period: "/bulan",
    icon: Crown,
    color: "border-amber-500",
    features: [
      "Maks 200 produk",
      "Maks 5 staff",
      "Maks 1000 transaksi/bulan",
      "Semua fitur Starter",
      "Multi-staff RBAC",
      "POS + KDS + Split Bill",
      "Volume Calculator",
      "Tinting & Mixing",
      "Production Plan + Batch",
      "Vehicle DB + Work Order",
      "Fabric Roll + Obras",
      "Konveksi B2B",
      "Membership + Day Pass",
    ],
    locked: ["Custom domain", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "kontak kami",
    icon: Building2,
    color: "border-purple-500",
    features: [
      "Unlimited produk",
      "Unlimited staff",
      "Unlimited transaksi",
      "Semua fitur Pro",
      "Custom domain",
      "Priority support",
      "API access",
      "White-label option",
      "Dedicated account manager",
    ],
    locked: [],
  },
];

const CURRENT_PLAN = "trial"; // In production, fetch from tenant

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [trialDaysLeft] = useState(7); // In production, compute from trial_ends_at

  const selected = PLANS.find((p) => p.id === selectedPlan);

  const handleUpgrade = () => {
    // In production: open Midtrans Snap
    alert(`Mengarahkan ke Midtrans Snap untuk paket ${selected?.name} — Rp${selected?.price}/bulan`);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Subscription & Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola paket langganan toko Anda</p>
      </div>

      {/* Current Status */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Zap className="size-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-bold">Free Trial — {trialDaysLeft} hari tersisa</div>
              <div className="text-xs text-muted-foreground">Berakhir: 9 September 2026</div>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Trial Active</Badge>
        </CardContent>
      </Card>

      {/* Trial Warning Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-bold text-amber-800">Masa trial hampir habis!</div>
            <div className="text-xs text-amber-700 mt-1">
              Dalam {trialDaysLeft} hari, fitur berikut akan dikunci: KDS, Production Plan, Volume Calculator, Tinting & Mixing, Multi-staff, dan lainnya.
              Upgrade ke plan berbayar untuk akses penuh.
            </div>
            <Button size="sm" className="mt-2" onClick={() => setSelectedPlan("starter")}>
              Upgrade Sekarang <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === CURRENT_PLAN;
          return (
            <Card
              key={plan.id}
              className={`border-border/60 relative ${plan.popular ? "border-primary shadow-md" : ""} ${isCurrent ? "bg-primary/5" : ""} hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => { setSelectedPlan(plan.id); setShowConfirm(true); }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-2">Populer</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="text-[10px]">Saat ini</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2 pt-6">
                <Icon className="size-8 mx-auto text-primary" />
                <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                <div className="mt-1">
                  <span className="text-2xl font-extrabold">{plan.price}</span>
                  {plan.period !== "kontak kami" && <span className="text-xs text-muted-foreground ml-1">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="size-3 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.locked.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <div className="text-[10px] text-muted-foreground mb-1.5">Tidak termasuk:</div>
                    {plan.locked.map((f, i) => (
                      <div key={i} className="text-[10px] text-muted-foreground/60 line-through">• {f}</div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="size-4" /> Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["QRIS", "Bank Transfer", "Credit Card", "Virtual Account"].map((m) => (
              <div key={m} className="p-3 rounded-lg border border-border/60 text-center text-xs font-semibold hover:border-primary/40 transition-colors">
                {m}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">Pembayaran diproses oleh Midtrans. Subscription diperpanjang otomatis setiap bulan. Batal kapan saja.</p>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade ke {selected?.name}</DialogTitle>
            <DialogDescription>Konfirmasi perubahan plan langganan</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40">
                <div className="text-sm font-bold">{selected.name}</div>
                <div className="text-lg font-extrabold text-primary mt-1">{selected.price} <span className="text-xs text-muted-foreground">{selected.period}</span></div>
                <div className="text-xs text-muted-foreground mt-2">Akses langsung setelah pembayaran berhasil</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold">Fitur yang akan aktif:</div>
                {selected.features.slice(0, 5).map((f, i) => (
                  <div key={i} className="text-xs flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle className="size-3" /> {f}
                  </div>
                ))}
                {selected.features.length > 5 && (
                  <div className="text-xs text-muted-foreground">+{selected.features.length - 5} fitur lainnya</div>
                )}
              </div>
              <Button className="w-full" onClick={handleUpgrade}>
                <CreditCard className="size-4 mr-2" /> Bayar & Aktifkan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
