import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Reserved subdomain words ─────────────────────────────────────────────────
const RESERVED = new Set([
  "www", "admin", "api", "platform", "mail", "app", "dashboard", "cdn",
  "storage", "mail", "ftp", "smtp", "pop", "imap", "ns1", "ns2", "dns",
  "test", "staging", "dev", "beta", "demo", "localhost", "status",
]);

const SUBDOMAIN_REGEX = /^[a-z0-9-]{3,20}$/;

// ── Check subdomain availability ────────────────────────────────────────────
export const checkSubdomain = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    const sub = args.subdomain.toLowerCase().trim();
    if (!SUBDOMAIN_REGEX.test(sub)) {
      return { available: false, reason: "Hanya huruf kecil, angka, dan strip. 3-20 karakter." };
    }
    if (RESERVED.has(sub)) {
      return { available: false, reason: "Subdomain ini tidak tersedia." };
    }
    const existing = await ctx.db
      .query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", sub))
      .first();
    if (existing) {
      return { available: false, reason: "Subdomain sudah digunakan." };
    }
    return { available: true, reason: "" };
  },
});

// ── Provision tenant (register) ─────────────────────────────────────────────
export const provision = mutation({
  args: {
    name: v.string(),
    subdomain: v.string(),
    category: v.union(
      v.literal("cafe"), v.literal("restoran"), v.literal("toko_retail"),
      v.literal("bengkel"), v.literal("bakery"), v.literal("toko_cat"),
      v.literal("spa"), v.literal("toko_sparepart"), v.literal("toko_kain"),
      v.literal("toko_pakaian"),
    ),
    ownerEmail: v.string(),
    ownerName: v.string(),
    planSlug: v.optional(v.string()),
    templateSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sub = args.subdomain.toLowerCase().trim();

    // Validate
    if (!SUBDOMAIN_REGEX.test(sub)) throw new Error("Invalid subdomain format");
    if (RESERVED.has(sub)) throw new Error("Subdomain reserved");

    const existing = await ctx.db
      .query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", sub))
      .first();
    if (existing) throw new Error("Subdomain already taken");

    const now = Date.now();

    // Get plan — jika DB belum di-seed, buat plan free otomatis agar registrasi selalu jalan
    const planSlug = args.planSlug ?? "free";
    let plan = await ctx.db
      .query("subscriptionPlans")
      .withIndex("by_slug", (q) => q.eq("slug", planSlug))
      .first();
    if (!plan) {
      const free = await ctx.db
        .query("subscriptionPlans")
        .withIndex("by_slug", (q) => q.eq("slug", "free"))
        .first();
      if (free) {
        plan = free;
      } else {
        const now0 = Date.now();
        const created = await ctx.db.insert("subscriptionPlans", {
          name: "Free Trial", slug: "free", priceMonthly: 0, priceYearly: 0,
          trialDaysDefault: 14, maxProducts: 20, maxStaff: 1, maxTransactionsMonth: 50,
          isActive: true, createdAt: now0,
        });
        plan = { _id: created as any, trialDaysDefault: 14 } as any;
      }
    }
    if (!plan) throw new Error("Invalid plan");

    // Owner harus terdaftar sebagai user (baru daftar via OTP / sudah login)
    const userByEmail = await ctx.db.query("users")
      .withIndex("email", (q) => q.eq("email", args.ownerEmail))
      .first();
    if (!userByEmail) throw new Error("Akun tidak ditemukan. Silakan login dulu sebelum membuat toko.");

    // Template terpilih → activeTemplateId + warna sesuai template
    let activeTemplateId: string | undefined;
    let primaryColor = "#8B4513";
    if (args.templateSlug) {
      const tpl = await ctx.db.query("templates").filter((q) =>
        q.and(q.eq(q.field("slug"), args.templateSlug!), q.eq(q.field("category"), args.category))
      ).first();
      if (tpl) {
        activeTemplateId = tpl._id as any;
        const cfg = (tpl as any).configJson;
        if (cfg && typeof cfg === "object") {
          const colors = (cfg as any).colors;
          if (Array.isArray(colors) && colors.length > 0) primaryColor = String(colors[0]);
        }
      }
    }

    // Create tenant
    const tenantId = await ctx.db.insert("tenants", {
      name: args.name,
      subdomain: sub,
      category: args.category,
      status: "trialing",
      trialEndsAt: now + plan.trialDaysDefault * 24 * 60 * 60 * 1000,
      subscriptionPlanId: plan._id,
      activeTemplateId,
      settings: { taxPercent: 10, currency: "IDR", receiptFooter: "Terima kasih! Kunjungi kami lagi 😊" },
      storefrontConfig: { primaryColor, heroText: `Selamat Datang di ${args.name}` },
      createdAt: now,
      updatedAt: now,
    });

    // Create default warehouse
    const warehouseId = await ctx.db.insert("warehouses", {
      tenantId,
      name: "Gudang Utama",
      location: "Lantai 1",
      type: "gudang_kering",
      createdAt: now,
    });

    // Seed default categories based on category
    const defaultCategories: Record<string, { name: string; slug: string }[]> = {
      cafe: [{ name: "Coffee", slug: "coffee" }, { name: "Non-Coffee", slug: "non-coffee" }, { name: "Food", slug: "food" }],
      restoran: [{ name: "Makanan", slug: "makanan" }, { name: "Minuman", slug: "minuman" }, { name: "Pendamping", slug: "pendamping" }],
      toko_retail: [{ name: "Fashion", slug: "fashion" }, { name: "Elektronik", slug: "elektronik" }, { name: "Aksesoris", slug: "aksesoris" }],
      bengkel: [{ name: "Servis Ringan", slug: "servis-ringan" }, { name: "Servis Sedang", slug: "servis-sedang" }, { name: "Servis Berat", slug: "servis-berat" }],
      bakery: [{ name: "Roti", slug: "roti" }, { name: "Kue", slug: "kue" }, { name: "Pastry", slug: "pastry" }],
      toko_cat: [{ name: "Cat Tembok", slug: "cat-tembok" }, { name: "Cat Kayu", slug: "cat-kayu" }, { name: "Thinner", slug: "thinner" }],
      spa: [{ name: "Massage", slug: "massage" }, { name: "Facial", slug: "facial" }, { name: "Body Scrub", slug: "body-scrub" }],
      toko_sparepart: [{ name: "Mesin", slug: "mesin" }, { name: "Kelistrikan", slug: "kelistrikan" }, { name: "Rem", slug: "rem" }],
      toko_kain: [{ name: "Katun", slug: "katun" }, { name: "Batik", slug: "batik" }, { name: "Denim", slug: "denim" }],
      toko_pakaian: [{ name: "Atasan", slug: "atasan" }, { name: "Bawahan", slug: "bawahan" }, { name: "Outerwear", slug: "outerwear" }, { name: "Dress", slug: "dress" }, { name: "Aksesoris", slug: "aksesoris" }],
    };
    const cats = defaultCategories[args.category] ?? defaultCategories.cafe;
    for (const c of cats) {
      await ctx.db.insert("categories", {
        tenantId,
        name: c.name,
        slug: c.slug,
        type: "product_category",
        createdAt: now,
      });
    }

    // Create roles
    const roleNames = ["Owner", "Manager", "Supervisor", "Kasir"];
    for (const name of roleNames) {
      await ctx.db.insert("roles", {
        tenantId,
        name,
        isSystem: true,
        createdAt: now,
      });
    }

    // Link owner (user yang baru daftar) ke tenant — sidebar langsung terisi setelah ini
    await ctx.db.patch(userByEmail._id, {
      tenantId,
      role: "Owner",
      name: args.ownerName,
      isActive: true,
    });

    return {
      tenantId,
      subdomain: sub,
      url: `https://${sub}.tokobuilder.id`,
      trialEndsAt: now + plan.trialDaysDefault * 24 * 60 * 60 * 1000,
    };
  },
});

