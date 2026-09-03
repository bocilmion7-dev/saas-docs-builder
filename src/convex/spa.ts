import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Therapists ──
export const listTherapists = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("spaTherapists").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createTherapist = mutation({
  args: { tenantId: v.string(), name: v.string(), gender: v.string(), specialization: v.any(), rating: v.number(), isAvailable: v.boolean(), commissionRate: v.number() },
  handler: async (ctx, args) => ctx.db.insert("spaTherapists", { ...args, createdAt: Date.now() }),
});
export const updateTherapist = mutation({
  args: { id: v.id("spaTherapists"), name: v.optional(v.string()), gender: v.optional(v.string()), specialization: v.optional(v.any()), rating: v.optional(v.number()), isAvailable: v.optional(v.boolean()), commissionRate: v.optional(v.number()) },
  handler: async (ctx, args) => { const { id, ...f } = args; return ctx.db.patch(id, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined))); },
});
export const removeTherapist = mutation({ args: { id: v.id("spaTherapists") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Rooms ──
export const listRooms = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("spaRooms").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createRoom = mutation({
  args: { tenantId: v.string(), name: v.string(), type: v.string(), capacity: v.number(), facilities: v.any(), status: v.string(), temperature: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.insert("spaRooms", { ...args, createdAt: Date.now() }),
});
export const updateRoom = mutation({
  args: { id: v.id("spaRooms"), name: v.optional(v.string()), type: v.optional(v.string()), capacity: v.optional(v.number()), facilities: v.optional(v.any()), status: v.optional(v.string()), temperature: v.optional(v.number()) },
  handler: async (ctx, args) => { const { id, ...f } = args; return ctx.db.patch(id, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined))); },
});
export const removeRoom = mutation({ args: { id: v.id("spaRooms") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Bookings ──
export const listBookings = query({
  args: { tenantId: v.string(), date: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("spaBookings").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    if (args.date) q = ctx.db.query("spaBookings").withIndex("by_tenant_date", (q) => q.eq("tenantId", args.tenantId).eq("date", args.date!));
    return (await q.collect()).sort((a, b) => b.createdAt - a.createdAt);
  },
});
export const createBooking = mutation({
  args: { tenantId: v.string(), customerId: v.optional(v.string()), serviceId: v.string(), therapistId: v.optional(v.string()), roomId: v.optional(v.string()), date: v.number(), time: v.string(), durationMinutes: v.number(), status: v.string(), specialRequest: v.optional(v.string()), source: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("spaBookings", { ...args, createdAt: Date.now() }),
});
export const updateBookingStatus = mutation({
  args: { id: v.id("spaBookings"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Health Forms ──
export const listHealthForms = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("spaHealthForms").withIndex("by_booking", (q) => q.eq("bookingId", "")).collect().then(() => ctx.db.query("spaHealthForms").collect()),
});
export const createHealthForm = mutation({
  args: { tenantId: v.string(), bookingId: v.string(), customerId: v.string(), jantung: v.boolean(), darahTinggi: v.boolean(), hamil: v.boolean(), alergi: v.optional(v.string()), tekanan: v.string(), areaFokus: v.optional(v.string()), aroma: v.optional(v.string()), informedConsent: v.boolean() },
  handler: async (ctx, args) => ctx.db.insert("spaHealthForms", { ...args, createdAt: Date.now() }),
});

// ── Treatment Logs ──
export const listTreatmentLogs = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("spaTreatmentLogs").collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createTreatmentLog = mutation({
  args: { tenantId: v.string(), bookingId: v.string(), therapistId: v.string(), steps: v.any(), midCheckComfort: v.optional(v.boolean()), notes: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("spaTreatmentLogs", { ...args, createdAt: Date.now() }),
});

// ── Memberships ──
export const listMemberships = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("spaMemberships").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createMembership = mutation({
  args: { tenantId: v.string(), customerId: v.string(), type: v.string(), visitsTotal: v.number(), startDate: v.number(), endDate: v.number() },
  handler: async (ctx, args) => ctx.db.insert("spaMemberships", { ...args, visitsUsed: 0, status: "active", createdAt: Date.now() }),
});
