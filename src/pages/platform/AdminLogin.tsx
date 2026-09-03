import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Halaman login Platform Super Admin — tersembunyi (tidak ada menu/link),
 * hanya bisa diakses langsung lewat URL: /platform-login
 *
 * Login cukup email + password (tanpa OTP). Akun dibuat otomatis pada
 * login pertama dengan kredensial default admin.
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validCredentials = useQuery(
    api.admin.checkCredentials,
    email.trim() && password ? { email: email.trim(), password } : "skip",
  );
  const claimAdmin = useMutation(api.admin.claimAdmin);

  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sudah platform admin → langsung ke /platform
  if (!isLoading && user?.isPlatformAdmin) {
    navigate("/platform", { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (validCredentials !== true) {
      setError("Email atau password salah. Gunakan kredensial admin platform.");
      return;
    }

    setBusy(true);
    try {
      // Coba daftar (login pertama kali); jika akun sudah ada, langsung masuk
      try {
        await signIn("password", { email: email.trim(), password, flow: "signUp" });
      } catch {
        await signIn("password", { email: email.trim(), password, flow: "signIn" });
      }

      // Naikkan role user ini menjadi Platform Admin
      await claimAdmin({ email: email.trim(), password });
      navigate("/platform");
    } catch (err) {
      setError("Login gagal: " + ((err as Error).message ?? "Terjadi kesalahan"));
    }
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#141210] px-4 text-white">
      {/* dekorasi */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-red-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-orange-500/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Kembali ke tokobuilder.id
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          {/* header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 shadow-lg shadow-red-600/30">
              <Shield className="size-7" />
            </div>
            <h1 className="mt-5 text-xl font-black tracking-tight">Platform Admin</h1>
            <p className="mt-1 text-xs text-white/50">tokobuilder.id — Super Admin Console</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <Lock className="size-3" /> Halaman rahasia — akses terbatas
            </span>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Email</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 transition-colors focus-within:border-red-500/60">
                <Mail className="size-4 shrink-0 text-white/40" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tokobuilder.id"
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Password</label>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 transition-colors focus-within:border-red-500/60">
                <Lock className="size-4 shrink-0 text-white/40" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-white/40 transition-colors hover:text-white">
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || validCredentials !== true}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 py-3.5 text-sm font-black text-white shadow-lg shadow-red-600/25 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
              {busy ? "Memverifikasi..." : "Masuk ke Console"}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] leading-relaxed text-white/30">
            Halaman ini tidak terhubung ke menu mana pun dan hanya dapat diakses
            dengan mengetik URL-nya secara langsung.
          </p>
        </div>
      </div>
    </div>
  );
}
