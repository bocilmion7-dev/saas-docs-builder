import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight, ArrowLeft, Loader2, Mail, Store, Coffee, UtensilsCrossed, ShoppingCart,
  Wrench, Cake, Paintbrush, Sparkles, Car, Scissors, CheckCircle, Palette,
  Layout, PaintBucket, Building, Flower2, Utensils, Hammer, Cog, ScissorsIcon,
} from "lucide-react";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps { redirectAfterAuth?: string; }

const CATEGORIES = [
  { key: "cafe", icon: Coffee, label: "Cafe", desc: "Kopi, Non-Coffee, Food" },
  { key: "restoran", icon: UtensilsCrossed, label: "Restoran", desc: "Makanan, Minuman" },
  { key: "toko_retail", icon: ShoppingCart, label: "Retail", desc: "Fashion, Elektronik" },
  { key: "bakery", icon: Cake, label: "Bakery", desc: "Roti, Kue, Pastry" },
  { key: "toko_cat", icon: Paintbrush, label: "Toko Cat", desc: "Cat Tembok, Thinner" },
  { key: "spa", icon: Sparkles, label: "Spa", desc: "Massage, Facial, Body Scrub" },
  { key: "bengkel", icon: Wrench, label: "Bengkel", desc: "Servis Ringan/Sedang/Berat" },
  { key: "toko_sparepart", icon: Car, label: "Sparepart", desc: "Mesin, Kelistrikan, Rem" },
  { key: "toko_kain", icon: Scissors, label: "Kain", desc: "Katun, Batik, Denim" },
] as const;

