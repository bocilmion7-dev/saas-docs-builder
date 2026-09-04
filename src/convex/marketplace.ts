import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Marketplace publik — produk semua toko ─────────────────────────────────
export const getMarketplace = query({
  args: {
    perStore: v.optional(v.number()),
    search: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const perStore = args.perStore ?? 6;
    const tenants = await ctx.db.query("tenants").collect();
    const active = tenants.filter((t) => t.status === "trialing" || t.status === "active");
    if (args.category) {
      const filtered = active.filter((t) => t.category === args.category);
      const stores = await buildStores(ctx, filtered, perStore, args.search);
      return { stores };
    }
    const stores = await buildStores(ctx, active, perStore, args.search);
    return { stores };
  },
});

// ── Semua produk per kategori (halaman "Lihat Semua") ──────────────────────
export const categoryProducts = query({
  args: {
    category: v.string(),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const perPage = 24;
    const page = args.page ?? 1;
    const tenants = await ctx.db.query("tenants").collect();
    const storeMap = new Map<string, any>();
    for (const t of tenants) storeMap.set(t._id as any, t);

    let products: any[] = [];
    for (const t of tenants) {
      if (t.category !== args.category) continue;
      const prods = await ctx.db
        .query("products")
        .withIndex("by_tenant", (q: any) => q.eq("tenantId", t._id as any))
        .collect();
      for (const p of prods) {
        if (!p.isActive) continue;
        products.push({
          _id: p._id as any,
          name: p.name,
          slug: p.slug,
          price: p.price,
          sku: p.sku,
          description: p.description,
          imageUrl: p.imageUrl,
          stockQuantity: p.stockQuantity,
          storeName: t.name,
          subdomain: t.subdomain,
          storeCategory: t.category,
          primaryColor: (t.storefrontConfig as any)?.primaryColor ?? "#8B4513",
        });
      }
    }

    if (args.search) {
      const s = args.search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(s) || (p.sku ?? "").toLowerCase().includes(s));
    }

    products.sort((a, b) => a.name.localeCompare(b.name));
    const total = products.length;
    const totalPages = Math.ceil(total / perPage);
    return {
      products: products.slice((page - 1) * perPage, page * perPage),
      total,
      page,
      totalPages,
      category: args.category,
    };
  },
});

// ── Banners (promosi/iklan di marketplace) ─────────────────────────────────
export const listBanners = query({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("marketBanners" as any)
      .collect()
      .then((r: any[]) => r.sort((a: any, b: any) => a.sortOrder - b.sortOrder)),
});

export const getActiveBanners = query({
  args: {},
  handler: async (ctx) => {
    const all = await (ctx.db.query("marketBanners" as any).collect()) as any[];
    return all.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 5);
  },
});

export const createBanner = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    imageUrl: v.string(),
    linkUrl: v.optional(v.string()),
    bgColor: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("marketBanners" as any, { ...args, isActive: true, createdAt: Date.now() }),
});

export const updateBanner = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    bgColor: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id as any, Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)));
  },
});

export const deleteBanner = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => ctx.db.delete(args.id as any),
});

// ── Helpers ────────────────────────────────────────────────────────────────
async function buildStores(ctx: any, tenants: any[], perStore: number, search?: string) {
  const stores: any[] = [];
  for (const t of tenants) {
    let products = await ctx.db
      .query("products")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", t._id as any))
      .collect();
    products = products.filter((p: any) => p.isActive);
    if (products.length === 0) continue;
    if (search) {
      const s = search.toLowerCase();
      const matched = products.filter((p: any) => p.name.toLowerCase().includes(s) || (p.sku ?? "").toLowerCase().includes(s));
      if (matched.length === 0 && !t.name.toLowerCase().includes(s) && !t.subdomain.includes(s)) continue;
      products = matched.length > 0 ? matched : products;
    }
    stores.push({
      _id: t._id as any,
      name: t.name,
      subdomain: t.subdomain,
      category: t.category,
      logoUrl: t.logoUrl,
      primaryColor: (t.storefrontConfig as any)?.primaryColor ?? "#8B4513",
      productCount: products.length,
      products: products.slice(0, perStore).map((p: any) => ({
        _id: p._id as any,
        name: p.name,
        slug: p.slug,
        price: p.price,
        sku: p.sku,
        description: p.description,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
        stockQuantity: p.stockQuantity,
      })),
    });
  }
  return stores;
}