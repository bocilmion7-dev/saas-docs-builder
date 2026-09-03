import { useMemo, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, Crown, Star, Building2, CreditCard, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import { useTenantId } from "@/hooks/use-tenant";

const PLAN_ICONS: Record<string, any> = {
  free: Star,
  starter: Star,
  pro: Crown,
  enterprise: Building2,
};

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function SubscriptionPage() {
  const tenantId = useTenantId() ?? "";
  const tenant = useQuery(api.tenants.getById, tenantId ? { id: tenantId } : "skip");
  const plans = useQuery(api.subscriptionPlans.list);
  const platformSettings = useQuery(api.platformSettings.getAll);
  const createPayment = useAction(api.midtrans.createSnapTransaction);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => plans?.find((p) => p._id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  if (!tenant || !plans) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat data subscription...</div>;
  }

  // Compute trial / subscription status
  const now = Date.now();
  const currentPlan = plans.find((p) => p._id === tenant.subscriptionPlanId) ?? null;
  const onTrial = tenant.status === "trialing";
  const daysLeft = Math.max(0, Math.ceil((tenant.trialEndsAt - now) / 86400000));
  const expired = tenant.status === "expired" || tenant.status === "past_due";

  const midtransServerKey = platformSettings?.midtrans_server_key ?? "";
  const midtransProduction = platformSettings?.midtrans_production === "true";

  const handleUpgrade = async () => {
    if (!selected) return;
    setProcessing(true);
    setError(null);
    try {
      if (!midtransServerKey) {
        setError("Midtrans belum dikonfigurasi oleh admin platform. Silakan hubungi admin.");
        return;
      }
      const orderId = `SUB-${tenant.subdomain.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const result = await createPayment({
        orderId,
        amount: selected.priceMonthly,
        customerName: tenant.name,
        items: [{
          id: selected.slug,
          name: `Paket ${selected.name} (bulanan)`,
          price: selected.priceMonthly,
          quantity: 1,
        }],
        serverKey: midtransServerKey,
        isProduction: midtransProduction,
      });
      if (result.success && result.redirectUrl) {
        setShowConfirm(false);
        window.location.href = result.redirectUrl;
      } else {
        setError(result.error ?? "Gagal membuat pembayaran.");
      }
    } catch (e) {
      setError("Gagal menghubungi Midtrans. Coba lagi.");
    }
    setProcessing(false);
  };

  const statusBadge = () => {
    const map: Record<string, { label: string; cls: string }> = {
      trialing: { label: "Trial Active", cls: "bg-amber-100 text-amber-700 border-amber-200" },
      active: { label: "Aktif", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      past_due: { label: "Past Due", cls: "bg-red-100 text-red-700 border-red-200" },
      expired: { label: "Expired", cls: "bg-red-100 text-red-700 border-red-200" },
      suspended: { label: "Suspended", cls: "bg-gray-100 text-gray-600 border-gray-200" },
      cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-600 border-gray-200" },
    };
    const s = map[tenant.status] ?? map.cancelled;
    return <Badge variant="outline" className={s.cls}>{s.label}</Badge>;
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
              <Crown className="size-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-bold">
                {onTrial
                  ? `Free Trial — ${daysLeft} hari tersisa`
                  : currentPlan
                    ? `Paket ${currentPlan.name}`
                    : "Tanpa Paket Aktif"}
              </div>
              <div className="text-xs text-muted-foreground">
                {onTrial
                  ? `Berakhir: ${new Date(tenant.trialEndsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
                  : currentPlan
                    ? `${formatRp(currentPlan.priceMonthly)}/bulan — Maks ${currentPlan.maxProducts} produk, ${currentPlan.maxStaff} staff`
                    : "Pilih paket di bawah untuk mengaktifkan toko Anda"}
              </div>
            </div>
          </div>
          {statusBadge()}
        </CardContent>
      </Card>

      {/* Warning banners */}
      {(onTrial || expired) && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-amber-800">
                {expired ? "Masa trial telah berakhir!" : `Masa trial ${daysLeft > 0 ? "hampir habis" : "telah berakhir"}!`}
              </div>
              <div className="text-xs text-amber-700 mt-1">
                {expired
                  ? "Fitur premium dikunci. Upgrade ke paket berbayar untuk melanjutkan operasional toko."
                  : `Dalam ${daysLeft} hari, fitur premium akan dikunci. Upgrade ke paket berbayar untuk akses penuh.`}
              </div>
              <Button size="sm" className="mt-2" onClick={() => { const s = plans.find((p) => p.slug === "starter"); if (s) { setSelectedPlanId(s._id); setShowConfirm(true); } }}>
                Upgrade Sekarang <ArrowRight className="size-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.slug] ?? Star;
          const isCurrent = currentPlan?._id === plan._id;
          const popular = plan.slug === "pro";
          const free = plan.priceMonthly === 0;
          return (
            <Card
              key={plan._id}
              className={`border-border/60 relative ${popular ? "border-primary shadow-md" : ""} ${isCurrent ? "bg-primary/5" : ""} hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => {
                if (!isCurrent) { setSelectedPlanId(plan._id); setShowConfirm(true); }
              }}
            >
              {popular && (
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
                  <span className="text-2xl font-extrabold">
                    {free ? "Gratis" : formatRp(plan.priceMonthly)}
                  </span>
                  {!free && <span className="text-xs text-muted-foreground ml-1">/bulan</span>}
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-xs">
                    <CheckCircle className="size-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Maks {plan.maxProducts} produk</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <CheckCircle className="size-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Maks {plan.maxStaff} staff</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <CheckCircle className="size-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Maks {plan.maxTransactionsMonth} transaksi/bulan</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <CheckCircle className="size-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{plan.trialDaysDefault > 0 ? `Trial ${plan.trialDaysDefault} hari` : "Tanpa trial"}</span>
                  </li>
                </ul>
                {!isCurrent && !free && (
                  <Button size="sm" className="w-full mt-3" onClick={(e) => { e.stopPropagation(); setSelectedPlanId(plan._id); setShowConfirm(true); }}>
                    Pilih Paket
                  </Button>
                )}
                {free && !isCurrent && (
                  <Button size="sm" variant="outline" className="w-full mt-3" onClick={(e) => { e.stopPropagation(); setSelectedPlanId(plan._id); setShowConfirm(true); }}>
                    Pilih Paket
                  </Button>
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
          <p className="text-[10px] text-muted-foreground mt-3">
            Pembayaran diproses oleh Midtrans ({midtransProduction ? "Production" : "Sandbox"}). Setelah pembayaran berhasil, admin platform akan mengaktifkan paket Anda.
          </p>
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
                <div className="text-lg font-extrabold text-primary mt-1">
                  {selected.priceMonthly === 0 ? "Gratis" : (
                    <>{formatRp(selected.priceMonthly)} <span className="text-xs text-muted-foreground">/bulan</span></>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {selected.slug === "free" ? "Aktifkan trial gratis" : "Pembayaran melalui Midtrans (QRIS / Virtual Account / Transfer)"}
                </div>
              </div>
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-600">
                  {error}
                </div>
              )}
              <Button className="w-full" onClick={handleUpgrade} disabled={processing}>
                {processing ? <Loader2 className="size-4 animate-spin mr-2" /> : <CreditCard className="size-4 mr-2" />}
                {processing ? "Memproses..." : selected.priceMonthly === 0 ? "Aktifkan" : `Bayar ${formatRp(selected.priceMonthly)}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
