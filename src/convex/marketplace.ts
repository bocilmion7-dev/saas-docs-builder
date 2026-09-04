import { query } from "./_generated/server";
import { v } from "convex/values";

// ── Marketplace publik — landing e-commerce (produk semua tenant) ──────────
// Mengembalikan toko aktif/trialing + produk aktifnya (maks. perStore per toko),
// plus ringkasan jumlah toko/produk/kategori untuk statistik hero.

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
      return summarize(active, stores, args.category);
    }
    const stores = await buildStores(ctx, active, perStore, args.search);
    return summarize(active, stores);
  },
});

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
      products: products
        .slice(0, perStore)
        .map((p: any) => ({
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

function summarize(active: any[], stores: any[], category?: string) {
  const allProducts = stores.flatMap((s) => s.products);
  const categories = new Map<string, { label: string; count: number }>();
  for (const t of active) {
    const cur = categories.get(t.category) ?? { label: t.category, count: 0 };
    cur.count += 1;
    categories.set(t.category, cur);
  }
  return {
    stores,
    featuredProducts: allProducts
      .slice(0, 24)
      .map((p) => {
        const store = stores.find((s) => s.products.includes(p));
        return { ...p, storeName: store?.name, subdomain: store?.subdomain, storeCategory: store?.category, primaryColor: store?.primaryColor };
      }),
    stats: {
      totalStores: active.length,
      totalProducts: allProducts.length,
      totalCategories: categories.size,
      categoryFilter: category ?? null,
    },
  };
}