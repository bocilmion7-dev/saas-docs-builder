import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string(), type: v.optional(v.string()), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("suppliers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.type) results = results.filter((s) => s.type === args.type);
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.name.toLowerCase().includes(s) || (r.contactName ?? "").toLowerCase().includes(s)); }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: { tenantId: v.string(), name: v.string(), contactName: v.optional(v.string()), phone: v.optional(v.string()), email: v.optional(v.string()), address: v.optional(v.string()), type: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.insert("suppliers", { ...args, isApproved: true, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: { id: v.id("suppliers"), name: v.optional(v.string()), contactName: v.optional(v.string()), phone: v.optional(v.string()), email: v.optional(v.string()), address: v.optional(v.string()), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    return ctx.db.patch(id, clean);
  },
});

export const remove = mutation({
  args: { id: v.id("suppliers") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
