import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("featureFlags").collect();
  },
});

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("featureFlags").withIndex("by_key", (q) => q.eq("key", args.key)).first();
    return all ?? null;
  },
});

export const create = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    categoryModule: v.string(),
    isPaidDefault: v.boolean(),
    isTrialAccessible: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("featureFlags", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("featureFlags"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

export const update = mutation({
  args: {
    id: v.id("featureFlags"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    categoryModule: v.optional(v.string()),
    isPaidDefault: v.optional(v.boolean()),
    isTrialAccessible: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("featureFlags") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
