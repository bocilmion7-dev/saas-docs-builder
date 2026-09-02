/**
 * TokoBuilder AI — Subscription & Feature Gating
 *
 * Implements the SDOT spec logic:
 * - Plans: Free Trial, Starter (Rp99K), Pro (Rp199K), Enterprise
 * - Feature flags: 50+ keys with isPaidDefault + isTrialAccessible
 * - Gating: if trial expired & feature.is_trial_accessible=false → block
 */

export interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number;
  trialDaysDefault: number;
  maxProducts: number;
  maxStaff: number;
  maxTransactionsMonth: number;
}

export interface FeatureFlag {
  key: string;
  name: string;
  categoryModule: string;
  isPaidDefault: boolean;
  isTrialAccessible: boolean;
}

export interface TenantSubscription {
  planId: string;
  status: "trialing" | "active" | "past_due" | "expired" | "suspended" | "cancelled";
  trialEndsAt: number;
}

// ─── Plans (reference data) ────────────────────────────────────────────────

export const PLANS: Plan[] = [
  { id: "free", name: "Free Trial", slug: "free", priceMonthly: 0, priceYearly: 0, trialDaysDefault: 14, maxProducts: 20, maxStaff: 1, maxTransactionsMonth: 50 },
  { id: "starter", name: "Starter", slug: "starter", priceMonthly: 99000, priceYearly: 990000, trialDaysDefault: 14, maxProducts: 200, maxStaff: 5, maxTransactionsMonth: 1000 },
  { id: "pro", name: "Pro", slug: "pro", priceMonthly: 199000, priceYearly: 1990000, trialDaysDefault: 14, maxProducts: 999999, maxStaff: 15, maxTransactionsMonth: 5000 },
  { id: "enterprise", name: "Enterprise", slug: "enterprise", priceMonthly: 499000, priceYearly: 4990000, trialDaysDefault: 30, maxProducts: 999999, maxStaff: 999, maxTransactionsMonth: 999999 },
];

// ─── Feature Flags (reference data) ─────────────────────────────────────────

