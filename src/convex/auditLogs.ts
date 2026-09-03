import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    tenantId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.tenantId) {
      const results = await ctx.db
        .query("auditLogs")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId!))
        .order("desc")
        .take(args.limit ?? 100);
      return results;
    }
    const results = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(args.limit ?? 100);
    return results;
  },
});

export const create = mutation({
  args: {
    tenantId: v.string(),
    userId: v.optional(v.string()),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
