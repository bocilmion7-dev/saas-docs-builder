import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Products ─────────────────────────────────────────────────────────────────

export const list = query({
  args: {
    tenantId: v.optional(v.string()),
    categoryId: v.optional(v.string()),
    search: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = ((args.page ?? 1) - 1) * limit;

    let q = ctx.db.query("products").fullTableScan();
    if (args.tenantId) {
      q = ctx.db.query("products").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId!));
    }
    const all = await q.collect();
    let results = all;

    if (args.categoryId) {
      results = results.filter((r) => r.categoryId === args.categoryId);
    }
    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.sku.toLowerCase().includes(s) ||
          (r.barcode ?? "").toLowerCase().includes(s),
      );
    }

    const total = results.length;
    const paginated = results.slice(offset, offset + limit);
    return { items: paginated, total, page: args.page ?? 1, pages: Math.ceil(total / limit) };
  },
});

export const create = mutation({
  args: {
    tenantId: v.string(),
    name: v.string(),
    slug: v.string(),
    price: v.number(),
    costPrice: v.number(),
    sku: v.string(),
    barcode: v.optional(v.string()),
    stockQuantity: v.number(),
    minStock: v.number(),
    categoryId: v.optional(v.string()),
    unitId: v.optional(v.string()),
    brandId: v.optional(v.string()),
    weightGram: v.optional(v.number()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("products", {
      ...args,
      weightGram: args.weightGram ?? 1000,
      isActive: true,
      updatedAt: now,
      createdAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    costPrice: v.optional(v.number()),
    barcode: v.optional(v.string()),
    stockQuantity: v.optional(v.number()),
    minStock: v.optional(v.number()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const cleaned = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    return ctx.db.patch(id, { ...cleaned, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return ctx.db.delete(args.id);
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});
