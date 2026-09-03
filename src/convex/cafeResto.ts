import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Dining Tables ──
export const listTables = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("diningTables").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createTable = mutation({
  args: { tenantId: v.string(), number: v.number(), capacity: v.number(), area: v.string() },
  handler: async (ctx, args) => ctx.db.insert("diningTables", { ...args, status: "available", createdAt: Date.now() }),
});
export const updateTableStatus = mutation({
  args: { id: v.id("diningTables"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Reservations ──
export const listReservations = query({
  args: { tenantId: v.string(), date: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("reservations").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    if (args.date) q = ctx.db.query("reservations").withIndex("by_tenant_date", (q) => q.eq("tenantId", args.tenantId).eq("date", args.date!));
    return (await q.collect()).sort((a, b) => b.createdAt - a.createdAt);
  },
});
export const createReservation = mutation({
  args: { tenantId: v.string(), customerId: v.optional(v.string()), customerName: v.string(), customerPhone: v.string(), date: v.number(), time: v.string(), pax: v.number(), area: v.string(), specialRequest: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("reservations", { ...args, status: "confirmed", createdAt: Date.now() }),
});
export const updateReservationStatus = mutation({
  args: { id: v.id("reservations"), status: v.string(), tableId: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ status: args.status, tableId: args.tableId }).filter(([, v]) => v !== undefined))),
});

// ── Waiting Lists ──
export const listWaiting = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("waitingLists").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => a.waitingSince - b.waitingSince)),
});
export const createWaiting = mutation({
  args: { tenantId: v.string(), customerName: v.string(), phone: v.string(), guestCount: v.number(), estimatedWaitMinutes: v.number() },
  handler: async (ctx, args) => ctx.db.insert("waitingLists", { ...args, waitingSince: Date.now(), status: "waiting", createdAt: Date.now() }),
});
export const updateWaitingStatus = mutation({
  args: { id: v.id("waitingLists"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Modifiers ──
export const listModifiers = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("menuModifiers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createModifier = mutation({
  args: { tenantId: v.string(), name: v.string(), type: v.string(), options: v.any() },
  handler: async (ctx, args) => ctx.db.insert("menuModifiers", { ...args, createdAt: Date.now() }),
});
export const removeModifier = mutation({ args: { id: v.id("menuModifiers") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── KDS Orders ──
export const listKdsOrders = query({
  args: { tenantId: v.string(), stationId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("kdsOrders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    if (args.stationId) q = ctx.db.query("kdsOrders").withIndex("by_station", (q) => q.eq("stationId", args.stationId!));
    return (await q.collect()).sort((a, b) => b.createdAt - a.createdAt);
  },
});
export const updateKdsStatus = mutation({
  args: { id: v.id("kdsOrders"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Kitchen Stations ──
export const listStations = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("kitchenStations").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createStation = mutation({
  args: { tenantId: v.string(), name: v.string(), type: v.string(), printerIp: v.optional(v.string()), displayId: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("kitchenStations", { ...args, isActive: true, createdAt: Date.now() }),
});
