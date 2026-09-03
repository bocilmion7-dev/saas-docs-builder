/**
 * Shared Landing Page content model.
 *
 * Used by:
 *  - src/convex/landingContent.ts  (persistence via platformSettings key "landing")
 *  - src/pages/platform/PlatformLanding.tsx (editor)
 *  - src/pages/Landing.tsx (rendering)
 *
 * Only plain serializable values live here (no React / Convex imports) so the
 * Convex backend can import the defaults safely.
 */

export const FEATURE_ICON_KEYS = [
  "layout", "zap", "chart", "shield", "globe", "card",
  "store", "package", "users", "truck", "tag", "bell",
] as const;
export type FeatureIconKey = (typeof FEATURE_ICON_KEYS)[number];

export const ACCENT_KEYS = ["terracotta", "emerald", "ocean", "violet", "rose", "amber"] as const;
export type AccentKey = (typeof ACCENT_KEYS)[number];

/** Accent presets — oklch values that override --primary/--ring/--chart-1..5. */
export const ACCENTS: Record<AccentKey, { label: string; swatch: string; vars: Record<string, string> }> = {
  terracotta: {
    label: "Terracotta (default)",
    swatch: "oklch(0.58 0.18 35)",
    vars: {
      "--primary": "oklch(0.58 0.18 35)",
      "--ring": "oklch(0.58 0.18 35)",
      "--chart-1": "oklch(0.58 0.18 35)",
      "--chart-2": "oklch(0.65 0.15 65)",
      "--chart-3": "oklch(0.5 0.12 200)",
      "--chart-4": "oklch(0.7 0.14 150)",
      "--chart-5": "oklch(0.6 0.16 310)",
    },
  },
  emerald: {
    label: "Emerald",
    swatch: "oklch(0.55 0.13 155)",
    vars: {
      "--primary": "oklch(0.55 0.13 155)",
      "--ring": "oklch(0.55 0.13 155)",
      "--chart-1": "oklch(0.55 0.13 155)",
      "--chart-2": "oklch(0.6 0.14 250)",
      "--chart-3": "oklch(0.65 0.12 75)",
      "--chart-4": "oklch(0.6 0.14 20)",
      "--chart-5": "oklch(0.55 0.13 300)",
    },
  },
  ocean: {
    label: "Ocean (biru)",
    swatch: "oklch(0.52 0.15 250)",
    vars: {
      "--primary": "oklch(0.52 0.15 250)",
      "--ring": "oklch(0.52 0.15 250)",
      "--chart-1": "oklch(0.52 0.15 250)",
      "--chart-2": "oklch(0.6 0.14 180)",
      "--chart-3": "oklch(0.6 0.14 300)",
      "--chart-4": "oklch(0.62 0.13 100)",
      "--chart-5": "oklch(0.55 0.12 30)",
    },
  },
  violet: {
    label: "Violet",
    swatch: "oklch(0.55 0.19 290)",
    vars: {
      "--primary": "oklch(0.55 0.19 290)",
      "--ring": "oklch(0.55 0.19 290)",
      "--chart-1": "oklch(0.55 0.19 290)",
      "--chart-2": "oklch(0.6 0.16 200)",
      "--chart-3": "oklch(0.7 0.14 80)",
      "--chart-4": "oklch(0.65 0.16 330)",
      "--chart-5": "oklch(0.58 0.14 250)",
    },
  },
  rose: {
    label: "Rose",
    swatch: "oklch(0.6 0.19 10)",
    vars: {
      "--primary": "oklch(0.6 0.19 10)",
      "--ring": "oklch(0.6 0.19 10)",
      "--chart-1": "oklch(0.6 0.19 10)",
      "--chart-2": "oklch(0.55 0.14 250)",
      "--chart-3": "oklch(0.62 0.15 300)",
      "--chart-4": "oklch(0.66 0.15 140)",
      "--chart-5": "oklch(0.6 0.12 45)",
    },
  },
  amber: {
    label: "Amber (kuning)",
    swatch: "oklch(0.68 0.14 75)",
    vars: {
      "--primary": "oklch(0.68 0.14 75)",
      "--ring": "oklch(0.68 0.14 75)",
      "--chart-1": "oklch(0.68 0.14 75)",
      "--chart-2": "oklch(0.55 0.15 250)",
      "--chart-3": "oklch(0.6 0.17 10)",
      "--chart-4": "oklch(0.6 0.15 155)",
      "--chart-5": "oklch(0.55 0.12 310)",
    },
  },
};

export interface LandingContent {
  brand: { name: string; logoText: string };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    titleAfter: string;
    subtitle: string;
    ctaLabel: string;
    secondaryEnabled: boolean;
    secondaryLabel: string;
  };
  stats: { value: string; label: string }[];
  categories: { title: string; subtitle: string };
  features: {
    title: string;
    subtitle: string;
    items: { icon: FeatureIconKey; title: string; desc: string }[];
  };
  steps: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  pricing: {
    title: string;
    subtitle: string;
    plans: {
      name: string;
      price: string;
      period: string;
      desc: string;
      features: string[];
      cta: string;
      highlighted: boolean;
    }[];
  };
  testimonials: {
    enabled: boolean;
    title: string;
    subtitle: string;
    items: { quote: string; author: string; role: string }[];
  };
  faq: {
    enabled: boolean;
    title: string;
    subtitle: string;
    items: { q: string; a: string }[];
  };
  ctaBanner: { title: string; subtitle: string; buttonLabel: string };
  footer: { contactEmail: string; copyright: string };
  theme: { accent: AccentKey };
}