// ── Get tenant by subdomain ─────────────────────────────────────────────────
export const getBySubdomain = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();
  },
});

// ── List tenants (admin) ────────────────────────────────────────────────────
export const list = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const offset = ((args.page ?? 1) - 1) * limit;
    let q = ctx.db.query("tenants").fullTableScan();
    const all = await q.collect();
    let results = all.sort((a, b) => b.createdAt - a.createdAt);
    if (args.status) results = results.filter((t) => t.status === args.status);
    if (args.category) results = results.filter((t) => t.category === args.category);
    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter((t) => t.name.toLowerCase().includes(s) || t.subdomain.includes(s));
    }
    const total = results.length;
    return { items: results.slice(offset, offset + limit), total, page: args.page ?? 1 };
  },
});

// ── Update tenant status (admin) ────────────────────────────────────────────
export const updateStatus = mutation({
  args: {
    id: v.id("tenants"),
    status: v.union(
      v.literal("trialing"), v.literal("active"), v.literal("past_due"),
      v.literal("expired"), v.literal("suspended"), v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) =>
    ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() }),
});

// ── Get storefront data (public) ────────────────────────────────────────────
export const getStorefront = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    const tenant = await ctx.db.query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();
    if (!tenant) return null;
    const tid = tenant._id;
    const categories = await ctx.db.query("categories")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
    const products = (await ctx.db.query("products")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect())
      .filter((p) => p.isActive)
      .map((p) => ({ _id: p._id, name: p.name, slug: p.slug, price: p.price, sku: p.sku, description: p.description, imageUrl: p.imageUrl, categoryId: p.categoryId, stockQuantity: p.stockQuantity }));

    // Category-specific storefront data
    let extra: any = {};
    const cat = tenant.category;

    if (cat === "cafe" || cat === "restoran") {
      const tables = await ctx.db.query("diningTables").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      const availableTables = tables.filter((t) => t.status === "available").length;
      extra = { tableCount: tables.length, availableTables, areas: [...new Set(tables.map((t) => t.area))] };
    }
    if (cat === "spa") {
      const rooms = await ctx.db.query("spaRooms").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      const therapists = await ctx.db.query("spaTherapists").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      extra = {
        rooms: rooms.map((r) => ({ name: r.name, type: r.type, status: r.status })),
        therapists: therapists.filter((t) => t.isAvailable).map((t) => ({ name: t.name, specialization: t.specialization, rating: t.rating })),
      };
    }
    if (cat === "bengkel") {
      const mechanics = await ctx.db.query("mechanics").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      extra = { mechanics: mechanics.filter((m) => m.isAvailable).map((m) => ({ name: m.name, specialization: m.specialization, rating: m.rating })) };
    }
    if (cat === "toko_sparepart") {
      const crossRefs = await ctx.db.query("partCrossReferences").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      extra = { crossReferences: crossRefs.map((r) => ({ oemNumber: r.oemNumber, aftermarketNumber: r.aftermarketNumber, brand: r.brand, type: r.type })) };
    }
    if (cat === "toko_kain") {
      const rolls = await ctx.db.query("fabricRolls").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      const remnants = await ctx.db.query("fabricRemnants").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      extra = {
        rolls: rolls.map((r) => ({ rollNumber: r.rollNumber, totalMeter: r.totalMeter, remainingMeter: r.remainingMeter, widthCm: r.widthCm })),
        remnants: remnants.map((r) => ({ barcode: r.barcode, meterRemaining: r.meterRemaining, price: r.price })),
      };
    }
    if (cat === "toko_pakaian") {
      const variants = await ctx.db.query("productVariants").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      extra = {
        sizeGuide: ["XS", "S", "M", "L", "XL", "XXL"],
        variantsAvailable: variants.length,
        readyToShip: variants.filter((v) => v.stockQuantity > 0).length,
      };
    }
    if (cat === "bakery") {
      const counters = await ctx.db.query("displayCounters").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      extra = { displayCounters: counters.map((c) => ({ name: c.name, type: c.type, status: c.status })) };
    }
    if (cat === "toko_cat") {
      const formulas = await ctx.db.query("colorFormulas").withIndex("by_tenant", (q) => q.eq("tenantId", tid)).collect();
      extra = { colorFormulas: formulas.map((f) => ({ colorCode: f.colorCode, colorName: f.colorName, brand: f.brand, finish: f.finish })) };
    }

    return {
      tenant: {
        name: tenant.name, category: tenant.category, logoUrl: tenant.logoUrl,
        address: tenant.address, phone: tenant.phone, storefrontConfig: tenant.storefrontConfig,
        // Payment Action (dikonfigurasi tenant di dashboard):
        // "midtrans" = bayar online via Midtrans, "whatsapp" = direct ke WhatsApp tenant
        paymentAction: (tenant.settings as any)?.paymentAction ?? "midtrans",
        paymentWhatsappNumber: (tenant.settings as any)?.paymentWhatsappNumber || tenant.phone || "",
      },
      categories: categories.map((c) => ({ _id: c._id, name: c.name, slug: c.slug })),
      products,
      extra,
    };
  },
});

