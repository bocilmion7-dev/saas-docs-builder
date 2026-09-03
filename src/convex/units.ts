import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("units").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});

export const create = mutation({
  args: { tenantId: v.string(), name: v.string(), symbol: v.string() },
  handler: async (ctx, args) => ctx.db.insert("units", { ...args, createdAt: Date.now() }),
});

export const remove = mutation({
  args: { id: v.id("units") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
