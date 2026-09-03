import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("purchaseOrders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.status) results = results.filter((r) => r.status === args.status);
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    tenantId: v.string(), supplierId: v.string(), poNumber: v.string(), totalCost: v.number(),
    expectedDate: v.optional(v.number()), notes: v.optional(v.string()), createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("purchaseOrders", { ...args, status: "open", createdAt: Date.now() }),
});

export const updateStatus = mutation({
  args: { id: v.id("purchaseOrders"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});
