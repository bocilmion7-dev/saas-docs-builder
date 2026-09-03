import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("brands").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.name.toLowerCase().includes(s)); }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: { tenantId: v.string(), name: v.string(), logoUrl: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("brands", { ...args, createdAt: Date.now() }),
});

export const update = mutation({
  args: { id: v.id("brands"), name: v.optional(v.string()), logoUrl: v.optional(v.string()) },
  handler: async (ctx, args) => { const { id, ...f } = args; return ctx.db.patch(id, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined))); },
});

export const remove = mutation({
  args: { id: v.id("brands") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
