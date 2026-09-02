import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── SEED: Plans, Feature Flags, Templates, Roles, Permissions ──────────────

export const seedPlans = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const existing = await ctx.db.query("subscriptionPlans").collect();
    if (existing.length > 0) return "already seeded";

    const plans = [
      { name: "Free Trial", slug: "free", priceMonthly: 0, priceYearly: 0, trialDaysDefault: 14, maxProducts: 20, maxStaff: 1, maxTransactionsMonth: 50, isActive: true },
      { name: "Starter", slug: "starter", priceMonthly: 99000, priceYearly: 990000, trialDaysDefault: 14, maxProducts: 200, maxStaff: 5, maxTransactionsMonth: 1000, isActive: true },
      { name: "Pro", slug: "pro", priceMonthly: 199000, priceYearly: 1990000, trialDaysDefault: 14, maxProducts: 999999, maxStaff: 15, maxTransactionsMonth: 5000, isActive: true },
      { name: "Enterprise", slug: "enterprise", priceMonthly: 499000, priceYearly: 4990000, trialDaysDefault: 30, maxProducts: 999999, maxStaff: 999, maxTransactionsMonth: 999999, isActive: true },
    ];
    for (const p of plans) await ctx.db.insert("subscriptionPlans", { ...p, createdAt: now });
    return "plans seeded";
  },
});

