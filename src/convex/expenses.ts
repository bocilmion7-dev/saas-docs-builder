import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("expenses").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.description.toLowerCase().includes(s)); }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: { tenantId: v.string(), categoryId: v.optional(v.string()), description: v.string(), amount: v.number(), createdBy: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("expenses", { ...args, date: Date.now(), createdAt: Date.now() }),
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
