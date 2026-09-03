# 🚀 Cara Menjalankan Project — TokoBuilder AI

Multi-tenant SaaS pembuat toko online + dashboard tenant dengan **10 kategori bisnis**
(cafe, restoran, toko_retail, bengkel, bakery, toko_cat, spa, toko_sparepart, toko_kain, toko_pakaian).
Stack: **React + Vite + TypeScript + Convex (backend/DB) + Convex Auth + Tailwind + shadcn/ui + Bun**.

---

## 1. Prasyarat
- **Node.js** 20+ dan **Bun** 1.x (disarankan) — atau npm/pnpm
- Akun **Convex** (gratis) di https://convex.dev

## 2. Install
```bash
bun install
# atau: npm install
```

## 3. Konfigurasi Convex
Buat project Convex baru, lalu set URL-nya:

1. `npx convex dev` (pertama kali akan login & membuat project)
2. Set URL project ke frontend — buat file `.env.local` (jangan di-commit):
```
VITE_CONVEX_URL=https://<nama-project>.convex.cloud
```
3. Jalankan dev server:
```bash
bunx convex dev          # backend Convex (mode dev, biarkan berjalan)
bun run dev              # frontend Vite (biasanya http://localhost:5173)
```

> 📌 Di environment **Freebuff/Vly**, dev server & Convex sudah dikelola otomatis — cukup edit file, preview langsung ter-update. Jangan ubah `vite.config.ts` (HMR sengaja dimatikan: `server.hmr: false`).

## 4. API Keys & Kredensial
> Jangan pernah menyimpan key di file source. Di Freebuff: isi lewat **Keys/API keys** project. Untuk self-host: pakai env/`.env.local`.

| Key | Untuk | Diisi di |
|---|---|---|
| `MIDTRANS_SERVER_KEY` + `MIDTRANS_CLIENT_KEY` | Pembayaran online (Snap) | Platform Settings → Midtrans |
| `RAJAONGKIR_API_KEY` | Cek ongkir JNE/J&T/SiCepat | Platform Settings → RajaOngkir |

- **Webhook Midtrans** (aktivasi pembayaran otomatis): isi `https://<nama-project>.convex.site/midtrans-notification` di Dashboard Midtrans → Settings → Configuration → Payment Notification URL.
- Semua setting platform diubah dari halaman **`/platform/settings`** (Super Admin).

## 5. Akun & Seed Demo
Login pakai **email + OTP** (kode 6 digit dikirim ke email). Khusus admin ada **halaman login tersembunyi**:

```
URL      : /platform-login   (email + password, tanpa OTP)
Admin    : admin@tokobuilder.id  /  TokoBuilder@2026
```

Demo tenant (1 per kategori, subdomain diakses via `?sub=<slug>` atau `<slug>.tokobuilder.id`):

| Email | Toko | Subdomain |
|---|---|---|
| cafe@tokobuilder.id | Kopi Senja | kopisenja |
| restoran@tokobuilder.id | Ayam Goreng Mantap | ayamgorengmantap |
| retail@tokobuilder.id | Minimart Jaya | minimartjaya |
| bakery@tokobuilder.id | Roti Enak | rotienak |
| cat@tokobuilder.id | Jaya Cat | jayacat |
| spa@tokobuilder.id | Luxury Spa Bali | luxuryspa-bali |
| bengkel@tokobuilder.id | Bengkel Jaya | bengkeljaya |
| sparepart@tokobuilder.id | Sparepart Murah | sparepart-murah |
| kain@tokobuilder.id | Kain Batik Jaya | kain-batik-jaya |
| pakaian@tokobuilder.id | Fashion Jaya | fashionjaya |

Seed data dummy: buka **`/seed`** → klik *Seed Semua Demo Data* (atau *Seed Toko Pakaian* untuk tenant ke-10 saja — idempotent).

## 6. Alur utama
```
Landing / → Daftar (wizard: akun → toko → pilih kategori → template → review)
→ /dashboard (menu per kategori otomatis)
→ storefront: /store?sub=fashionjaya → pilih produk → ukuran/warna → checkout
→ pembayaran ONLINE (Midtrans Snap) / OFFLINE (COD / Payment WhatsApp tenant)
→ webhook Midtrans → order otomatis "Dibayar" + stok varian terpotong
```

Admin platform: `/platform` → Analytics, Tenants, Plans, Features, Templates, Landing Editor, Settings, Audit.

## 7. Verifikasi & Struktur
```bash
bunx convex dev --once    # deploy/typecheck backend Convex
bunx tsc -b --noEmit      # typecheck TypeScript
```

```
src/
├── convex/        # Backend: schema (108 tabel), API per kategori, auth, seed, webhook
├── pages/         # Landing, Auth, Dashboard, Storefront, Platform Admin
├── components/    # UI (shadcn/ui) + layout
├── hooks/         # use-tenant, use-auth
├── lib/           # Model konten landing, config
└── config/        # Menu sidebar per kategori
```

## 8. Catatan produksi
- Wildcard DNS `*.tokobuilder.id` → deploy Vercel/Cloudflare + set `PLATFORM_DOMAIN` di Platform Settings.
- Ganti kredensial admin default & pindahkan ke env sebelum produksi.
- Midtrans/RAJAONNGKIR aktif setelah key diisi di `/platform/settings`.