export const seedFeatureFlags = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const existing = await ctx.db.query("featureFlags").collect();
    if (existing.length > 0) return "already seeded";

    const flags = [
      { key: "pos", name: "POS Kasir", categoryModule: "pos", isPaidDefault: false, isTrialAccessible: true },
      { key: "product_crud", name: "Manajemen Produk", categoryModule: "catalog", isPaidDefault: false, isTrialAccessible: true },
      { key: "category_crud", name: "Kategori", categoryModule: "catalog", isPaidDefault: false, isTrialAccessible: true },
      { key: "customer_crud", name: "Pelanggan", categoryModule: "catalog", isPaidDefault: false, isTrialAccessible: true },
      { key: "supplier_management", name: "Supplier", categoryModule: "inventory", isPaidDefault: false, isTrialAccessible: true },
      { key: "barcode_print", name: "Cetak Barcode", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
      { key: "thermal_print", name: "Thermal Print", categoryModule: "pos", isPaidDefault: true, isTrialAccessible: false },
      { key: "table_management", name: "Manajemen Meja", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
      { key: "reservation", name: "Reservasi", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
      { key: "kds", name: "Kitchen Display", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
      { key: "modifier", name: "Modifier Menu", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
      { key: "split_bill", name: "Split Bill", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
      { key: "bom", name: "BOM / Resep", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
      { key: "waste_management", name: "Manajemen Waste", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
      { key: "procurement", name: "Procurement PR/PO", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
      { key: "stock_opname", name: "Stock Opname", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
      { key: "loyalty", name: "Loyalty Program", categoryModule: "marketing", isPaidDefault: true, isTrialAccessible: false },
      { key: "report_daily", name: "Laporan Harian", categoryModule: "report", isPaidDefault: false, isTrialAccessible: true },
      { key: "report_finance", name: "Laporan Keuangan", categoryModule: "report", isPaidDefault: true, isTrialAccessible: false },
      { key: "cogs", name: "COGS / Food Cost", categoryModule: "report", isPaidDefault: true, isTrialAccessible: false },
      { key: "volume_calculator", name: "Volume Calculator", categoryModule: "cat_specific", isPaidDefault: true, isTrialAccessible: false },
      { key: "tinting_mixing", name: "Tinting & Mixing", categoryModule: "cat_specific", isPaidDefault: true, isTrialAccessible: false },
      { key: "color_formula", name: "Color Formula DB", categoryModule: "cat_specific", isPaidDefault: true, isTrialAccessible: false },
      { key: "spa_booking", name: "Booking Kalender", categoryModule: "spa_specific", isPaidDefault: true, isTrialAccessible: false },
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
      { key: "midtrans", name: "Midtrans Payment", categoryModule: "integration", isPaidDefault: false, isTrialAccessible: true },
      { key: "rajaongkir", name: "RajaOngkir", categoryModule: "integration", isPaidDefault: true, isTrialAccessible: false },
    ];
    for (const f of flags) await ctx.db.insert("featureFlags", { ...f, description: f.name, isActive: true, createdAt: now });
    return "feature flags seeded";
  },
});

export const seedTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const existing = await ctx.db.query("templates").collect();
    if (existing.length > 0) return "already seeded";

    const templates = [
      // Cafe
      { category: "cafe" as const, name: "Minimalist Coffee", slug: "cafe-minimalist", configJson: { theme: { primary: "#1a1a1a", secondary: "#d4a574", font: "Inter", radius: 8 }, sections: ["hero", "menu_grid", "promo_banner", "testimonials"] } },
      { category: "cafe" as const, name: "Warm Bakery", slug: "cafe-warm", configJson: { theme: { primary: "#8B4513", secondary: "#D2691E", font: "Inter", radius: 12 }, sections: ["hero", "category_grid", "product_list", "cta"] } },
      { category: "cafe" as const, name: "Premium Lounge", slug: "cafe-premium", configJson: { theme: { primary: "#2d1b69", secondary: "#8b5cf6", font: "Inter", radius: 16 }, sections: ["hero", "service_list", "booking_form", "testimonials"] } },
      // Restoran
      { category: "restoran" as const, name: "Modern Dining", slug: "resto-modern", configJson: { theme: { primary: "#b91c1c", secondary: "#f59e0b", font: "Inter", radius: 8 }, sections: ["hero", "menu_grid", "table_layout", "reservation", "testimonials"] } },
      { category: "restoran" as const, name: "Traditional Warung", slug: "resto-warung", configJson: { theme: { primary: "#065f46", secondary: "#d97706", font: "Inter", radius: 6 }, sections: ["hero", "category_grid", "product_list", "cta"] } },
      { category: "restoran" as const, name: "Fine Dining", slug: "resto-fine", configJson: { theme: { primary: "#1c1917", secondary: "#b45309", font: "Inter", radius: 4 }, sections: ["hero", "service_list", "reservation", "testimonials"] } },
      // Retail
      { category: "toko_retail" as const, name: "Minimal Store", slug: "retail-minimal", configJson: { theme: { primary: "#0f172a", secondary: "#3b82f6", font: "Inter", radius: 8 }, sections: ["hero", "category_grid", "product_list", "promo_banner"] } },
      { category: "toko_retail" as const, name: "Supermarket", slug: "retail-super", configJson: { theme: { primary: "#15803d", secondary: "#f97316", font: "Inter", radius: 6 }, sections: ["hero", "category_grid", "product_list", "deal_of_day"] } },
      { category: "toko_retail" as const, name: "Fashion Boutique", slug: "retail-fashion", configJson: { theme: { primary: "#be185d", secondary: "#ec4899", font: "Inter", radius: 12 }, sections: ["hero", "product_list", "testimonials", "cta"] } },
      // Toko Cat
      { category: "toko_cat" as const, name: "Color Studio", slug: "cat-color-studio", configJson: { theme: { primary: "#059669", secondary: "#10b981", font: "Inter", radius: 8 }, sections: ["hero", "color_visualizer", "product_list", "contractor_gallery"] } },
      { category: "toko_cat" as const, name: "Industrial Paint", slug: "cat-industrial", configJson: { theme: { primary: "#374151", secondary: "#6b7280", font: "Inter", radius: 4 }, sections: ["hero", "category_grid", "product_list", "catalog"] } },
      { category: "toko_cat" as const, name: "Contractor Pro", slug: "cat-contractor", configJson: { theme: { primary: "#1e40af", secondary: "#3b82f6", font: "Inter", radius: 6 }, sections: ["hero", "contractor_gallery", "service_list", "cta"] } },
      // Spa
      { category: "spa" as const, name: "Luxury Zen", slug: "spa-luxury-zen", configJson: { theme: { primary: "#1e293b", secondary: "#d4a373", font: "Inter", radius: 12 }, sections: ["hero", "service_list", "booking_form", "testimonials"] } },
      { category: "spa" as const, name: "Bali Retreat", slug: "spa-bali-retreat", configJson: { theme: { primary: "#065f46", secondary: "#d97706", font: "Inter", radius: 8 }, sections: ["hero", "service_list", "therapist_list", "membership"] } },
      { category: "spa" as const, name: "Modern Wellness", slug: "spa-modern", configJson: { theme: { primary: "#4c1d95", secondary: "#7c3aed", font: "Inter", radius: 16 }, sections: ["hero", "service_list", "room_gallery", "booking_form"] } },
      // Bakery
      { category: "bakery" as const, name: "Sweet Morning", slug: "bakery-sweet-morning", configJson: { theme: { primary: "#be185d", secondary: "#f472b6", font: "Inter", radius: 12 }, sections: ["hero", "display_counter", "product_list", "custom_cake_form"] } },
      { category: "bakery" as const, name: "Artisan Bread", slug: "bakery-artisan", configJson: { theme: { primary: "#92400e", secondary: "#d97706", font: "Inter", radius: 6 }, sections: ["hero", "product_list", "day_old_section", "testimonials"] } },
      { category: "bakery" as const, name: "Custom Cake Studio", slug: "bakery-cake-studio", configJson: { theme: { primary: "#7c3aed", secondary: "#a78bfa", font: "Inter", radius: 16 }, sections: ["hero", "custom_cake_form", "portfolio", "product_list"] } },
      // Bengkel
      { category: "bengkel" as const, name: "Auto Service Pro", slug: "bengkel-auto-pro", configJson: { theme: { primary: "#1e293b", secondary: "#ef4444", font: "Inter", radius: 6 }, sections: ["hero", "service_list", "vehicle_history", "booking_form"] } },
      { category: "bengkel" as const, name: "Quick Fix", slug: "bengkel-quick-fix", configJson: { theme: { primary: "#1d4ed8", secondary: "#3b82f6", font: "Inter", radius: 8 }, sections: ["hero", "service_list", "testimonials", "cta"] } },
      { category: "bengkel" as const, name: "Premium Garage", slug: "bengkel-premium", configJson: { theme: { primary: "#171717", secondary: "#dc2626", font: "Inter", radius: 4 }, sections: ["hero", "service_list", "vehicle_history", "portfolio"] } },
      // Sparepart
      { category: "toko_sparepart" as const, name: "Part Finder", slug: "sparepart-finder", configJson: { theme: { primary: "#0369a1", secondary: "#0ea5e9", font: "Inter", radius: 6 }, sections: ["hero", "part_search_vin", "product_list", "cross_reference"] } },
      { category: "toko_sparepart" as const, name: "Garage Store", slug: "sparepart-garage", configJson: { theme: { primary: "#1e293b", secondary: "#f59e0b", font: "Inter", radius: 4 }, sections: ["hero", "category_grid", "product_list", "cta"] } },
      { category: "toko_sparepart" as const, name: "OEM Catalog", slug: "sparepart-oem", configJson: { theme: { primary: "#374151", secondary: "#10b981", font: "Inter", radius: 8 }, sections: ["hero", "cross_reference", "product_list", "warranty_info"] } },
      // Kain
      { category: "toko_kain" as const, name: "Batik Gallery", slug: "kain-batik-gallery", configJson: { theme: { primary: "#92400e", secondary: "#d97706", font: "Inter", radius: 8 }, sections: ["hero", "fabric_motif_gallery", "calculator", "remnants_section"] } },
      { category: "toko_kain" as const, name: "Textile Wholesale", slug: "kain-wholesale", configJson: { theme: { primary: "#0f172a", secondary: "#6366f1", font: "Inter", radius: 4 }, sections: ["hero", "product_list", "roll_info", "konveksi_form"] } },
      { category: "toko_kain" as const, name: "Fashion Fabric", slug: "kain-fashion", configJson: { theme: { primary: "#be185d", secondary: "#ec4899", font: "Inter", radius: 12 }, sections: ["hero", "fabric_motif_gallery", "calculator", "testimonials"] } },
    ];
    for (const t of templates) await ctx.db.insert("templates", { ...t, previewUrl: undefined, isActive: true, createdAt: now });
    return "templates seeded";
  },
});

export const seedRoles = mutation({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("roles").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    if (existing.length > 0) return "already seeded for this tenant";

    const roleNames = ["Owner", "Manager", "Supervisor", "Kasir", "Sales", "Gudang"];
    for (const name of roleNames) {
      await ctx.db.insert("roles", {
        tenantId: args.tenantId,
        name,
        isSystem: true,
        description: `Default ${name} role`,
        createdAt: now,
      });
    }
    return "roles seeded";
  },
});

export const seedPermissions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const existing = await ctx.db.query("permissions").collect();
    if (existing.length > 0) return "already seeded";

    const perms = [
      { key: "pos.create", name: "Buat Transaksi POS" },
      { key: "pos.void", name: "Void Transaksi" },
      { key: "pos.refund", name: "Refund" },
      { key: "product.create", name: "Tambah Produk" },
      { key: "product.update", name: "Edit Produk" },
      { key: "product.delete", name: "Hapus Produk" },
      { key: "product.view", name: "Lihat Produk" },
      { key: "category.crud", name: "Kelola Kategori" },
      { key: "customer.crud", name: "Kelola Pelanggan" },
      { key: "supplier_management", name: "Kelola Supplier" },
      { key: "procurement.create", name: "Buat PR/PO" },
      { key: "stock_opname.create", name: "Stock Opname" },
      { key: "stock_adjustment.create", name: "Adjustment Stok" },
      { key: "barcode_print", name: "Cetak Barcode" },
      { key: "thermal_print", name: "Thermal Print" },
      { key: "report.daily.view", name: "Laporan Harian" },
      { key: "report.finance.view", name: "Laporan Keuangan" },
      { key: "cogs.view", name: "Lihat COGS" },
      { key: "waste.create", name: "Catat Waste" },
      { key: "table_management", name: "Manajemen Meja" },
      { key: "reservation.create", name: "Buat Reservasi" },
      { key: "kds.view", name: "Kitchen Display" },
      { key: "split_bill", name: "Split Bill" },
      { key: "volume_calculator", name: "Volume Calculator" },
      { key: "tinting_mix", name: "Tinting Mixing" },
      { key: "spa_booking.create", name: "Booking Spa" },
      { key: "therapist_management", name: "Manajemen Therapist" },
      { key: "membership.create", name: "Membership" },
      { key: "recipe_bom.create", name: "Recipe BOM" },
      { key: "production_plan.create", name: "Production Plan" },
      { key: "custom_cake.create", name: "Custom Cake" },
      { key: "vehicle_db.create", name: "Vehicle Database" },
      { key: "work_order.create", name: "Work Order" },
      { key: "job_card.create", name: "Job Card" },
      { key: "part_compatibility.create", name: "Part Compatibility" },
      { key: "vin_lookup", name: "VIN Lookup" },
      { key: "fabric_roll.create", name: "Fabric Roll" },
      { key: "fabric_cutting.create", name: "Fabric Cutting" },
      { key: "obras.create", name: "Obras Service" },
      { key: "konveksi_b2b.create", name: "Konveksi B2B" },
      { key: "settings.edit", name: "Edit Pengaturan" },
      { key: "user.manage", name: "Kelola User" },
    ];
    for (const p of perms) await ctx.db.insert("permissions", { ...p, createdAt: now });
    return "permissions seeded";
  },
});

