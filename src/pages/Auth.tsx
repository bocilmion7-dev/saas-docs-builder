import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight, Loader2, Mail, User, CheckCircle,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps { redirectAfterAuth?: string; }

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

  // Register state — hanya akun (nama + email → OTP). Toko dibuat setelahnya di dashboard.
  const [regStep, setRegStep] = useState<"form" | "otp">("form");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => { if (!authLoading && isAuthenticated) navigate(redirect); }, [authLoading, isAuthenticated, navigate, redirect]);

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

  // ── Register handlers — buat akun saja, lalu masuk dashboard ─────────────
  const handleRegisterForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      await signIn("email-otp", fd);
      setRegEmail(fd.get("email") as string);
      setRegStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim kode OTP");
    }
    setIsLoading(false);
  };

  const handleRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      await signIn("email-otp", fd);
      setRegistered(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch {
      setError("Kode OTP salah. Coba lagi.");
      setOtp("");
    }
    setIsLoading(false);
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
            {mode === "login" ? "Masuk ke dashboard toko Anda" : "Daftar akun — buat toko setelah masuk"}
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
          /* ── REGISTER — hanya akun ─────────────────────── */
          regStep === "form" ? (
            <form onSubmit={handleRegisterForm}>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="name" placeholder="John Doe" className="pl-9" value={regName} onChange={(e) => setRegName(e.target.value)} disabled={isLoading} required />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="email" placeholder="email@anda.com" type="email" className="pl-9" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} disabled={isLoading} required />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Setelah daftar, Anda akan masuk dashboard dan bisa langsung <strong>Buat Toko</strong> — pilih kategori, template, dan subdomain.</p>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading || !regName.trim() || !regEmail.trim()}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim kode...</> : <>Daftar <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
                <Button type="button" variant="link" className="w-full text-sm" onClick={() => setMode("login")}>Sudah punya akun? Masuk</Button>
              </CardContent>
            </form>
          ) : registered ? (
            <CardContent className="space-y-3 py-10 text-center">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
              <p className="text-lg font-bold">Akun Berhasil Dibuat! 🎉</p>
              <p className="text-sm text-muted-foreground">Mengarahkan ke dashboard…</p>
            </CardContent>
          ) : (
            <form onSubmit={handleRegisterOtp}>
              <CardContent className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">Kode dikirim ke <strong>{regEmail}</strong></p>
                <input type="hidden" name="email" value={regEmail} />
                <input type="hidden" name="code" value={otp} />
                <input type="hidden" name="name" value={regName} />
                <div className="flex justify-center">
                  <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}>
                    <InputOTPGroup>{Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifikasi...</> : <>Selesai Daftar <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setRegStep("form"); setOtp(""); }} className="w-full">Gunakan email lain</Button>
              </CardContent>
            </form>
          )
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