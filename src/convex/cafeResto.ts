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
// Kirim pesanan dari POS ke KDS. Jika tenant punya stasiun, order masuk ke stasiun pertama;
// jika tidak ada stasiun, order tampil di tab "Semua" di halaman KDS.
export const sendToKitchen = mutation({
  args: {
    tenantId: v.string(),
    orderId: v.string(),
    ticketNumber: v.string(),
    items: v.array(v.object({ name: v.string(), qty: v.number(), modifier: v.optional(v.string()) })),
    tableName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stations = await ctx.db.query("kitchenStations").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    return ctx.db.insert("kdsOrders", {
      tenantId: args.tenantId,
      orderId: args.orderId,
      stationId: stations[0]?._id ?? "",
      ticketNumber: args.ticketNumber,
      items: args.items,
      status: "queue",
      priority: "normal",
      createdAt: Date.now(),
    });
  },
});
export const createStation = mutation({
  args: { tenantId: v.string(), name: v.string(), type: v.string(), printerIp: v.optional(v.string()), displayId: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("kitchenStations", { ...args, isActive: true, createdAt: Date.now() }),
});
export const removeStation = mutation({
  args: { id: v.id("kitchenStations") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

// ── Table Sessions ──
export const listSessions = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("tableSessions").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.openedAt - a.openedAt)),
});
export const openSession = mutation({
  args: { tenantId: v.string(), tableId: v.string(), guestCount: v.number() },
  handler: async (ctx, args) => {
    const sessionNumber = `S${Date.now().toString(36).toUpperCase()}`;
    await ctx.db.patch(args.tableId as any, { status: "occupied" });
    return ctx.db.insert("tableSessions", { ...args, sessionNumber, openedAt: Date.now(), status: "open" });
  },
});
export const closeSession = mutation({
  args: { id: v.id("tableSessions"), tableId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tableId as any, { status: "available", currentSessionId: undefined });
    return ctx.db.patch(args.id, { closedAt: Date.now(), status: "closed" });
  },
});

// ── Split Bills ──
export const listSplitBills = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("splitBills").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createSplitBill = mutation({
  args: { tenantId: v.string(), orderId: v.string(), billLabel: v.string(), itemIds: v.any(), subtotal: v.number(), paymentMethod: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("splitBills", { ...args, paymentStatus: "pending", createdAt: Date.now() }),
});
export const updateSplitBillStatus = mutation({
  args: { id: v.id("splitBills"), paymentStatus: v.string(), paymentMethod: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ paymentStatus: args.paymentStatus, paymentMethod: args.paymentMethod }).filter(([, v]) => v !== undefined))),
});

// ── Shift Handovers ──
export const listShiftHandovers = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("shiftHandovers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createShiftHandover = mutation({
  args: { tenantId: v.string(), shiftId: v.string(), fromUserId: v.string(), toUserId: v.optional(v.string()), data: v.any() },
  handler: async (ctx, args) => ctx.db.insert("shiftHandovers", { ...args, status: "pending", createdAt: Date.now() }),
});
export const updateShiftHandover = mutation({
  args: { id: v.id("shiftHandovers"), toUserId: v.optional(v.string()), status: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ toUserId: args.toUserId, status: args.status }).filter(([, v]) => v !== undefined))),
});
