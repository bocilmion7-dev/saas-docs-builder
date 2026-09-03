import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Fabric Rolls ──
export const listRolls = query({
  args: { tenantId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("fabricRolls").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.rollNumber.toLowerCase().includes(s)); }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});
export const createRoll = mutation({
  args: { tenantId: v.string(), productId: v.string(), rollNumber: v.string(), totalMeter: v.number(), widthCm: v.number(), warehouseId: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("fabricRolls", { ...args, remainingMeter: args.totalMeter, createdAt: Date.now() }),
});
export const updateRoll = mutation({
  args: { id: v.id("fabricRolls"), remainingMeter: v.optional(v.number()) },
  handler: async (ctx, args) => { const { id, ...f } = args; return ctx.db.patch(id, f); },
});

// ── Fabric Cuts ──
export const listCuts = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("fabricCuts").collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createCut = mutation({
  args: { tenantId: v.string(), rollId: v.string(), customerId: v.optional(v.string()), requestedMeter: v.number(), extraMeter: v.number(), motifMatching: v.boolean(), isPrecise: v.boolean(), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const lengthActual = args.requestedMeter + (args.motifMatching ? args.extraMeter / 100 : 0);
    const cutId = await ctx.db.insert("fabricCuts", { ...args, lengthActual, createdAt: Date.now() });
    // Deduct from roll — rollId is stored as a string matching roll's _id
    const allRolls = await ctx.db.query("fabricRolls").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const roll = allRolls.find((r) => r._id === args.rollId);
    if (roll) {
      const newRemaining = roll.remainingMeter - lengthActual;
      await ctx.db.patch(roll._id, { remainingMeter: Math.max(0, newRemaining) });
      if (newRemaining > 0 && newRemaining < 0.5) {
        const barcode = `REM-${Date.now().toString(36)}`;
        await ctx.db.insert("fabricRemnants", { tenantId: args.tenantId, rollId: roll._id, meterRemaining: newRemaining, barcode, price: 0, createdAt: Date.now() });
      }
    }
    return cutId;
  },
});

// ── Remnants ──
export const listRemnants = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("fabricRemnants").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});

// ── Obras ──
export const listObras = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("obrasServices").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createObras = mutation({
  args: { tenantId: v.string(), cutId: v.optional(v.string()), sisi: v.string(), benangWarna: v.string(), biayaPerMeter: v.number() },
  handler: async (ctx, args) => ctx.db.insert("obrasServices", { ...args, status: "pending", createdAt: Date.now() }),
});
export const updateObrasStatus = mutation({
  args: { id: v.id("obrasServices"), status: v.string(), qcPassed: v.optional(v.boolean()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status, ...(args.qcPassed !== undefined ? { qcPassed: args.qcPassed } : {}) }),
});

// ── Konveksi Orders ──
export const listKonveksi = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("konveksiOrders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createKonveksi = mutation({
  args: { tenantId: v.string(), customerId: v.string(), orderNumber: v.string(), totalRoll: v.number(), totalMeter: v.number(), hargaGrosirPerRoll: v.number(), paymentType: v.string() },
  handler: async (ctx, args) => ctx.db.insert("konveksiOrders", { ...args, status: "inquiry", piutangStatus: args.paymentType === "tempo" ? "belum_lunas" : undefined, createdAt: Date.now() }),
});
export const updateKonveksiStatus = mutation({
  args: { id: v.id("konveksiOrders"), status: v.string(), piutangStatus: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ status: args.status, piutangStatus: args.piutangStatus }).filter(([, v]) => v !== undefined))),
});

// ── Quality Checks ──
export const listQualityChecks = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("fabricQualityChecks").collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createQualityCheck = mutation({
  args: { tenantId: v.string(), rollId: v.string(), checkType: v.string(), result: v.string(), selisihPanjangPercent: v.optional(v.number()), notes: v.optional(v.string()), checkedBy: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("fabricQualityChecks", { ...args, createdAt: Date.now() }),
});