// ─── SEED ALL ───────────────────────────────────────────────────────────────

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results: string[] = [];

    // Plans
    const existingPlans = await ctx.db.query("subscriptionPlans").collect();
    if (existingPlans.length === 0) {
      const now = Date.now();
      const plans = [
        { name: "Free Trial", slug: "free", priceMonthly: 0, priceYearly: 0, trialDaysDefault: 14, maxProducts: 20, maxStaff: 1, maxTransactionsMonth: 50, isActive: true },
        { name: "Starter", slug: "starter", priceMonthly: 99000, priceYearly: 990000, trialDaysDefault: 14, maxProducts: 200, maxStaff: 5, maxTransactionsMonth: 1000, isActive: true },
        { name: "Pro", slug: "pro", priceMonthly: 199000, priceYearly: 1990000, trialDaysDefault: 14, maxProducts: 999999, maxStaff: 15, maxTransactionsMonth: 5000, isActive: true },
        { name: "Enterprise", slug: "enterprise", priceMonthly: 499000, priceYearly: 4990000, trialDaysDefault: 30, maxProducts: 999999, maxStaff: 999, maxTransactionsMonth: 999999, isActive: true },
      ];
      for (const p of plans) await ctx.db.insert("subscriptionPlans", { ...p, createdAt: now });
      results.push("plans");
    }

    // Feature flags
    const existingFlags = await ctx.db.query("featureFlags").collect();
    if (existingFlags.length === 0) {
      const now = Date.now();
      const flags = [
        { key: "pos", name: "POS Kasir", categoryModule: "pos", isPaidDefault: false, isTrialAccessible: true },
        { key: "product_crud", name: "Manajemen Produk", categoryModule: "catalog", isPaidDefault: false, isTrialAccessible: true },
        { key: "customer_crud", name: "Pelanggan", categoryModule: "catalog", isPaidDefault: false, isTrialAccessible: true },
        { key: "supplier_management", name: "Supplier", categoryModule: "inventory", isPaidDefault: false, isTrialAccessible: true },
        { key: "thermal_print", name: "Thermal Print", categoryModule: "pos", isPaidDefault: true, isTrialAccessible: false },
        { key: "table_management", name: "Manajemen Meja", categoryModule: "cafe_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "bom", name: "BOM / Resep", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
        { key: "waste_management", name: "Waste Management", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
        { key: "procurement", name: "Procurement", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
        { key: "stock_opname", name: "Stock Opname", categoryModule: "inventory", isPaidDefault: true, isTrialAccessible: false },
        { key: "loyalty", name: "Loyalty Program", categoryModule: "marketing", isPaidDefault: true, isTrialAccessible: false },
        { key: "report_finance", name: "Laporan Keuangan", categoryModule: "report", isPaidDefault: true, isTrialAccessible: false },
        { key: "cogs", name: "COGS", categoryModule: "report", isPaidDefault: true, isTrialAccessible: false },
        { key: "volume_calculator", name: "Volume Calculator", categoryModule: "cat_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "tinting_mixing", name: "Tinting Mixing", categoryModule: "cat_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "spa_booking", name: "Booking Spa", categoryModule: "spa_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "membership", name: "Membership", categoryModule: "spa_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "custom_cake", name: "Custom Cake", categoryModule: "bakery_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "work_order", name: "Work Order", categoryModule: "bengkel_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "vin_lookup", name: "VIN Lookup", categoryModule: "sparepart_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "fabric_roll", name: "Fabric Roll", categoryModule: "kain_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "obras", name: "Obras Service", categoryModule: "kain_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "konveksi_b2b", name: "Konveksi B2B", categoryModule: "kain_specific", isPaidDefault: true, isTrialAccessible: false },
        { key: "midtrans", name: "Midtrans Payment", categoryModule: "integration", isPaidDefault: false, isTrialAccessible: true },
        { key: "rajaongkir", name: "RajaOngkir", categoryModule: "integration", isPaidDefault: true, isTrialAccessible: false },
      ];
      for (const f of flags) await ctx.db.insert("featureFlags", { ...f, description: f.name, isActive: true, createdAt: now });
      results.push("feature_flags");
    }

    // Permissions
    const existingPerms = await ctx.db.query("permissions").collect();
    if (existingPerms.length === 0) {
      const now = Date.now();
      const perms = [
        { key: "pos.create", name: "Buat Transaksi" },
        { key: "pos.void", name: "Void Transaksi" },
        { key: "pos.refund", name: "Refund" },
        { key: "product.create", name: "Tambah Produk" },
        { key: "product.update", name: "Edit Produk" },
        { key: "product.delete", name: "Hapus Produk" },
        { key: "product.view", name: "Lihat Produk" },
        { key: "category.crud", name: "Kelola Kategori" },
        { key: "customer.crud", name: "Kelola Pelanggan" },
        { key: "supplier_management", name: "Kelola Supplier" },
        { key: "report.daily.view", name: "Laporan Harian" },
        { key: "report.finance.view", name: "Laporan Keuangan" },
        { key: "settings.edit", name: "Edit Pengaturan" },
        { key: "user.manage", name: "Kelola User" },
      ];
      for (const p of perms) await ctx.db.insert("permissions", { ...p, createdAt: now });
      results.push("permissions");
    }

    return results.length > 0 ? `seeded: ${results.join(", ")}` : "all already seeded";
  },
});

// ─── GET / CHECK ─────────────────────────────────────────────────────────────

export const getPlans = query({
  args: {},
  handler: async (ctx) => ctx.db.query("subscriptionPlans").collect(),
});

export const getFeatureFlags = query({
  args: {},
  handler: async (ctx) => ctx.db.query("featureFlags").collect(),
});

export const getTemplatesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) =>
    ctx.db.query("templates").withIndex("by_category", (q) => q.eq("category", args.category as any)).collect(),
});

export const getAllTemplates = query({
  args: {},
  handler: async (ctx) => ctx.db.query("templates").collect(),
});

export const getRoles = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) =>
    ctx.db.query("roles").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});

export const getPermissions = query({
  args: {},
  handler: async (ctx) => ctx.db.query("permissions").collect(),
});
