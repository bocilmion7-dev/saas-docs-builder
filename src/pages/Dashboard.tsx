import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenantId } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, Package, Users, TrendingUp, Clock, Store, ArrowRight, ArrowLeft,
  Loader2, CheckCircle, Check, Coffee, UtensilsCrossed, ShoppingCart as CartIcon,
  Wrench, Cake, Paintbrush, Sparkles, Car, Scissors, Shirt, Globe, Search,
} from "lucide-react";
import { STORE_TEMPLATES, TEMPLATE_PREVIEW_PRODUCTS, type StoreTemplate } from "@/config/storeTemplates";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const CATEGORIES = [
  { key: "cafe", icon: Coffee, label: "Cafe", desc: "Kopi, Non-Coffee, Food" },
  { key: "restoran", icon: UtensilsCrossed, label: "Restoran", desc: "Makanan, Minuman" },
  { key: "toko_retail", icon: CartIcon, label: "Retail", desc: "Fashion, Elektronik" },
  { key: "bakery", icon: Cake, label: "Bakery", desc: "Roti, Kue, Pastry" },
  { key: "toko_cat", icon: Paintbrush, label: "Toko Cat", desc: "Cat Tembok, Thinner" },
  { key: "spa", icon: Sparkles, label: "Spa", desc: "Massage, Facial, Scrub" },
  { key: "bengkel", icon: Wrench, label: "Bengkel", desc: "Servis Ringan/Berat" },
  { key: "toko_sparepart", icon: Car, label: "Sparepart", desc: "Mesin, Kelistrikan, Rem" },
  { key: "toko_kain", icon: Scissors, label: "Kain", desc: "Katun, Batik, Denim" },
  { key: "toko_pakaian", icon: Shirt, label: "Toko Pakaian", desc: "Fashion, Atasan" },
] as const;

