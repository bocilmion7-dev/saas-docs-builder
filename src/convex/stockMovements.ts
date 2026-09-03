import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string(), type: v.optional(v.string()), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("stockMovements").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.type) results = results.filter((r) => (args.type === "in" ? r.qty > 0 : r.qty < 0));
    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter((r) => (r.note ?? "").toLowerCase().includes(s) || (r.referenceId ?? "").toLowerCase().includes(s));
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    tenantId: v.string(), productId: v.string(), type: v.string(), qty: v.number(),
    qtyBefore: v.number(), qtyAfter: v.number(), referenceType: v.optional(v.string()),
    referenceId: v.optional(v.string()), note: v.optional(v.string()), createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("stockMovements", { ...args, createdAt: Date.now() }),
});

// ── Stock Adjustment ────────────────────────────────────────────────────────
export const adjustStock = mutation({
  args: {
    tenantId: v.string(), productId: v.string(), type: v.string(), qty: v.number(),
    reason: v.string(), evidenceUrl: v.optional(v.string()), createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const product = await ctx.db.get(args.productId as any);
    if (!product || !('stockQuantity' in product)) throw new Error("Product not found");
    const qtyBefore = (product as any).stockQuantity;
    const qtyAfter = args.type === "add" ? qtyBefore + args.qty : qtyBefore - args.qty;
    if (qtyAfter < 0) throw new Error("Stok tidak boleh negatif");
    await ctx.db.patch(args.productId as any, { stockQuantity: qtyAfter, updatedAt: now });
    await ctx.db.insert("stockAdjustments", {
      tenantId: args.tenantId, productId: args.productId, type: args.type,
      qty: args.qty, reason: args.reason, evidenceUrl: args.evidenceUrl,
      status: "approved", createdBy: args.createdBy, createdAt: now,
    });
    await ctx.db.insert("stockMovements", {
      tenantId: args.tenantId, productId: args.productId,
      type: args.type === "add" ? "in_adjustment" : "out_adjustment",
      qty: args.type === "add" ? args.qty : -args.qty,
      qtyBefore, qtyAfter, referenceType: "stock_adjustment",
      note: args.reason, createdBy: args.createdBy, createdAt: now,
    });
    return { qtyBefore, qtyAfter };
  },
});

export const listAdjustments = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) =>
    ctx.db.query("stockAdjustments").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
