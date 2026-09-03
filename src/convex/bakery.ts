import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Production Plans ──
export const listPlans = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("productionPlans").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createPlan = mutation({
  args: { tenantId: v.string(), planDate: v.number(), type: v.string(), status: v.string(), notes: v.optional(v.string()), assignedTo: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("productionPlans", { ...args, createdAt: Date.now() }),
});
export const updatePlanStatus = mutation({
  args: { id: v.id("productionPlans"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Production Batches ──
export const listBatches = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("productionBatches").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createBatch = mutation({
  args: { tenantId: v.string(), planId: v.optional(v.string()), productId: v.string(), batchSize: v.number(), status: v.string(), proofingTemp: v.optional(v.number()), proofingHumidity: v.optional(v.number()), bakingTemp: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.insert("productionBatches", { ...args, startedAt: Date.now(), createdAt: Date.now() }),
});
export const updateBatchStatus = mutation({
  args: { id: v.id("productionBatches"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status, ...(args.status === "completed" ? { completedAt: Date.now() } : {}) }),
});

// ── QC Logs ──
export const listQcLogs = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("productionQcLogs").collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createQcLog = mutation({
  args: { tenantId: v.string(), batchId: v.string(), checkType: v.string(), result: v.string(), notes: v.optional(v.string()), checkedBy: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("productionQcLogs", { ...args, createdAt: Date.now() }),
});

// ── Display Counters ──
export const listCounters = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("displayCounters").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createCounter = mutation({
  args: { tenantId: v.string(), name: v.string(), type: v.string(), temperatureTarget: v.number(), status: v.string() },
  handler: async (ctx, args) => ctx.db.insert("displayCounters", { ...args, createdAt: Date.now() }),
});
export const updateCounter = mutation({
  args: { id: v.id("displayCounters"), status: v.optional(v.string()), temperatureTarget: v.optional(v.number()) },
  handler: async (ctx, args) => { const { id, ...f } = args; return ctx.db.patch(id, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined))); },
});

// ── Custom Cake Orders ──
export const listCustomCakes = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("customCakeOrders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createCustomCake = mutation({
  args: { tenantId: v.string(), customerId: v.optional(v.string()), cakeType: v.string(), size: v.string(), flavor: v.string(), filling: v.optional(v.string()), decoration: v.optional(v.string()), mockupUrl: v.optional(v.string()), priceEstimated: v.number(), deposit50Percent: v.number(), deadline: v.number() },
  handler: async (ctx, args) => ctx.db.insert("customCakeOrders", { ...args, depositStatus: "pending", status: "confirmed", createdAt: Date.now() }),
});
export const updateCustomCakeStatus = mutation({
  args: { id: v.id("customCakeOrders"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Bakery Waste ──
export const listBakeryWaste = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("bakeryWasteLogs").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createBakeryWaste = mutation({
  args: { tenantId: v.string(), productId: v.optional(v.string()), reason: v.string(), disposalMethod: v.string(), qty: v.number(), unit: v.string(), note: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("bakeryWasteLogs", { ...args, createdAt: Date.now() }),
});

// ── Display Counter Items ──
export const listCounterItems = query({
  args: { tenantId: v.string(), counterId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.counterId) {
      return (await ctx.db.query("displayCounterItems").withIndex("by_counter", (q) => q.eq("counterId", args.counterId!)).collect()).sort((a, b) => a.position?.localeCompare(b.position ?? "") ?? 0);
    }
    const all = await ctx.db.query("displayCounterItems").collect();
    return all;
  },
});
export const addCounterItem = mutation({
  args: { counterId: v.string(), productId: v.string(), qtyDisplay: v.number(), position: v.optional(v.string()), expiresAt: v.number(), batchId: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("displayCounterItems", { ...args, createdAt: Date.now() }),
});
export const updateCounterItem = mutation({
  args: { id: v.id("displayCounterItems"), qtyDisplay: v.optional(v.number()), position: v.optional(v.string()), expiresAt: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ qtyDisplay: args.qtyDisplay, position: args.position, expiresAt: args.expiresAt }).filter(([, v]) => v !== undefined))),
});
export const removeCounterItem = mutation({
  args: { id: v.id("displayCounterItems") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

// ── Discount Rules ──
export const listDiscountRules = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("discountRules").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createDiscountRule = mutation({
  args: { tenantId: v.string(), name: v.string(), type: v.string(), value: v.number(), timeStart: v.optional(v.string()), timeEnd: v.optional(v.string()), minPurchase: v.number() },
  handler: async (ctx, args) => ctx.db.insert("discountRules", { ...args, isActive: true, createdAt: Date.now() }),
});
export const updateDiscountRule = mutation({
  args: { id: v.id("discountRules"), isActive: v.optional(v.boolean()), value: v.optional(v.number()), name: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ isActive: args.isActive, value: args.value, name: args.name }).filter(([, v]) => v !== undefined))),
});
export const removeDiscountRule = mutation({
  args: { id: v.id("discountRules") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
