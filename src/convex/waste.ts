import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    // Search both bakeryWasteLogs and wasteLogsCat
    const bakery = await ctx.db.query("bakeryWasteLogs").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const cat = await ctx.db.query("wasteLogsCat").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const all = [
      ...bakery.map((w) => ({ ...w, _source: "bakery" })),
      ...cat.map((w) => ({ ...w, _source: "cat" })),
    ];
    return all.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: { tenantId: v.string(), category: v.string(), item: v.string(), qty: v.number(), unit: v.string(), type: v.string(), cost: v.number(), note: v.optional(v.string()), createdBy: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category === "bakery") {
      return ctx.db.insert("bakeryWasteLogs", { tenantId: args.tenantId, reason: args.type, disposalMethod: args.unit, qty: args.qty, unit: args.unit, note: args.note, createdAt: Date.now() });
    }
    return ctx.db.insert("wasteLogsCat", { tenantId: args.tenantId, type: args.type, disposalMethod: args.unit, qty: args.qty, unit: args.unit, note: args.note, createdBy: args.createdBy, createdAt: Date.now() });
  },
});

export const stats = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("bakeryWasteLogs").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const cat = await ctx.db.query("wasteLogsCat").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const totalItems = all.length + cat.length;
    const today = new Date().toISOString().split("T")[0];
    const todayCount = all.filter((w) => new Date(w.createdAt).toISOString().startsWith(today)).length + cat.filter((w) => new Date(w.createdAt).toISOString().startsWith(today)).length;
    return { totalItems, todayCount };
  },
});