export const FEATURE_FLAGS: FeatureFlag[] = [
  // Free features
  { key: "pos", name: "POS Kasir", categoryModule: "pos", isPaidDefault: false, isTrialAccessible: true },
  { key: "product_crud", name: "Manajemen Produk", categoryModule: "catalog", isPaidDefault: false, isTrialAccessible: true },
  { key: "category_crud", name: "Kategori", categoryModule: "catalog", isPaidDefault: false, isTrialAccessible: true },
  { key: "customer_crud", name: "Pelanggan", categoryModule: "catalog", isPaidDefault: false, isTrialAccessible: true },
  { key: "supplier_management", name: "Supplier", categoryModule: "inventory", isPaidDefault: false, isTrialAccessible: true },
  { key: "report_daily", name: "Laporan Harian", categoryModule: "report", isPaidDefault: false, isTrialAccessible: true },
  { key: "midtrans", name: "Midtrans Payment", categoryModule: "integration", isPaidDefault: false, isTrialAccessible: true },

  // Paid features (locked during expired trial)
  { key: "thermal_print", name: "Thermal Print", categoryModule: "pos", isPaidDefault: true, isTrialAccessible: false },
  { key: "barcode_print", name: "Cetak Barcode", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
  { key: "table_management", name: "Manajemen Meja", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "reservation", name: "Reservasi", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "kds", name: "Kitchen Display", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "modifier", name: "Modifier Menu", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "split_bill", name: "Split Bill", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "bom", name: "BOM / Resep", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
  { key: "waste_management", name: "Waste Management", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
  { key: "procurement", name: "Procurement PR/PO", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
  { key: "stock_opname", name: "Stock Opname", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
  { key: "loyalty", name: "Loyalty Program", categoryModule: "marketing", isPaidDefault: true, isTrialAccessible: false },
  { key: "report_finance", name: "Laporan Keuangan", categoryModule: "report", isPaidDefault: true, isTrialAccessible: false },
  { key: "cogs", name: "COGS / Food Cost", categoryModule: "report", isPaidDefault: true, isTrialAccessible: false },
  { key: "volume_calculator", name: "Volume Calculator", categoryModule: "cat_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "tinting_mixing", name: "Tinting Mixing", categoryModule: "cat_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "color_formula", name: "Color Formula DB", categoryModule: "cat_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "spa_booking", name: "Booking Spa", categoryModule: "spa_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "therapist_management", name: "Manajemen Therapist", categoryModule: "spa_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "membership", name: "Membership", categoryModule: "spa_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "recipe_bom", name: "Recipe BOM", categoryModule: "bakery_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "production_plan", name: "Production Plan", categoryModule: "bakery_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "custom_cake", name: "Custom Cake", categoryModule: "bakery_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "vehicle_db", name: "Vehicle Database", categoryModule: "bengkel_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "work_order", name: "Work Order", categoryModule: "bengkel_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "job_card", name: "Job Card", categoryModule: "bengkel_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "qc_test_drive", name: "QC Test Drive", categoryModule: "bengkel_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "part_compatibility", name: "Part Compatibility", categoryModule: "sparepart_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "vin_lookup", name: "VIN Lookup", categoryModule: "sparepart_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "fabric_roll", name: "Fabric Roll Mgmt", categoryModule: "kain_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "fabric_cutting", name: "Fabric Cutting", categoryModule: "kain_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "obras", name: "Obras Service", categoryModule: "kain_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "konveksi_b2b", name: "Konveksi B2B", categoryModule: "kain_specific", isPaidDefault: true, isTrialAccessible: false },
  { key: "rajaongkir", name: "RajaOngkir", categoryModule: "integration", isPaidDefault: true, isTrialAccessible: false },
];

// ─── Core Gating Function ───────────────────────────────────────────────────

/**
 * Check if a tenant is allowed to access a feature.
 * Logic per SDOT spec Section 8:
 * 1. Look up the plan_features for the tenant's plan
 * 2. If the feature is not enabled for the plan → blocked
 * 3. If tenant status is "trialing":
 *    - If feature.isTrialAccessible=false AND isPaidDefault=true → blocked
 * 4. If tenant status is "expired" or "suspended" → block all paid features
 */
export function isFeatureAllowed(
  tenantStatus: TenantSubscription["status"],
  featureKey: string,
  enabledInPlan = true,
): { allowed: boolean; reason?: string; requiredPlan?: string } {
  const feature = FEATURE_FLAGS.find((f) => f.key === featureKey);
  if (!feature) return { allowed: true };

  // Plan doesn't include this feature
  if (!enabledInPlan) {
    return {
      allowed: false,
      reason: "Fitur ini tidak tersedia di plan Anda.",
      requiredPlan: feature.isPaidDefault ? "Pro" : "Starter",
    };
  }

  // Expired/suspended → block all paid features
  if ((tenantStatus === "expired" || tenantStatus === "suspended") && feature.isPaidDefault) {
    return {
      allowed: false,
      reason: "Trial telah berakhir. Upgrade untuk menggunakan fitur ini.",
      requiredPlan: "Pro",
    };
  }

  // Trial → check isTrialAccessible
  if (tenantStatus === "trialing" && feature.isPaidDefault && !feature.isTrialAccessible) {
    return {
      allowed: false,
      reason: "Fitur ini terkunci saat trial expired. Upgrade ke Pro.",
      requiredPlan: "Pro",
    };
  }

  return { allowed: true };
}

// ─── UI Helper: Filter sidebar menu by allowed features ─────────────────────

export function filterMenuByFeatures<T extends { featureKey?: string }>(
  menu: T[],
  tenantStatus: TenantSubscription["status"],
  planFeatureKeys: string[],
): T[] {
  return menu.filter((item) => {
    if (!item.featureKey) return true;
    const result = isFeatureAllowed(tenantStatus, item.featureKey, planFeatureKeys.includes(item.featureKey));
    return result.allowed;
  });
}

// ─── Format helpers ─────────────────────────────────────────────────────────

export function formatPrice(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export function getDaysRemaining(trialEndsAt: number): number {
  const now = Date.now();
  const diff = trialEndsAt - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getTrialBannerMessage(status: TenantSubscription["status"], trialEndsAt: number): string | null {
  if (status === "trialing") {
    const days = getDaysRemaining(trialEndsAt);
    if (days <= 3) return `Trial berakhir dalam ${days} hari. Upgrade sekarang!`;
    if (days <= 7) return `Sisa trial: ${days} hari. Nikmati semua fitur dasar.`;
  }
  if (status === "expired") return "Trial telah berakhir. Upgrade untuk melanjutkan.";
  if (status === "past_due") return "Pembayaran tertunda. Perpanjang subscription Anda.";
  if (status === "suspended") return "Akun ditangguhkan. Hubungi support.";
  return null;
}
