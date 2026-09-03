import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Part Compatibility ──
export const listCompatibility = query({
  args: { tenantId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("partCompatibility").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.brand.toLowerCase().includes(s) || r.model.toLowerCase().includes(s)); }
    return results;
  },
});
export const createCompatibility = mutation({
  args: { tenantId: v.string(), productId: v.string(), brand: v.string(), model: v.string(), yearStart: v.number(), yearEnd: v.number(), engineType: v.optional(v.string()), vinPattern: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("partCompatibility", { ...args, createdAt: Date.now() }),
});
export const removeCompatibility = mutation({ args: { id: v.id("partCompatibility") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Cross References ──
export const listCrossReferences = query({
  args: { tenantId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("partCrossReferences").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.oemNumber.toLowerCase().includes(s) || r.aftermarketNumber.toLowerCase().includes(s) || r.brand.toLowerCase().includes(s)); }
    return results;
  },
});
export const createCrossReference = mutation({
  args: { tenantId: v.string(), productId: v.string(), oemNumber: v.string(), aftermarketNumber: v.string(), brand: v.string(), type: v.string() },
  handler: async (ctx, args) => ctx.db.insert("partCrossReferences", { ...args, createdAt: Date.now() }),
});
export const removeCrossReference = mutation({ args: { id: v.id("partCrossReferences") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Warranties ──
export const listWarranties = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("partWarranties").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createWarranty = mutation({
  args: { tenantId: v.string(), productId: v.string(), warrantyType: v.string(), durationMonths: v.number(), kmLimit: v.number() },
  handler: async (ctx, args) => ctx.db.insert("partWarranties", { ...args, createdAt: Date.now() }),
});

// ── Customer Returns ──
export const listReturns = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("customerReturnsSparepart").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createReturn = mutation({
  args: { tenantId: v.string(), orderId: v.string(), productId: v.string(), reason: v.string(), condition: v.string(), withinThreeDays: v.boolean(), refundMethod: v.string() },
  handler: async (ctx, args) => ctx.db.insert("customerReturnsSparepart", { ...args, status: "pending", createdAt: Date.now() }),
});
export const updateReturnStatus = mutation({
  args: { id: v.id("customerReturnsSparepart"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Pre-Orders ──
export const listPreOrders = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("preOrders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createPreOrder = mutation({
  args: { tenantId: v.string(), productId: v.string(), customerId: v.optional(v.string()), quantity: v.number(), depositPercent: v.number(), depositAmount: v.number(), estimatedArrival: v.number(), notes: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("preOrders", { ...args, status: "pending", createdAt: Date.now() }),
});
export const updatePreOrderStatus = mutation({
  args: { id: v.id("preOrders"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});
export const removePreOrder = mutation({
  args: { id: v.id("preOrders") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
