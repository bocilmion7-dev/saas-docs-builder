import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Vouchers ──
export const listVouchers = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("vouchers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createVoucher = mutation({
  args: { tenantId: v.string(), code: v.string(), type: v.string(), value: v.number(), minPurchase: v.number(), maxDiscount: v.optional(v.number()), quota: v.number(), startDate: v.optional(v.number()), endDate: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.insert("vouchers", { ...args, usedCount: 0, isActive: true, createdAt: Date.now() }),
});
export const updateVoucher = mutation({
  args: { id: v.id("vouchers"), isActive: v.optional(v.boolean()), quota: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ isActive: args.isActive, quota: args.quota }).filter(([, v]) => v !== undefined))),
});
export const removeVoucher = mutation({ args: { id: v.id("vouchers") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Loyalty Programs ──
export const listLoyaltyPrograms = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("loyaltyPrograms").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createLoyaltyProgram = mutation({
  args: { tenantId: v.string(), name: v.string(), type: v.string(), threshold: v.number(), rewardDescription: v.string() },
  handler: async (ctx, args) => ctx.db.insert("loyaltyPrograms", { ...args, isActive: true, createdAt: Date.now() }),
});
export const updateLoyaltyProgram = mutation({
  args: { id: v.id("loyaltyPrograms"), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ isActive: args.isActive }).filter(([, v]) => v !== undefined))),
});
export const removeLoyaltyProgram = mutation({ args: { id: v.id("loyaltyPrograms") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Loyalty Transactions ──
export const listLoyaltyTransactions = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("loyaltyTransactions").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createLoyaltyTransaction = mutation({
  args: { tenantId: v.string(), customerId: v.string(), type: v.string(), points: v.number(), referenceType: v.optional(v.string()), referenceId: v.optional(v.string()), note: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("loyaltyTransactions", { ...args, createdAt: Date.now() }),
});
