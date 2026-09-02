import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router";
import {
  Store,
  Coffee,
  UtensilsCrossed,
  ShoppingBag,
  Wrench,
  Cake,
  Paintbrush,
  Sparkles,
  Car,
  Scissors,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Layout,
  BarChart3,
  Globe,
  CreditCard,
} from "lucide-react";

const categories = [
  { icon: Coffee, name: "Cafe", desc: "Menu, BOM, Barista Display, Loyalty", color: "from-amber-600 to-orange-700" },
  { icon: UtensilsCrossed, name: "Restoran", desc: "KDS, Table 6 Status, Split Bill", color: "from-red-600 to-rose-700" },
  { icon: ShoppingBag, name: "Retail", desc: "SKU, Barcode, FIFO, Procurement", color: "from-blue-600 to-indigo-700" },
  { icon: Cake, name: "Bakery", desc: "Recipe BOM, Production, Custom Cake", color: "from-pink-500 to-rose-600" },
  { icon: Paintbrush, name: "Toko Cat", desc: "Tinting, Mixing, Volume Calculator", color: "from-emerald-600 to-teal-700" },
  { icon: Sparkles, name: "Spa", desc: "Booking, Therapist, Membership", color: "from-purple-500 to-violet-600" },
  { icon: Wrench, name: "Bengkel", desc: "Work Order, Job Card, Test Drive", color: "from-slate-600 to-zinc-700" },
  { icon: Car, name: "Sparepart", desc: "Cross-Ref, VIN, Bin Location", color: "from-sky-600 to-cyan-700" },
  { icon: Scissors, name: "Kain", desc: "Roll Mgmt, Obras, Konveksi B2B", color: "from-yellow-600 to-amber-700" },
];

const features = [
  { icon: Layout, title: "27 Template Siap Pakai", desc: "3 template premium per kategori dengan customisasi warna, font, dan layout tanpa batas." },
  { icon: Zap, title: "POS Super Cepat", desc: "Transaksi <1 detik. Scan barcode kamera HP, cetak struk thermal 58/80mm, mode offline-ready." },
  { icon: BarChart3, title: "Dashboard Analitik", desc: "Laporan harian, COGS, peak hour, margin per SKU, inventory turnover, financial overview real-time." },
  { icon: Shield, title: "RBAC & Audit Log", desc: "12 role per kategori, 50+ permission, 2FA, PIN cepat POS, audit trail setiap aksi kritis." },
  { icon: Globe, title: "Multi-Tenant Subdomain", desc: "Setiap toko punya subdomain unik.(tokobuilder.id). Shared DB, isolated data, enterprise-grade." },
  { icon: CreditCard, title: "Midtrans & RajaOngkir", desc: "Pembayaran QRIS/EDC/Transfer. Ongkir JNE/J&T/SiCepat instan. Webhook otomatis verifikasi." },
];

const plans = [
  {
    name: "Free Trial",
    price: "Gratis",
    period: "14 hari",
    desc: "Coba semua fitur dasar tanpa kartu kredit",
    features: ["20 Produk", "1 Staff", "50 Transaksi/bulan", "POS & Laporan Dasar"],
    cta: "Mulai Gratis",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "Rp99K",
    period: "/bulan",
    desc: "Untuk bisnis baru yang ingin go digital",
    features: ["200 Produk", "5 Staff", "1.000 Transaksi/bulan", "POS, Barcode, Thermal Print", "Volume Calculator & Booking"],
    cta: "Pilih Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Rp199K",
    period: "/bulan",
    desc: "Solusi lengkap untuk bisnis berkembang",
    features: ["Unlimited Produk", "15 Staff", "5.000 Transaksi/bulan", "Semua Fitur Kategori Spesifik", "BOM, Waste, COGS, Loyalty", "KDS, Split Bill, Membership"],
    cta: "Pilih Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Untuk jaringan bisnis & franchise",
    features: ["Custom Domain", "Unlimited Semuanya", "Priority Support", "API Access", "Custom Integrasi"],
    cta: "Hubungi Kami",
    highlighted: false,
  },
];

