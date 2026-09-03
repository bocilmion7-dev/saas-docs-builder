import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string(), search: v.optional(v.string()), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("customers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.type) results = results.filter((c) => c.type === args.type);
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.name.toLowerCase().includes(s) || (r.phone ?? "").includes(s)); }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: { tenantId: v.string(), name: v.string(), phone: v.optional(v.string()), email: v.optional(v.string()), address: v.optional(v.string()), type: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.insert("customers", { ...args, loyaltyPoints: 0, piutangTotal: 0, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: { id: v.id("customers"), name: v.optional(v.string()), phone: v.optional(v.string()), email: v.optional(v.string()), address: v.optional(v.string()), type: v.optional(v.string()), loyaltyPoints: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)));
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
