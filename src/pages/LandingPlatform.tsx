import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Store, Coffee, UtensilsCrossed, ShoppingBag, Wrench, Cake, Paintbrush,
  Sparkles,  Car, Scissors, Shirt, ArrowRight, Check, Zap, Shield, Layout, BarChart3,
  Globe, CreditCard, Package, Users, Truck, Tag, Bell, Quote, Mail,
  ChevronRight, TrendingUp, BadgeCheck, Flame, ShoppingCart, Star, Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DEFAULT_LANDING, ACCENTS, type FeatureIconKey, type LandingContent } from "@/lib/landingContent";

const FEATURE_ICONS: Record<FeatureIconKey, LucideIcon> = {
  layout: Layout, zap: Zap, chart: BarChart3, shield: Shield, globe: Globe,
  card: CreditCard, store: Store, package: Package, users: Users, truck: Truck,
  tag: Tag, bell: Bell,
};

const categories = [
  { icon: Coffee, name: "Cafe", tag: "Kopi · Menu · Loyalty", color: "from-amber-500 to-orange-600", tint: "bg-amber-500/10 text-amber-600" },
  { icon: UtensilsCrossed, name: "Restoran", tag: "KDS · Split Bill", color: "from-red-500 to-rose-600", tint: "bg-red-500/10 text-red-600" },
  { icon: ShoppingBag, name: "Retail", tag: "SKU · Barcode · FIFO", color: "from-blue-500 to-indigo-600", tint: "bg-blue-500/10 text-blue-600" },
  { icon: Cake, name: "Bakery", tag: "Produksi · Custom Cake", color: "from-pink-500 to-rose-600", tint: "bg-pink-500/10 text-pink-600" },
  { icon: Paintbrush, name: "Toko Cat", tag: "Tinting · Kalkulator", color: "from-emerald-500 to-teal-600", tint: "bg-emerald-500/10 text-emerald-600" },
  { icon: Sparkles, name: "Spa", tag: "Booking · Membership", color: "from-purple-500 to-violet-600", tint: "bg-purple-500/10 text-purple-600" },
  { icon: Wrench, name: "Bengkel", tag: "Work Order · Job Card", color: "from-slate-500 to-zinc-600", tint: "bg-slate-500/10 text-slate-600" },
  { icon: Car, name: "Sparepart", tag: "VIN · Cross-Ref", color: "from-sky-500 to-cyan-600", tint: "bg-sky-500/10 text-sky-600" },
  { icon: Scissors, name: "Kain", tag: "Roll · Obras · Konveksi", color: "from-yellow-500 to-amber-600", tint: "bg-yellow-500/10 text-amber-600" },
  { icon: Shirt, name: "Toko Pakaian", tag: "Size Matrix · Size Exchange", color: "from-fuchsia-500 to-pink-600", tint: "bg-fuchsia-500/10 text-fuchsia-600" },
];

const marqueeCats = ["Cafe", "Restoran", "Retail", "Bakery", "Toko Cat", "Spa", "Bengkel", "Sparepart", "Kain", "Toko Pakaian"];

const avatars = [
  { i: "RW", g: "from-amber-400 to-orange-500" },
  { i: "HG", g: "from-sky-400 to-blue-500" },
  { i: "SH", g: "from-pink-400 to-rose-500" },
  { i: "AD", g: "from-emerald-400 to-teal-500" },
  { i: "BN", g: "from-violet-400 to-purple-500" },
];

function useReveal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return { ref, inView };
}