const stats = [
  { value: "9", label: "Kategori Bisnis" },
  { value: "27", label: "Template Premium" },
  { value: "310+", label: "Workflow Otomatis" },
  { value: "108", label: "Database Tables" },
];

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* ─── NAV ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              TB
            </div>
            <span className="text-lg font-bold tracking-tight">
              TokoBuilder<span className="text-primary">.id</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fitur</a>
            <a href="#categories" className="hover:text-foreground transition-colors">Kategori</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Harga</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Daftar Gratis
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-primary/3 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Store className="size-4" />
            Platform SaaS #1 untuk Toko Online Indonesia
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Bangun Toko Online{" "}
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Profesional
            </span>{" "}
            dalam Hitungan Menit
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            TokoBuilder AI adalah platform SaaS yang menyediakan generator toko online & dashboard tenant
            dengan <strong className="text-foreground">9 kategori bisnis</strong> — dari Cafe, Restoran, Retail,
            hingga Bengkel dan Spa — lengkap dengan POS, inventory, laporan, dan pembayaran terintegrasi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Mulai Toko Gratis
              <ArrowRight className="size-4" />
            </button>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-base font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Lihat Fitur
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────────── */}
      <section id="categories" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              9 Kategori Bisnis, Satu Platform
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Pilih kategori bisnismu, pilih template, dan TokoBuilder akan otomatis menyiapkan
              seluruh modul — dari POS hingga laporan keuangan.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <AnimatedSection key={cat.name}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{}}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-md mb-4`}>
                    <cat.icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold">{cat.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                  <div className="absolute -bottom-10 -right-10 size-32 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Fitur Lengkap untuk Bisnismu
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Dari POS kasir hingga laporan keuangan — semua yang kamu butuhkan untuk menjalankan toko modern.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <AnimatedSection key={f.title}>
                <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="text-base font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              4 Langkah Memulai
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Dari pendaftaran hingga toko online aktif — prosesnya cepat dan mudah.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Daftar & Pilih Kategori", desc: "Buat akun gratis dan pilih salah satu dari 9 kategori bisnis yang tersedia." },
              { step: "02", title: "Pilih Template", desc: "Pilih 1 dari 3 template premium untuk kategori bisnismu. Kustomisasi warna & logo." },
              { step: "03", title: "Atur Toko", desc: "Tambah produk, atur harga, siapkan POS, dan konfigurasi pengaturan toko." },
              { step: "04", title: "Go Live!", desc: "Toko online kamu aktif di subdomain unik. Mulai terima pesanan dari pelanggan." },
            ].map((s) => (
              <AnimatedSection key={s.step}>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-extrabold text-primary">
                    {s.step}
                  </div>
                  <h3 className="text-base font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Harga yang Pas untuk Bisnismu
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Mulai gratis selama 14 hari. Upgrade kapan saja sesuai pertumbuhan bisnis.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map((p) => (
              <AnimatedSection key={p.name}>
                <div
                  className={`relative rounded-2xl border p-6 h-full flex flex-col ${
                    p.highlighted
                      ? "border-primary bg-card shadow-xl shadow-primary/10 ring-1 ring-primary/20"
                      : "border-border/60 bg-card"
                  }`}
                >
                  {p.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                      POPULER
                    </div>
                  )}
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{p.price}</span>
                    {p.period && (
                      <span className="text-sm text-muted-foreground">{p.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 mt-0.5 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate("/auth")}
                    className={`mt-6 w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${
                      p.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-background hover:bg-accent"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-600 to-amber-600 p-10 sm:p-16 text-center text-white">
              <div className="absolute -top-20 -right-20 size-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Siap Membangun Toko Online?
                </h2>
                <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
                  Mulai gratis selama 14 hari tanpa kartu kredit. Buat toko online profesional dengan fitur lengkap untuk 9 kategori bisnis.
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-primary shadow-lg hover:bg-white/90 transition-colors"
                >
                  Daftar Sekarang — Gratis
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-[10px]">
                TB
              </div>
              <span className="text-sm font-bold">
                TokoBuilder<span className="text-primary">.id</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} TokoBuilder AI. Multi-tenant SaaS Online Store Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
