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
