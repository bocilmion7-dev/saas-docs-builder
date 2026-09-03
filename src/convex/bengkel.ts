import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Vehicles ──
export const listVehicles = query({
  args: { tenantId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("vehicles").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.plateNumber.toLowerCase().includes(s) || r.brand.toLowerCase().includes(s) || r.model.toLowerCase().includes(s)); }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});
export const createVehicle = mutation({
  args: { tenantId: v.string(), plateNumber: v.string(), brand: v.string(), model: v.string(), year: v.number(), engineType: v.optional(v.string()), vinNumber: v.optional(v.string()), kmLast: v.optional(v.number()), customerId: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("vehicles", { ...args, createdAt: Date.now() }),
});
export const updateVehicle = mutation({
  args: { id: v.id("vehicles"), plateNumber: v.optional(v.string()), brand: v.optional(v.string()), model: v.optional(v.string()), year: v.optional(v.number()), engineType: v.optional(v.string()), vinNumber: v.optional(v.string()), kmLast: v.optional(v.number()) },
  handler: async (ctx, args) => { const { id, ...f } = args; return ctx.db.patch(id, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined))); },
});
export const removeVehicle = mutation({ args: { id: v.id("vehicles") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Work Orders ──
export const listWorkOrders = query({
  args: { tenantId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("workOrders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.status) results = results.filter((r) => r.status === args.status);
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});
export const createWorkOrder = mutation({
  args: { tenantId: v.string(), woNumber: v.string(), vehicleId: v.string(), complaint: v.string(), type: v.string(), status: v.string(), estimatedCostPart: v.number(), estimatedCostJasa: v.number(), estimatedTimeHours: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.insert("workOrders", { ...args, diagnosis: undefined, approvedByCustomer: false, createdBy: undefined, createdAt: Date.now(), updatedAt: Date.now() }),
});
export const updateWorkOrderStatus = mutation({
  args: { id: v.id("workOrders"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() }),
});

// ── Job Cards ──
export const listJobCards = query({
  args: { tenantId: v.string(), workOrderId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("jobCards").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    if (args.workOrderId) q = ctx.db.query("jobCards").withIndex("by_work_order", (q) => q.eq("workOrderId", args.workOrderId!));
    return (await q.collect()).sort((a, b) => b.createdAt - a.createdAt);
  },
});
export const createJobCard = mutation({
  args: { tenantId: v.string(), workOrderId: v.string(), area: v.string(), title: v.string(), mechanicId: v.optional(v.string()), status: v.string() },
  handler: async (ctx, args) => ctx.db.insert("jobCards", { ...args, createdAt: Date.now() }),
});
export const updateJobCard = mutation({
  args: { id: v.id("jobCards"), mechanicId: v.optional(v.string()), status: v.optional(v.string()) },
  handler: async (ctx, args) => { const { id, ...f } = args; return ctx.db.patch(id, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined))); },
});

// ── Mechanics ──
export const listMechanics = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("mechanics").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createMechanic = mutation({
  args: { tenantId: v.string(), name: v.string(), specialization: v.string(), rating: v.number(), isAvailable: v.boolean() },
  handler: async (ctx, args) => ctx.db.insert("mechanics", { ...args, createdAt: Date.now() }),
});

// ── QC Test Drives ──
export const listTestDrives = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("qcTestDrives").collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createTestDrive = mutation({
  args: { tenantId: v.string(), workOrderId: v.string(), foremanId: v.string(), kmStart: v.number(), kmEnd: v.number(), complaintResolved: v.boolean(), abnormalNoise: v.boolean(), vibration: v.boolean(), leakage: v.boolean(), result: v.string(), notes: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("qcTestDrives", { ...args, createdAt: Date.now() }),
});

// ── Service Reminders ──
export const listServiceReminders = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("serviceReminders").collect().then((r) => r.sort((a, b) => (a.nextServiceDate ?? 0) - (b.nextServiceDate ?? 0))),
});
export const createServiceReminder = mutation({
  args: { tenantId: v.string(), vehicleId: v.string(), lastServiceKm: v.optional(v.number()), lastServiceDate: v.optional(v.number()), nextServiceKm: v.optional(v.number()), nextServiceDate: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.insert("serviceReminders", { ...args, reminderH7Sent: false, reminderH1Sent: false, status: "pending", createdAt: Date.now() }),
});
export const markReminderSent = mutation({
  args: { id: v.id("serviceReminders"), type: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { [args.type === "h7" ? "reminderH7Sent" : "reminderH1Sent"]: true, status: "sent" }),
});

// ── Vehicle Inspections ──
export const listInspections = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("vehicleInspections").collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createInspection = mutation({
  args: { tenantId: v.string(), vehicleId: v.string(), workOrderId: v.optional(v.string()), type: v.string(), findings: v.any(), inspectedBy: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("vehicleInspections", { ...args, createdAt: Date.now() }),
});
