import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscriptionPlans").collect();
  },
});

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("subscriptionPlans").withIndex("by_slug", (q) => q.eq("slug", args.slug)).first();
    return all ?? null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    priceMonthly: v.number(),
    priceYearly: v.number(),
    trialDaysDefault: v.number(),
    maxProducts: v.number(),
    maxStaff: v.number(),
    maxTransactionsMonth: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptionPlans", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("subscriptionPlans"),
    name: v.optional(v.string()),
    priceMonthly: v.optional(v.number()),
    priceYearly: v.optional(v.number()),
    trialDaysDefault: v.optional(v.number()),
    maxProducts: v.optional(v.number()),
    maxStaff: v.optional(v.number()),
    maxTransactionsMonth: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("subscriptionPlans") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