// ── Preview mini storefront per template ────────────────────────────────────
function TemplatePreview({ tpl, category, storeName }: { tpl: StoreTemplate; category: string; storeName: string }) {
  const products = (TEMPLATE_PREVIEW_PRODUCTS[category] ?? TEMPLATE_PREVIEW_PRODUCTS.cafe).slice(0, 4);
  const dark = (() => {
    const c = tpl.color.replace("#", "");
    const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 < 140;
  })();
  const fg = dark ? "#ffffff" : "#1f2937";
  const accent = tpl.accent ?? (dark ? "#fbbf24" : "#4f46e5");

  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-sm bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 border-b">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-yellow-400" />
        <span className="size-2.5 rounded-full bg-green-400" />
        <span className="ml-2 flex-1 rounded bg-white border px-2 py-0.5 text-[9px] text-muted-foreground font-mono flex items-center gap-1">
          <Globe className="h-2.5 w-2.5" /> {storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.tokobuilder.id
        </span>
      </div>
      {/* Hero */}
      <div className="px-3 py-3" style={{ backgroundColor: tpl.color }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold" style={{ color: fg }}>{storeName || "Nama Toko"}</p>
            <p className="text-[8px] opacity-70" style={{ color: fg }}>TokoBuilder storefront</p>
          </div>
          <span className="text-[8px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: accent, color: dark ? "#111827" : "#fff" }}>
            Belanja
          </span>
        </div>
      </div>
      {/* Products */}
      <div className="grid grid-cols-4 gap-1.5 p-2">
        {products.map((p) => (
          <div key={p.name} className="rounded border p-1.5 text-center">
            <div className="text-lg leading-none">{p.emoji}</div>
            <p className="text-[7px] text-muted-foreground truncate mt-1">{p.name}</p>
            <p className="text-[8px] font-bold">{formatRp(p.price).replace("Rp ", "Rp")}</p>
          </div>
        ))}
      </div>
      {/* Footer bar */}
      <div className="px-3 py-1.5 border-t flex items-center justify-between">
        <Search className="h-3 w-3 text-muted-foreground" />
        <span className="text-[8px] text-muted-foreground flex items-center gap-1">
          <ShoppingCart className="h-2.5 w-2.5" /> Keranjang (0)
        </span>
      </div>
    </div>
  );
}

// ── Wizard Buat Toko ─────────────────────────────────────────────────────────
function CreateStoreWizard({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const provision = useMutation(api.tenants.provision);

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [templateSlug, setTemplateSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string } | null>(null);

  const templates = STORE_TEMPLATES[category] ?? [];
  const dbTemplates = useQuery(api.templates.list, category ? { category: category as any } : "skip");
  const subdomainCheck = useQuery(api.tenants.checkSubdomain, subdomain.length >= 3 ? { subdomain } : "skip");

  const subdomainOk = subdomain.length >= 3 && subdomainCheck?.available === true;

  const createStore = async () => {
    setBusy(true); setError(null);
    try {
      const res = await provision({
        name: storeName,
        subdomain,
        category: category as any,
        ownerEmail: user?.email ?? "",
        ownerName: user?.name ?? "Owner",
        templateSlug: templateSlug || undefined,
      });
      setResult(res);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat toko. Coba lagi.");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <Card className="max-w-xl mx-auto border-emerald-200">
        <CardContent className="p-10 text-center space-y-4">
          <div className="mx-auto size-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-9 w-9 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Toko Berhasil Dibuat! 🎉</h2>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>{storeName}</strong> — {CATEGORIES.find((c) => c.key === category)?.label} • {result?.url}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Menu dashboard sesuai kategori sedang dimuat…</p>
          </div>
          <Button onClick={onDone} className="mt-2">
            Masuk Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" /> Buat Toko Baru
        </CardTitle>
        <p className="text-sm text-muted-foreground">Langkah {step + 1} dari 3 — {["Pilih Kategori", "Pilih Template", "Info Toko"][step]}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step bar */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {/* STEP 1: Kategori */}
        {step === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => { setCategory(c.key); setTemplateSlug(""); }}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition-all ${category === c.key ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border/60 hover:border-primary/40 hover:bg-primary/5"}`}
              >
                <c.icon className="size-6" />
                <span>{c.label}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{c.desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: Template dengan preview */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Pilih tampilan toko untuk <strong>{CATEGORIES.find((c) => c.key === category)?.label}</strong> — klik template untuk preview besar.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {templates.map((t) => {
                const dbTpl = dbTemplates?.find((d: any) => d.slug === t.slug);
                const selected = templateSlug === t.slug;
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setTemplateSlug(t.slug)}
                    className={`rounded-xl border p-2 text-left transition-all ${selected ? "border-primary shadow-md ring-2 ring-primary/30" : "border-border/60 hover:border-primary/40"}`}
                  >
                    {dbTpl?.previewUrl ? (
                      <div className="rounded-lg overflow-hidden border">
                        <img src={dbTpl.previewUrl} alt={t.name} className="w-full aspect-[4/3] object-cover" />
                      </div>
                    ) : (
                      <TemplatePreview tpl={t} category={category} storeName={storeName || "Nama Toko"} />
                    )}
                    <div className="mt-2 px-1 pb-1 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{t.desc}</p>
                      </div>
                      {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Info Toko */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Nama Toko</label>
              <Input placeholder="Contoh: Kopi Senja" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Subdomain</label>
              <div className="flex items-center gap-0">
                <Input
                  placeholder="kopisenja"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="rounded-r-none font-mono"
                />
                <span className="inline-flex items-center h-9 px-3 rounded-r-lg border border-l-0 bg-muted text-xs text-muted-foreground font-mono">.tokobuilder.id</span>
              </div>
              {subdomain.length >= 3 && subdomainCheck && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${subdomainCheck.available ? "text-green-600" : "text-red-500"}`}>
                  {subdomainCheck.available ? <><CheckCircle className="h-3 w-3" /> {subdomain}.tokobuilder.id tersedia!</> : <span>❌ {subdomainCheck.reason}</span>}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">Hanya huruf kecil, angka, dan strip. 3-20 karakter.</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p>📦 Kategori: <strong>{CATEGORIES.find((c) => c.key === category)?.label}</strong></p>
              <p>🎨 Template: <strong>{templates.find((t) => t.slug === templateSlug)?.name ?? "-"}</strong></p>
              <p>🎁 Trial gratis 14 hari • Tanpa kartu kredit</p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Nav */}
        <div className="flex gap-2 pt-1">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={busy}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
            </Button>
          )}
          {step < 2 ? (
            <Button
              type="button"
              className="flex-1"
              disabled={step === 0 ? !category : !templateSlug}
              onClick={() => setStep((s) => s + 1)}
            >
              Lanjut <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" className="flex-1" disabled={busy || !storeName.trim() || !subdomainOk} onClick={createStore}>
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Membuat Toko…</> : <><Store className="mr-2 h-4 w-4" /> Buat Toko Sekarang</>}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Halaman utama ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const tenantId = useTenantId() ?? "";
  const hasTenant = !!tenantId;
  const [justCreated, setJustCreated] = useState(false);

  const enabled = hasTenant;
  const products = useQuery(api.products.list, enabled ? { tenantId } : "skip");
  const orders = useQuery(api.orders.list, enabled ? { tenantId } : "skip");
  const customers = useQuery(api.customers.list, enabled ? { tenantId } : "skip");
  const todayStats = useQuery(api.orders.todayStats, enabled ? { tenantId } : "skip");

  /* ── BELUM ADA TOKO (atau baru selesai buat, menunggu klik) → wizard Buat Toko ── */
  if (!hasTenant || justCreated) {
    return (
      <div className="min-h-full p-6 lg:p-10 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Selamat Datang di TokoBuilder 👋</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Akun Anda sudah siap. Buat toko online Anda sekarang — pilih kategori bisnis, template tampilan, dan subdomain. Dashboard menu akan otomatis terisi sesuai kategori.
            </p>
          </div>
          <CreateStoreWizard onDone={() => setJustCreated(false)} />
        </div>
      </div>
    );
  }

  /* ── SUDAH PUNYA TOKO → statistik ── */
  const items = (products && typeof products === "object" && "items" in products) ? products.items : [];
  const orderItems = (orders && typeof orders === "object" && "items" in orders) ? orders.items : [];
  const customerItems = Array.isArray(customers) ? customers : [];

  const todayRevenue = todayStats?.revenue ?? 0;
  const todayOrdersCount = todayStats?.count ?? 0;
  const recentOrders = orderItems.slice(0, 5);

  const stats = [
    { label: "Penjualan Hari Ini", value: formatRp(todayRevenue), icon: TrendingUp, color: "text-emerald-500" },
    { label: "Pesanan Hari Ini", value: String(todayOrdersCount), icon: ShoppingCart, color: "text-blue-500" },
    { label: "Total Produk", value: String(items.length), icon: Package, color: "text-orange-500" },
    { label: "Total Pelanggan", value: String(customerItems.length), icon: Users, color: "text-purple-500" },
  ];

  const statusLabel: Record<string, string> = { completed: "Selesai", preparing: "Disiapkan", confirmed: "Dikonfirmasi", pending: "Menunggu", served: "Tersaji", cancelled: "Dibatalkan" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Ringkasan aktivitas toko hari ini</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className={`text-xl font-extrabold mt-0.5 ${s.color}`}>{s.value}</div>
                </div>
                <s.icon className="size-5 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Pesanan Terbaru</h2>
          <div className="space-y-2">
            {recentOrders.map((o: any) => (
              <div key={o._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className="font-mono text-sm font-semibold">{o.orderNumber}</span>
                  <span className="text-xs text-muted-foreground ml-2">{formatRp(o.grandTotal)}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{statusLabel[o.status] ?? o.status}</span>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesanan hari ini.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}