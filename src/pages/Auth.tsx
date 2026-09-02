import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, UserX, Store, Coffee, UtensilsCrossed, ShoppingCart, Wrench, Cake, Paintbrush, Sparkles, Car, Scissors } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router"

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | "register" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);
  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      console.log("signed in");

      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("The verification code you entered is incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Attempting anonymous sign in...");
      await signIn("anonymous");
      console.log("Anonymous sign in successful");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      
      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
        <Card className="min-w-[360px] max-w-[420px] pb-0 border shadow-md">
          {step === "signIn" ? (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm mb-2 mt-2">
                    TB
                  </div>
                </div>
                <CardTitle className="text-xl">TokoBuilder<span className="text-primary">.id</span></CardTitle>
                <CardDescription>
                  {step === "signIn" ? "Masuk ke dashboard toko Anda" : "Buat akun & toko baru"}
                </CardDescription>
              </CardHeader>

              {step === "signIn" ? (
                <form onSubmit={handleEmailSubmit}>
                  <CardContent>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input name="email" placeholder="email@anda.com" type="email" className="pl-9" disabled={isLoading} required />
                      </div>
                      <Button type="submit" variant="outline" size="icon" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      </Button>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    <div className="mt-4">
                      <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Atau</span></div></div>
                      <Button type="button" variant="outline" className="w-full mt-4" onClick={handleGuestLogin} disabled={isLoading}>
                        <UserX className="mr-2 h-4 w-4" /> Masuk sebagai Tamu
                      </Button>
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4">
                    <Button type="button" variant="link" className="w-full text-sm" onClick={() => setStep("register")}>
                      Belum punya akun? Daftar sekarang
                    </Button>
                  </div>
                </form>
              ) : step === "register" ? (
                <form onSubmit={(e) => { e.preventDefault(); handleEmailSubmit(e as any); }}>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      <Label className="text-xs">Nama Toko</Label>
                      <Input placeholder="Contoh: Kopi Senja" disabled={isLoading} />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">Subdomain</Label>
                      <div className="flex items-center gap-0">
                        <Input placeholder="kopisenja" className="rounded-r-none" disabled={isLoading} />
                        <span className="inline-flex items-center h-9 px-3 rounded-r-lg border border-l-0 bg-muted text-xs text-muted-foreground">.tokobuilder.id</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">Kategori Bisnis</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[{ icon: Coffee, label: "Cafe" }, { icon: UtensilsCrossed, label: "Restoran" }, { icon: ShoppingCart, label: "Retail" }, { icon: Cake, label: "Bakery" }, { icon: Paintbrush, label: "Toko Cat" }, { icon: Sparkles, label: "Spa" }, { icon: Wrench, label: "Bengkel" }, { icon: Car, label: "Sparepart" }, { icon: Scissors, label: "Kain" }].map((c) => (
                          <button key={c.label} type="button" className="flex flex-col items-center gap-1 rounded-lg border border-border/60 p-2 text-[10px] font-medium hover:border-primary/40 hover:bg-primary/5 transition-colors">
                            <c.icon className="size-4 text-muted-foreground" />{c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">Email</Label>
                      <Input name="email" placeholder="email@anda.com" type="email" disabled={isLoading} required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Store className="mr-2 h-4 w-4" />}
                      Buat Toko Gratis (14 hari trial)
                    </Button>
                    <Button type="button" variant="link" className="w-full text-sm" onClick={() => setStep("signIn")}>
                      Sudah punya akun? Masuk
                    </Button>
                  </CardContent>
                </form>
              ) : null}
            </>
          ) : (
            <>
              <CardHeader className="text-center mt-4">
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                  We've sent a code to {typeof step === "object" ? step.email : ""}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input type="hidden" name="email" value={typeof step === "object" ? step.email : ""} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          // Find the closest form and submit it
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) {
                            form.requestSubmit();
                          }
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Didn't receive a code?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setStep("signIn")}
                    >
                      Try again
                    </Button>
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifikasi...</>) : (<>Verifikasi Kode <ArrowRight className="ml-2 h-4 w-4" /></>)}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep("signIn")} disabled={isLoading} className="w-full">
                    Gunakan email lain
                  </Button>
                </CardFooter>
              </form>
            </>
          )}

          <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
            Platform SaaS untuk Toko Online — <a href="/" className="underline hover:text-primary transition-colors">TokoBuilder.id</a>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
