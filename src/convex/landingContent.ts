import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { DEFAULT_LANDING, mergeLanding } from "../lib/landingContent";

const LANDING_KEY = "landing";

/**
 * Get the platform landing page content.
 * Returns full content merged over defaults — safe to render even when
 * nothing has ever been saved (identical to the hardcoded landing).
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", LANDING_KEY))
      .first();
    return mergeLanding(row?.value as any);
  },
});

/** Check whether custom content has been saved (so the editor can show a "Reset" state). */
export const getRaw = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", LANDING_KEY))
      .first();
    return row?.value ?? null;
  },
});

/** Save (upsert) the whole landing content object. */
export const save = mutation({
  args: { content: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", LANDING_KEY))
      .first();
    const payload = mergeLanding(args.content);
    if (existing) {
      await ctx.db.patch(existing._id, { value: payload, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("platformSettings", { key: LANDING_KEY, value: payload, updatedAt: Date.now() });
    }
  },
});

/** Reset the landing content back to defaults. */
export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", LANDING_KEY))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value: DEFAULT_LANDING, updatedAt: Date.now() });
    }
  },
});