// ── Update tenant profile (tenant owner) ─────────────────────────────────────
export const updateProfile = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    cityId: v.optional(v.number()),
    settings: v.optional(v.any()),
    storefrontConfig: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id as any);
    if (!doc || !('subdomain' in doc)) throw new Error("Tenant not found");
    const { id, ...fields } = args;
    const clean: Record<string, any> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) {
        // Merge settings / storefrontConfig instead of replacing wholesale
        if (k === "settings" || k === "storefrontConfig") {
          clean[k] = { ...((doc as any)[k] ?? {}), ...val };
        } else {
          clean[k] = val;
        }
      }
    }
    clean.updatedAt = Date.now();
    await ctx.db.patch(doc._id, clean);
  },
});

// ── Get tenant by ID ────────────────────────────────────────────────────────
export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id as any);
    if (doc && 'subdomain' in doc && 'category' in doc) {
      return doc as { _id: any; name: string; subdomain: string; category: string; status: string; trialEndsAt: number; subscriptionPlanId?: string; logoUrl?: string; address?: string; phone?: string; email?: string; cityId?: number; settings?: any; activeTemplateId?: string; storefrontConfig?: any; createdAt: number; updatedAt: number; };
    }
    return null;
  },
});


// ── Stats ───────────────────────────────────────────────────────────────────
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("tenants").fullTableScan().collect();
    return {
      total: all.length,
      trialing: all.filter((t) => t.status === "trialing").length,
      active: all.filter((t) => t.status === "active").length,
      expired: all.filter((t) => t.status === "expired").length,
      suspended: all.filter((t) => t.status === "suspended").length,
      byCategory: {
        cafe: all.filter((t) => t.category === "cafe").length,
        restoran: all.filter((t) => t.category === "restoran").length,
        toko_retail: all.filter((t) => t.category === "toko_retail").length,
        bengkel: all.filter((t) => t.category === "bengkel").length,
        bakery: all.filter((t) => t.category === "bakery").length,
        toko_cat: all.filter((t) => t.category === "toko_cat").length,
        spa: all.filter((t) => t.category === "spa").length,
        toko_sparepart: all.filter((t) => t.category === "toko_sparepart").length,
        toko_kain: all.filter((t) => t.category === "toko_kain").length,
        toko_pakaian: all.filter((t) => t.category === "toko_pakaian").length,
      },
    };
  },
});
