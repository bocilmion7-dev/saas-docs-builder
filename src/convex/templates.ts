import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { businessCategoryValidator } from "./schema";

export const list = query({
  args: { category: v.optional(businessCategoryValidator) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db.query("templates").withIndex("by_category", (q) => q.eq("category", args.category!)).collect();
    }
    return await ctx.db.query("templates").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    category: businessCategoryValidator,
    previewUrl: v.optional(v.string()),
    configJson: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("templates", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("templates"),
    name: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    configJson: v.optional(v.any()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