export const DEFAULT_LANDING: LandingContent = {
  brand: { name: "TokoBuilder", logoText: "TB" },
  hero: {
    badge: "Platform SaaS #1 untuk Toko Online Indonesia",
    title: "Bangun Toko Online",
    highlight: "Profesional",
    titleAfter: "dalam Hitungan Menit",
    subtitle:
      "TokoBuilder AI adalah platform SaaS yang menyediakan generator toko online & dashboard tenant dengan 9 kategori bisnis — dari Cafe, Restoran, Retail, hingga Bengkel dan Spa — lengkap dengan POS, inventory, laporan, dan pembayaran terintegrasi.",
    ctaLabel: "Mulai Toko Gratis",
    secondaryEnabled: false,
    secondaryLabel: "",
  },
  stats: [
    { value: "9", label: "Kategori Bisnis" },
    { value: "27", label: "Template Premium" },
    { value: "310+", label: "Workflow Otomatis" },
    { value: "108", label: "Database Tables" },
  ],
  categories: {
    title: "9 Kategori Bisnis, Satu Platform",
    subtitle:
      "Pilih kategori bisnismu, pilih template, dan TokoBuilder akan otomatis menyiapkan seluruh modul — dari POS hingga laporan keuangan.",
  },
  features: {
    title: "Fitur Lengkap untuk Bisnismu",
    subtitle:
      "Dari POS kasir hingga laporan keuangan — semua yang kamu butuhkan untuk menjalankan toko modern.",
    items: [
      { icon: "layout", title: "27 Template Siap Pakai", desc: "3 template premium per kategori dengan customisasi warna, font, dan layout tanpa batas." },
      { icon: "zap", title: "POS Super Cepat", desc: "Transaksi <1 detik. Scan barcode kamera HP, cetak struk thermal 58/80mm, mode offline-ready." },
      { icon: "chart", title: "Dashboard Analitik", desc: "Laporan harian, COGS, peak hour, margin per SKU, inventory turnover, financial overview real-time." },
      { icon: "shield", title: "RBAC & Audit Log", desc: "12 role per kategori, 50+ permission, 2FA, PIN cepat POS, audit trail setiap aksi kritis." },
      { icon: "globe", title: "Multi-Tenant Subdomain", desc: "Setiap toko punya subdomain unik. Shared DB, isolated data, enterprise-grade." },
      { icon: "card", title: "Midtrans & RajaOngkir", desc: "Pembayaran QRIS/EDC/Transfer. Ongkir JNE/J&T/SiCepat instan. Webhook otomatis verifikasi." },
    ],
  },
  steps: {
    title: "4 Langkah Memulai",
    subtitle: "Dari pendaftaran hingga toko online aktif — prosesnya cepat dan mudah.",
    items: [
      { title: "Daftar & Pilih Kategori", desc: "Buat akun gratis dan pilih salah satu dari 9 kategori bisnis yang tersedia." },
      { title: "Pilih Template", desc: "Pilih 1 dari 3 template premium untuk kategori bisnismu. Kustomisasi warna & logo." },
      { title: "Atur Toko", desc: "Tambah produk, atur harga, siapkan POS, dan konfigurasi pengaturan toko." },
      { title: "Go Live!", desc: "Toko online kamu aktif di subdomain unik. Mulai terima pesanan dari pelanggan." },
    ],
  },
  pricing: {
    title: "Harga yang Pas untuk Bisnismu",
    subtitle: "Mulai gratis selama 14 hari. Upgrade kapan saja sesuai pertumbuhan bisnis.",
    plans: [
      {
        name: "Free Trial", price: "Gratis", period: "14 hari",
        desc: "Coba semua fitur dasar tanpa kartu kredit",
        features: ["20 Produk", "1 Staff", "50 Transaksi/bulan", "POS & Laporan Dasar"],
        cta: "Mulai Gratis", highlighted: false,
      },
      {
        name: "Starter", price: "Rp99K", period: "/bulan",
        desc: "Untuk bisnis baru yang ingin go digital",
        features: ["200 Produk", "5 Staff", "1.000 Transaksi/bulan", "POS, Barcode, Thermal Print", "Volume Calculator & Booking"],
        cta: "Pilih Starter", highlighted: false,
      },
      {
        name: "Pro", price: "Rp199K", period: "/bulan",
        desc: "Solusi lengkap untuk bisnis berkembang",
        features: ["Unlimited Produk", "15 Staff", "5.000 Transaksi/bulan", "Semua Fitur Kategori Spesifik", "BOM, Waste, COGS, Loyalty", "KDS, Split Bill, Membership"],
        cta: "Pilih Pro", highlighted: true,
      },
      {
        name: "Enterprise", price: "Custom", period: "",
        desc: "Untuk jaringan bisnis & franchise",
        features: ["Custom Domain", "Unlimited Semuanya", "Priority Support", "API Access", "Custom Integrasi"],
        cta: "Hubungi Kami", highlighted: false,
      },
    ],
  },
  testimonials: {
    enabled: true,
    title: "Dipercaya Pebisnis di Seluruh Indonesia",
    subtitle: "Ribuan pemilik toko sudah membangun bisnis online mereka bersama TokoBuilder.",
    items: [
      { quote: "Buka toko online + POS cuma butuh satu sore. Semua modul otomatis sesuai kategori kami.", author: "Rina Wijaya", role: "Owner — Kopi Senja, Bandung" },
      { quote: "Work order, job card, sampai reminder servis pelanggan — semua rapi dan otomatis.", author: "Hendra Gunawan", role: "Owner — Bengkel Jaya, Jakarta" },
      { quote: "Dari timbang roll sampai piutang konveksi, data grosir kain kami sekarang real-time.", author: "Sari Handayani", role: "Owner — Kain Batik Jaya, Yogyakarta" },
    ],
  },
  faq: {
    enabled: true,
    title: "Pertanyaan yang Sering Diajukan",
    subtitle: "Masih ragu? Ini jawaban untuk pertanyaan yang paling sering masuk.",
    items: [
      { q: "Apakah benar-benar gratis untuk memulai?", a: "Ya. Semua tenant baru mendapat trial 14 hari penuh tanpa kartu kredit. Setelah itu pilih paket yang paling cocok." },
      { q: "Apakah toko saya mendapat subdomain sendiri?", a: "Ya, setiap toko mendapat subdomain unik (contoh: namatoko.tokobuilder.id) yang langsung aktif setelah pendaftaran." },
      { q: "Bisakah mengganti kategori bisnis setelah mendaftar?", a: "Kategori menentukan modul dashboard yang aktif, jadi pilih dengan teliti saat pendaftaran. Anda bisa mendaftarkan toko kedua untuk kategori lain." },
      { q: "Metode pembayaran apa yang didukung?", a: "Midtrans: QRIS, Virtual Account, Bank Transfer, dan kartu kredit — plus COD untuk pengiriman lokal." },
    ],
  },
  ctaBanner: {
    title: "Siap Membangun Toko Online?",
    subtitle:
      "Mulai gratis selama 14 hari tanpa kartu kredit. Buat toko online profesional dengan fitur lengkap untuk 9 kategori bisnis.",
    buttonLabel: "Daftar Sekarang — Gratis",
  },
  footer: {
    contactEmail: "halo@tokobuilder.id",
    copyright: "TokoBuilder AI. Multi-tenant SaaS Online Store Platform.",
  },
  theme: { accent: "terracotta" },
};