function Reveal({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
      {children}
    </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const savedContent = useQuery(api.landingContent.get);
  const c: LandingContent = savedContent ?? DEFAULT_LANDING;
  const accentStyle = ACCENTS[c.theme?.accent ?? "terracotta"].vars as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip" style={accentStyle}>
      {/* ─── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="group flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-primary-foreground font-black text-sm shadow-md shadow-primary/30 transition-transform group-hover:rotate-6">
              {c.brand.logoText}
            </span>
            <span className="text-lg font-black tracking-tight">
              {c.brand.name}<span className="text-primary">.id</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1 text-sm font-medium">
            {[["#features", "Fitur"], ["#categories", "Kategori"], ["#pricing", "Harga"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full px-4 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button onClick={() => navigate("/auth")} className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              Masuk
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background shadow-sm transition-all hover:scale-[1.03] hover:shadow-md active:scale-95"
            >
              Daftar Gratis
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section id="top" className="relative overflow-hidden">
        {/* dekorasi */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(120,80,40,0.07)_1px,transparent_0)] [background-size:26px_26px]" />
          <div className="absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-40 -left-40 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-[110px]" />
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
          {/* Kiri — copy */}
          <div className="relative">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Eyebrow>
                <Sparkles className="size-3" /> {c.hero.badge}
              </Eyebrow>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="mt-6 text-[2.6rem] font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.2rem]"
            >
              {c.hero.title}{" "}
              <span className="relative whitespace-nowrap">
                <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {c.hero.highlight}
                </span>
                <svg className="absolute -bottom-2 left-0 w-full text-primary/50" viewBox="0 0 220 12" fill="none" preserveAspectRatio="none">
                  <path d="M3 9c60-6 150-7 214-3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>{" "}
              {c.hero.titleAfter}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              {c.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <button
                onClick={() => navigate("/auth")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:brightness-110 active:scale-[0.97]"
              >
                {c.hero.ctaLabel}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <div className="flex -space-x-2.5">
                {avatars.map((a) => (
                  <span key={a.i} className={`flex size-9 items-center justify-center rounded-full bg-gradient-to-br ${a.g} text-[10px] font-black text-white ring-2 ring-background`}>
                    {a.i}
                  </span>
                ))}
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-background">
                  +2K
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
                  <span className="ml-1.5 text-sm font-bold text-foreground">4.9/5</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Dipercaya 2.400+ pemilik usaha di Indonesia</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 py-1.5 text-xs font-semibold text-emerald-600 sm:flex">
                <BadgeCheck className="size-3.5" /> Trial 14 hari, tanpa kartu kredit
              </div>
            </motion.div>
          </div>

          {/* Kanan — mockup storefront */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[540px]"
          >
            {/* glow */}
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-primary/20 via-amber-400/10 to-transparent blur-2xl" />

            {/* browser window */}
            <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-2xl shadow-primary/10">
              {/* title bar */}
              <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-red-400" />
                <span className="size-2.5 rounded-full bg-amber-400" />
                <span className="size-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 flex flex-1 items-center justify-center gap-1.5 rounded-md bg-background/80 px-3 py-1 text-[10px] text-muted-foreground">
                  <Globe className="size-3 text-emerald-500" /> kopisenja.tokobuilder.id
                </span>
              </div>

              <div className="space-y-4 p-5">
                {/* toko mini header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 text-[10px] font-black text-white">☕</span>
                    <div>
                      <p className="text-xs font-black leading-none">Kopi Senja</p>
                      <p className="mt-0.5 text-[9px] text-muted-foreground">Bandung · Buka sekarang</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">
                    <ShoppingCart className="size-3" /> 3
                  </span>
                </div>

                {/* banner */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 p-4 text-white">
                  <div className="absolute -right-4 -top-6 size-24 rounded-full bg-white/15" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Menu Andalan</p>
                  <p className="mt-1 text-sm font-black leading-tight">Es Kopi Susu Gula Aren<br />Rp 28.000</p>
                  <span className="mt-2 inline-flex rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-primary">+ Pesan Sekarang</span>
                </div>

                {/* produk */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { e: "🥐", n: "Croissant", p: "22K" },
                    { e: "🍜", n: "Nasi Goreng", p: "35K" },
                    { e: "🧋", n: "Thai Tea", p: "25K" },
                  ].map((item) => (
                    <div key={item.n} className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
                      <div className="flex h-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 text-xl">{item.e}</div>
                      <p className="mt-1.5 truncate text-[9px] font-bold leading-none">{item.n}</p>
                      <p className="mt-1 text-[9px] font-black text-primary">Rp {item.p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* floating card: order */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 -top-8 hidden items-center gap-2.5 rounded-2xl border border-border/70 bg-card px-3.5 py-2.5 shadow-xl sm:flex"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"><TrendingUp className="size-4" /></span>
              <div>
                <p className="text-[10px] font-black leading-none">+Rp 47.300</p>
                <p className="mt-1 text-[9px] text-muted-foreground">Order #1042 hari ini</p>
              </div>
            </motion.div>

            {/* floating card: notif */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute -bottom-6 -right-2 hidden items-center gap-2.5 rounded-2xl border border-border/70 bg-card px-3.5 py-2.5 shadow-xl sm:flex"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-600"><Flame className="size-4" /></span>
              <div>
                <p className="text-[10px] font-black leading-none">Laris manis 🔥</p>
                <p className="mt-1 text-[9px] text-muted-foreground">Es Kopi Susu — 12 terjual hari ini</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* stats strip */}
        <div className="border-y border-border/50 bg-card/50 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border/60 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {c.stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="px-4 py-6 text-center md:py-7"
              >
                <p className="text-2xl font-black text-foreground sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* marquee */}
        <div className="relative overflow-hidden border-b border-border/40 bg-background py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <motion.div
            className="flex w-max items-center gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          >
            {[...marqueeCats, ...marqueeCats].map((name, i) => (
              <span key={i} className="flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                {name} <span className="text-primary">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────────── */}
      <section id="categories" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Ekosistem Bisnis</Eyebrow>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{c.categories.title}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{c.categories.subtitle}</p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <Reveal key={cat.name} delay={(i % 3) * 0.06}>
                <div className="group relative flex h-full items-start gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                  <div className={`absolute -right-8 -top-8 size-24 rounded-full ${cat.tint.replace("text-", "bg-")}/40 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                  <div className={`relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} text-white shadow-md shadow-black/10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                    <cat.icon className="size-6" />
                  </div>
                  <div className="relative min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-black">{cat.name}</h3>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{cat.tag}</p>
                    <span className="mt-3 inline-block rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      3 Template siap pakai
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES (editorial split) ───────────────────────────────────── */}
      <section id="features" className="relative overflow-hidden bg-muted/40 py-20 sm:py-28">
        <div className="pointer-events-none absolute -left-40 top-20 -z-0 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
          {/* kiri */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow>Kenapa TokoBuilder</Eyebrow>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{c.features.title}</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">{c.features.subtitle}</p>
              <ul className="mt-7 space-y-3">
                {["Setup kurang dari 15 menit", "Tanpa biaya tersembunyi", "Data toko 100% milik Anda"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm font-semibold">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600"><Check className="size-3" /></span>
                    {t}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/auth")} className="mt-9 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-6 py-3 text-sm font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-primary-foreground active:scale-95">
                Coba gratis 14 hari <ArrowRight className="size-4" />
              </button>
            </Reveal>
          </div>

          {/* kanan: list fitur dengan garis pemisah */}
          <div>
            {c.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[f.icon] ?? Zap;
              const visuals = [
                { bars: [40, 70, 55, 90, 65, 100], label: "Penjualan 7 hari" },
                { receipt: true, label: "Struk otomatis" },
                { dots: 5, label: "Role & izin staf" },
                { checklines: ["Laporan harian", "COGS akurat", "Margin per SKU"], label: "Analitik real-time" },
                { chips: ["namatoko.id", "isolated data", "HTTPS"], label: "Subdomain unik" },
                { pay: ["QRIS", "VA", "Kartu"], label: "Midtrans + RajaOngkir" },
              ][i] ?? { bars: [60, 80, 70], label: "Auto" };
              return (
                <Reveal key={f.title} delay={i * 0.05}>
                  <div className="group flex gap-4 border-b border-border/60 py-6 first:pt-0 last:border-0 last:pb-0 sm:gap-6">
                    <div className="flex flex-col items-center">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="size-5" />
                      </span>
                      <span className="mt-2 text-[9px] font-black text-muted-foreground/40">0{i + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black sm:text-lg">{f.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                    </div>
                    {/* mini visual */}
                    <div className="hidden w-24 shrink-0 items-end justify-end xl:flex">
                      {"bars" in visuals && visuals.bars ? (
                        <div className="flex h-14 items-end gap-1">
                          {(visuals.bars as number[]).map((h, bi) => (
                            <span key={bi} style={{ height: `${h}%` }} className={`w-1.5 rounded-full ${bi === (visuals.bars as number[]).length - 1 ? "bg-primary" : "bg-primary/25"}`} />
                          ))}
                        </div>
                      ) : "receipt" in visuals ? (
                        <div className="w-20 rounded-md border border-border bg-card p-2 font-mono text-[7px] leading-tight text-muted-foreground">
                          <p className="text-center font-bold text-foreground">STRUK</p>
                          <p>1x Kopi Susu 28,0</p>
                          <p>Pajak 10% 2,8</p>
                          <p className="border-t border-dashed border-border pt-0.5 font-bold text-foreground">TOTAL 30,8</p>
                        </div>
                      ) : "dots" in visuals ? (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {Array.from({ length: visuals.dots as number }).map((_, di) => (
                            <span key={di} className={`size-4 rounded-full ${di === 0 ? "bg-primary" : di === 1 ? "bg-amber-400" : "bg-primary/20"}`} />
                          ))}
                        </div>
                      ) : "checklines" in visuals && visuals.checklines ? (
                        <div className="w-20 space-y-1.5">
                          {(visuals.checklines as string[]).map((l) => (
                            <p key={l} className="flex items-center gap-1 text-[8px] font-semibold text-muted-foreground"><Check className="size-2.5 text-emerald-500" />{l.split(" ")[0]}</p>
                          ))}
                        </div>
                      ) : "chips" in visuals && visuals.chips ? (
                        <div className="flex w-20 flex-wrap justify-end gap-1">
                          {(visuals.chips as string[]).map((ch) => (
                            <span key={ch} className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[7px] font-bold text-primary">{ch}</span>
                          ))}
                        </div>
                      ) : "pay" in visuals && visuals.pay ? (
                        <div className="flex w-20 flex-wrap justify-end gap-1">
                          {(visuals.pay as string[]).map((p) => (
                            <span key={p} className="rounded border border-border bg-card px-1.5 py-0.5 text-[7px] font-black text-muted-foreground">{p}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── STEPS (timeline) ─────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Mulai Sekarang</Eyebrow>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{c.steps.title}</h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{c.steps.subtitle}</p>
          </Reveal>

          <div className="relative mt-16">
            <div className="absolute left-1/2 top-6 hidden h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {c.steps.items.map((s, i) => (
                <Reveal key={`${i}-${s.title}`} delay={i * 0.1}>
                  <div className="group relative flex flex-col items-center text-center lg:pt-0">
                    <div className="relative z-10 mb-5 flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card text-primary shadow-lg shadow-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:border-primary/40">
                      <span className="text-sm font-black">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="text-base font-black">{s.title}</h3>
                    <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────── */}
      {c.testimonials.enabled && c.testimonials.items.length > 0 && (
        <section className="relative overflow-hidden bg-muted/40 py-20 sm:py-28">
          <div className="pointer-events-none absolute -right-32 top-0 -z-0 size-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-xl">
                <Eyebrow>Kata Mereka</Eyebrow>
                <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{c.testimonials.title}</h2>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg">{c.testimonials.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-bold shadow-sm">
                <span className="text-amber-500 flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</span>
                4.9 / 5.0
              </div>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {c.testimonials.items.slice(0, 3).map((t, i) => (
                <Reveal key={t.author} delay={i * 0.08}>
                  <div className={`flex h-full flex-col rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${i === 1 ? "border-primary/25 bg-primary/5 md:-translate-y-3" : "border-border/60 bg-card"}`}>
                    <Quote className="size-7 text-primary/30" />
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">“{t.quote}”</p>
                    <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-5">
                      <span className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br ${avatars[i % avatars.length].g} text-xs font-black text-white`}>
                        {t.author.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">{t.author}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                      </div>
                      <span className="ml-auto text-amber-500">★★★★★</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Harga Transparan</Eyebrow>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{c.pricing.title}</h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{c.pricing.subtitle}</p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {c.pricing.plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.06} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 ${
                    p.highlighted
                      ? "bg-foreground text-background shadow-2xl lg:-translate-y-3"
                      : "border border-border/60 bg-card shadow-sm hover:shadow-lg"
                  }`}
                >
                  {p.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                      ⚡ Paling Laris
                    </span>
                  )}
                  <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${p.highlighted ? "text-background/60" : "text-muted-foreground"}`}>{p.name}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className={`text-4xl font-black tracking-tight ${p.highlighted ? "" : "text-foreground"}`}>{p.price}</span>
                    {p.period && <span className={`text-sm font-medium ${p.highlighted ? "text-background/60" : "text-muted-foreground"}`}>{p.period}</span>}
                  </div>
                  <p className={`mt-2 text-xs leading-relaxed ${p.highlighted ? "text-background/70" : "text-muted-foreground"}`}>{p.desc}</p>
                  <div className={`mt-5 flex-1 space-y-2.5 border-t pt-5 ${p.highlighted ? "border-background/15" : "border-border/60"}`}>
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${p.highlighted ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                          <Check className="size-2.5" />
                        </span>
                        <span className={`text-[13px] font-medium ${p.highlighted ? "text-background/90" : "text-foreground/85"}`}>{feat}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/auth")}
                    className={`mt-6 w-full rounded-full py-2.5 text-sm font-black transition-all active:scale-95 ${
                      p.highlighted
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110"
                        : "border border-border bg-background hover:border-primary/40 hover:bg-primary hover:text-primary-foreground"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Semua paket termasuk <span className="font-bold text-foreground">template storefront</span>, <span className="font-bold text-foreground">POS</span>, dan <span className="font-bold text-foreground">laporan dasar</span>. Bayar via Midtrans: QRIS · VA · Kartu.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      {c.faq.enabled && c.faq.items.length > 0 && (
        <section id="faq" className="border-y border-border/40 bg-muted/40 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
            <Reveal>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{c.faq.title}</h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">{c.faq.subtitle}</p>
              <div className="mt-8 rounded-2xl border border-primary/20 bg-card p-5 shadow-sm">
                <p className="text-sm font-black">Masih ada pertanyaan?</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Tim kami siap membantu via email atau WhatsApp.</p>
                <a href={`mailto:${c.footer.contactEmail}`} className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-95">
                  <Mail className="size-3.5" /> {c.footer.contactEmail}
                </a>
              </div>
            </Reveal>

            <div className="space-y-3">
              {c.faq.items.map((item, i) => (
                <Reveal key={`${i}-${item.q}`} delay={i * 0.04}>
                  <details className="group rounded-2xl border border-border/60 bg-card transition-colors open:border-primary/30 open:shadow-md">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-open:rotate-45 group-open:bg-primary/10 group-open:text-primary">
                        <Plus className="size-3.5" />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground px-6 py-14 text-center text-background sm:px-16 sm:py-20">
              {/* pola */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
              <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-orange-500/25 blur-3xl" />
              <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-background/10 to-transparent" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-background/80 backdrop-blur">
                  <Sparkles className="size-3 text-amber-300" /> Gratis 14 hari — tanpa kartu kredit
                </span>
                <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                  {c.ctaBanner.title}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-background/70 sm:text-lg">{c.ctaBanner.subtitle}</p>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/auth")}
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-black text-primary-foreground shadow-2xl shadow-primary/40 transition-all hover:brightness-110 active:scale-95"
                  >
                    {c.ctaBanner.buttonLabel}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-semibold text-background/60">
                  {["Trial 14 hari penuh", "Setup < 15 menit", "Subdomain toko instan", "Batal kapan saja"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-400" /> {t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <a href="#top" className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-primary-foreground font-black text-sm shadow-md shadow-primary/25">
                  {c.brand.logoText}
                </span>
                <span className="text-lg font-black tracking-tight">{c.brand.name}<span className="text-primary">.id</span></span>
              </a>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Generator toko online & dashboard tenant untuk 10 kategori bisnis — POS, inventory, laporan, dan pembayaran dalam satu platform.
              </p>
              <a href={`mailto:${c.footer.contactEmail}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                <Mail className="size-4" /> {c.footer.contactEmail}
              </a>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Navigasi</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium">
                {[["#features", "Fitur"], ["#categories", "Kategori"], ["#pricing", "Harga"], ["#faq", "FAQ"]].map(([href, label]) => (
                  <li key={href}><a href={href} className="text-muted-foreground transition-colors hover:text-foreground">{label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Kategori Bisnis</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium">
                {categories.slice(0, 5).map((cat) => (
                  <li key={cat.name}><a href="#categories" className="text-muted-foreground transition-colors hover:text-foreground">{cat.name}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Mulai</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium">
                <li><button onClick={() => navigate("/auth")} className="text-muted-foreground transition-colors hover:text-primary">Daftar Gratis</button></li>
                <li><button onClick={() => navigate("/auth")} className="text-muted-foreground transition-colors hover:text-primary">Masuk</button></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {c.footer.copyright}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Dibuat dengan <span className="text-red-500">♥</span> untuk pebisnis Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
