import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.optional(v.string()), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("categories").fullTableScan();
    if (args.tenantId) {
      q = ctx.db.query("categories").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId!));
    }
    const all = await q.collect();
    if (args.type) return all.filter((r) => r.type === args.type);
    return all;
  },
});

export const create = mutation({
  args: {
    tenantId: v.string(),
    name: v.string(),
    slug: v.string(),
    type: v.string(),
    parentId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("categories", { ...args, createdAt: Date.now() }),
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