const TEMPLATES_PER_CATEGORY: Record<string, { name: string; slug: string; desc: string; color: string }[]> = {
  cafe: [
    { name: "Minimalist Coffee", slug: "cafe-modern", desc: "Dark, modern, clean lines", color: "#1a1a2e" },
    { name: "Warm Bakery", slug: "cafe-classic", desc: "Cream, warm, friendly", color: "#f5e6d3" },
    { name: "Premium Lounge", slug: "cafe-minimalist", desc: "Elegant, dark wood", color: "#2d1b0e" },
  ],
  restoran: [
    { name: "Minimal Resto", slug: "resto-modern", desc: "Clean, professional", color: "#ffffff" },
    { name: "Family Feast", slug: "resto-family", desc: "Warm, inviting, family-friendly", color: "#ff8c42" },
    { name: "Premium Dining", slug: "resto-premium", desc: "Luxury, fine dining", color: "#1a1a2e" },
  ],
  toko_retail: [
    { name: "Minimal Store", slug: "retail-minimal", desc: "Clean grid layout", color: "#ffffff" },
    { name: "Supermarket", slug: "retail-supermarket", desc: "Grid heavy, category-focused", color: "#00a651" },
    { name: "Fashion Boutique", slug: "retail-fashion", desc: "Visual, image-forward", color: "#e91e63" },
  ],
  bakery: [
    { name: "Sweet Morning", slug: "bakery-sweet", desc: "Pastel, playful", color: "#ffb6c1" },
    { name: "Artisan Bread", slug: "bakery-artisan", desc: "Rustic, natural", color: "#8b6914" },
    { name: "Custom Cake Studio", slug: "bakery-cake", desc: "Elegant, photo showcase", color: "#fff0f5" },
  ],
  toko_cat: [
    { name: "Color Studio", slug: "cat-studio", desc: "Visualizer, interactive", color: "#4a90d9" },
    { name: "Industrial Paint", slug: "cat-industrial", desc: "Catalog heavy, professional", color: "#333333" },
    { name: "Contractor Pro", slug: "cat-contractor", desc: "Project gallery", color: "#f57c00" },
  ],
  spa: [
    { name: "Luxury Zen", slug: "spa-luxury", desc: "Minimalist, bamboo", color: "#8fbc8f" },
    { name: "Bali Retreat", slug: "spa-bali", desc: "Tropical, warm", color: "#228b22" },
    { name: "Modern Wellness", slug: "spa-modern", desc: "Clean, health-focused", color: "#e0f2f1" },
  ],
  bengkel: [
    { name: "Auto Service Pro", slug: "bengkel-pro", desc: "Professional, trustworthy", color: "#1565c0" },
    { name: "Quick Fix", slug: "bengkel-quick", desc: "Fast, efficient", color: "#ff6f00" },
    { name: "Premium Garage", slug: "bengkel-premium", desc: "High-end, detailed", color: "#212121" },
  ],
  toko_sparepart: [
    { name: "Part Finder", slug: "sparepart-finder", desc: "VIN search, compatibility", color: "#37474f" },
    { name: "Garage Store", slug: "sparepart-garage", desc: "Workshop feel", color: "#455a64" },
    { name: "OEM Catalog", slug: "sparepart-oem", desc: "Clean catalog layout", color: "#ffffff" },
  ],
  toko_kain: [
    { name: "Batik Gallery", slug: "kain-batik", desc: "Motif gallery, rich colors", color: "#5d4037" },
    { name: "Textile Wholesale", slug: "kain-wholesale", desc: "Roll management, bulk", color: "#795548" },
    { name: "Fashion Fabric", slug: "kain-fashion", desc: "Modern, fabric-focused", color: "#ff7043" },
  ],
};

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);

  // Login state
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginStep, setLoginStep] = useState<"email" | "otp">("email");
  const [otpEmail, setOtpEmail] = useState("");

  // Register wizard state (5 steps)
  const [regStep, setRegStep] = useState(0); // 0=account, 1=store, 2=category, 3=template, 4=review
  const [regForm, setRegForm] = useState({
    email: "", password: "", fullName: "",
    storeName: "", subdomain: "",
    category: "" as string,
    templateSlug: "",
  });
  const [subdomainStatus, setSubdomainStatus] = useState<{ available?: boolean; reason?: string }>({});
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const provisionMutation = useMutation(api.tenants.provision);
  const checkSubdomainQuery = useQuery(api.tenants.checkSubdomain, regForm.subdomain.length >= 3 ? { subdomain: regForm.subdomain } : "skip");

  useEffect(() => { if (!authLoading && isAuthenticated) navigate(redirect); }, [authLoading, isAuthenticated, navigate, redirect]);

  // Debounced subdomain check
  useEffect(() => {
    if (regForm.subdomain.length < 3) { setSubdomainStatus({}); return; }
    if (checkSubdomainQuery) setSubdomainStatus(checkSubdomainQuery);
  }, [checkSubdomainQuery, regForm.subdomain]);

  const templates = TEMPLATES_PER_CATEGORY[regForm.category] ?? [];

  // ── Login handlers ────────────────────────────────────────────────────────
  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      await signIn("email-otp", fd);
      setOtpEmail(fd.get("email") as string);
      setLoginStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim kode OTP");
    }
    setIsLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      await signIn("email-otp", fd);
      navigate(redirect);
    } catch {
      setError("Kode OTP salah. Coba lagi.");
      setOtp("");
    }
    setIsLoading(false);
  };

  // ── Register handlers ─────────────────────────────────────────────────────
  const canProceedStep0 = regForm.email && regForm.password.length >= 6 && regForm.fullName;
  const canProceedStep1 = regForm.storeName && regForm.subdomain && subdomainStatus.available === true;
  const canProceedStep2 = !!regForm.category;
  const canProceedStep3 = !!regForm.templateSlug;

  const handleProvision = async () => {
    setProvisioning(true); setError(null);
    try {
      // First sign in / create account
      const fd = new FormData();
      fd.set("email", regForm.email);
      fd.set("name", regForm.fullName);
      await signIn("email-otp", fd);

      // Provision tenant
      await provisionMutation({
        name: regForm.storeName,
        subdomain: regForm.subdomain,
        category: regForm.category as any,
        ownerEmail: regForm.email,
        ownerName: regForm.fullName,
      });

      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat toko. Coba lagi.");
    }
    setProvisioning(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-lg border shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">TB</div>
          </div>
          <CardTitle className="text-xl">TokoBuilder<span className="text-primary">.id</span></CardTitle>
          <CardDescription>
            {mode === "login" ? "Masuk ke dashboard toko Anda" : `Buat Toko Baru (${regStep + 1}/5)`}
          </CardDescription>
        </CardHeader>

        {mode === "login" ? (
          /* ── LOGIN ─────────────────────────────────────── */
          loginStep === "email" ? (
            <form onSubmit={handleLoginEmail}>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Email</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input name="email" placeholder="email@anda.com" type="email" className="pl-9" disabled={isLoading} required />
                    </div>
                    <Button type="submit" variant="outline" size="icon" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="button" variant="link" className="w-full text-sm" onClick={() => setMode("register")}>
                  Belum punya akun? <strong className="ml-1">Daftar Sekarang</strong>
                </Button>
              </CardContent>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <CardContent className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">Kode dikirim ke <strong>{otpEmail}</strong></p>
                <input type="hidden" name="email" value={otpEmail} />
                <input type="hidden" name="code" value={otp} />
                <div className="flex justify-center">
                  <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}>
                    <InputOTPGroup>{Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifikasi...</> : <>Verifikasi <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setLoginStep("email"); setOtp(""); }} className="w-full">Gunakan email lain</Button>
              </CardContent>
            </form>
          )
        ) : (
          /* ── REGISTER WIZARD ───────────────────────────── */
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="flex gap-1">
              {["Akun", "Toko", "Kategori", "Template", "Review"].map((s, i) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= regStep ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">{["Buat Akun", "Nama & Subdomain", "Pilih Kategori", "Pilih Template", "Review & Buat"][regStep]}</p>

            {/* Step 0: Account */}
            {regStep === 0 && (
              <div className="space-y-3">
                <div><Label className="text-xs">Nama Lengkap</Label><Input placeholder="John Doe" value={regForm.fullName} onChange={e => setRegForm(f => ({ ...f, fullName: e.target.value }))} /></div>
                <div><Label className="text-xs">Email</Label><Input type="email" placeholder="email@anda.com" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><Label className="text-xs">Password (min 6 karakter)</Label><Input type="password" placeholder="••••••" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} /></div>
              </div>
            )}

            {/* Step 1: Store Name + Subdomain */}
            {regStep === 1 && (
              <div className="space-y-3">
                <div><Label className="text-xs">Nama Toko</Label><Input placeholder="Contoh: Kopi Senja" value={regForm.storeName} onChange={e => setRegForm(f => ({ ...f, storeName: e.target.value }))} /></div>
                <div>
                  <Label className="text-xs">Subdomain</Label>
                  <div className="flex items-center gap-0">
                    <Input placeholder="kopisenja" value={regForm.subdomain} onChange={e => setRegForm(f => ({ ...f, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} className="rounded-r-none" />
                    <span className="inline-flex items-center h-9 px-3 rounded-r-lg border border-l-0 bg-muted text-xs text-muted-foreground">.tokobuilder.id</span>
                  </div>
                  {regForm.subdomain.length >= 3 && subdomainStatus.available !== undefined && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${subdomainStatus.available ? "text-green-600" : "text-red-500"}`}>
                      {subdomainStatus.available ? <><CheckCircle className="h-3 w-3" /> {regForm.subdomain}.tokobuilder.id tersedia!</> : <span>❌ {subdomainStatus.reason}</span>}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">Hanya huruf kecil, angka, dan strip. 3-20 karakter. Contoh: kopisenja, ayamgoreng-mantap</p>
                </div>
              </div>
            )}

            {/* Step 2: Category Selection */}
            {regStep === 2 && (
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.key} type="button" onClick={() => setRegForm(f => ({ ...f, category: c.key, templateSlug: "" }))}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition-all ${regForm.category === c.key ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border/60 hover:border-primary/40 hover:bg-primary/5"}`}>
                    <c.icon className="size-5" />
                    <span>{c.label}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{c.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Template Selection */}
            {regStep === 3 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Pilih template untuk toko <strong>{regForm.storeName}</strong> ({CATEGORIES.find(c => c.key === regForm.category)?.label})</p>
                <div className="grid grid-cols-1 gap-3">
                  {templates.map(t => (
                    <button key={t.slug} type="button" onClick={() => setRegForm(f => ({ ...f, templateSlug: t.slug }))}
                      className={`flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${regForm.templateSlug === t.slug ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "border-border/60 hover:border-primary/40"}`}>
                      <div className="w-16 h-16 rounded-lg flex-shrink-0" style={{ backgroundColor: t.color }} />
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                      {regForm.templateSlug === t.slug && <CheckCircle className="h-5 w-5 text-primary ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {regStep === 4 && (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{regForm.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Nama Toko:</span><span className="font-medium">{regForm.storeName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Subdomain:</span><span className="font-mono text-primary">{regForm.subdomain}.tokobuilder.id</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Kategori:</span><Badge>{CATEGORIES.find(c => c.key === regForm.category)?.label}</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Template:</span><span>{templates.find(t => t.slug === regForm.templateSlug)?.name}</span></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">Trial gratis 14 hari • Tanpa kartu kredit • Setup dalam 30 detik</p>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Navigation */}
            <div className="flex gap-2">
              {regStep > 0 && <Button type="button" variant="outline" onClick={() => setRegStep(s => s - 1)} disabled={provisioning}><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Button>}
              {regStep < 4 ? (
                <Button type="button" className="flex-1" disabled={
                  (regStep === 0 && !canProceedStep0) || (regStep === 1 && !canProceedStep1) || (regStep === 2 && !canProceedStep2) || (regStep === 3 && !canProceedStep3)
                } onClick={() => setRegStep(s => s + 1)}>
                  {regStep === 3 ? "Review" : "Lanjut"} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" className="flex-1" onClick={handleProvision} disabled={provisioning}>
                  {provisioning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Membuat Toko...</> : <><Store className="mr-2 h-4 w-4" /> Buat Toko Gratis</>}
                </Button>
              )}
            </div>
            <Button type="button" variant="link" className="w-full text-sm" onClick={() => setMode("login")}>Sudah punya akun? Masuk</Button>
          </CardContent>
        )}

        <div className="py-3 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
          Platform SaaS untuk Toko Online — <a href="/" className="underline hover:text-primary">TokoBuilder.id</a>
        </div>
      </Card>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return <Suspense><Auth {...props} /></Suspense>;
}