/** Deep-enough merge: top-level sections fall back to defaults per field. */
export function mergeLanding(saved: Partial<LandingContent> | null | undefined): LandingContent {
  const s = saved ?? {};
  const text = (area: string) => (s as any)?.[area] ?? {};
  return {
    brand: { ...DEFAULT_LANDING.brand, ...(s.brand ?? {}) },
    hero: { ...DEFAULT_LANDING.hero, ...text("hero") },
    stats: Array.isArray(s.stats) && s.stats.length ? (s.stats as LandingContent["stats"]) : DEFAULT_LANDING.stats,
    categories: { ...DEFAULT_LANDING.categories, ...text("categories") },
    features: {
      ...DEFAULT_LANDING.features,
      ...text("features"),
      items: (s.features?.items?.length ? s.features.items : DEFAULT_LANDING.features.items) as LandingContent["features"]["items"],
    },
    steps: {
      ...DEFAULT_LANDING.steps,
      ...text("steps"),
      items: (s.steps?.items?.length ? s.steps.items : DEFAULT_LANDING.steps.items) as LandingContent["steps"]["items"],
    },
    pricing: {
      ...DEFAULT_LANDING.pricing,
      ...text("pricing"),
      plans: (s.pricing?.plans?.length ? s.pricing.plans : DEFAULT_LANDING.pricing.plans) as LandingContent["pricing"]["plans"],
    },
    testimonials: {
      ...DEFAULT_LANDING.testimonials,
      ...text("testimonials"),
      items: (s.testimonials?.items?.length ? s.testimonials.items : DEFAULT_LANDING.testimonials.items) as LandingContent["testimonials"]["items"],
    },
    faq: {
      ...DEFAULT_LANDING.faq,
      ...text("faq"),
      items: (s.faq?.items?.length ? s.faq.items : DEFAULT_LANDING.faq.items) as LandingContent["faq"]["items"],
    },
    ctaBanner: { ...DEFAULT_LANDING.ctaBanner, ...text("ctaBanner") },
    footer: { ...DEFAULT_LANDING.footer, ...text("footer") },
    theme: { ...DEFAULT_LANDING.theme, ...(s.theme ?? {}) },
  };
}
