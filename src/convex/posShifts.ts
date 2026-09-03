import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("posShifts").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.openedAt - a.openedAt)),
});

export const getCurrent = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("posShifts").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    return all.find((s) => s.status === "open") ?? null;
  },
});

export const openShift = mutation({
  args: { tenantId: v.string(), userId: v.string(), openingCash: v.number() },
  handler: async (ctx, args) => ctx.db.insert("posShifts", { ...args, status: "open", openedAt: Date.now() }),
});

export const closeShift = mutation({
  args: { shiftId: v.id("posShifts"), closingCashActual: v.number() },
  handler: async (ctx, args) => {
    const shift = await ctx.db.get(args.shiftId);
    if (!shift) throw new Error("Shift not found");
    const variance = args.closingCashActual - (shift.expectedCash ?? 0);
    return ctx.db.patch(args.shiftId, { closingCashActual: args.closingCashActual, variance, status: "closed", closedAt: Date.now() });
  },
});
