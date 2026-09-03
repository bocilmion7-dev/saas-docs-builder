import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Tinting Machines ──
export const listMachines = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("tintingMachines").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createMachine = mutation({
  args: { tenantId: v.string(), name: v.string() },
  handler: async (ctx, args) => ctx.db.insert("tintingMachines", { ...args, status: "active", totalMixCount: 0, createdAt: Date.now() }),
});
export const updateMachine = mutation({
  args: { id: v.id("tintingMachines"), status: v.optional(v.string()), lastCalibrationAt: v.optional(v.number()), lastCleanedAt: v.optional(v.number()), dbWarnaVersion: v.optional(v.string()) },
  handler: async (ctx, args) => { const { id, ...f } = args; return ctx.db.patch(id, Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined))); },
});

// ── Color Formulas ──
export const listFormulas = query({
  args: { tenantId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("colorFormulas").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    if (args.search) { const s = args.search.toLowerCase(); results = results.filter((r) => r.colorCode.toLowerCase().includes(s) || r.colorName.toLowerCase().includes(s)); }
    return results;
  },
});
export const createFormula = mutation({
  args: { tenantId: v.string(), colorCode: v.string(), colorName: v.string(), brand: v.string(), baseType: v.string(), finish: v.string(), pigmentMix: v.any() },
  handler: async (ctx, args) => ctx.db.insert("colorFormulas", { ...args, createdAt: Date.now() }),
});

// ── Color Samples ──
export const listSamples = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("colorSamples").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createSample = mutation({
  args: { tenantId: v.string(), customerId: v.optional(v.string()), colorCode: v.string(), volumeMl: v.number(), testerPrice: v.number() },
  handler: async (ctx, args) => ctx.db.insert("colorSamples", { ...args, status: "requested", createdAt: Date.now() }),
});
export const updateSampleStatus = mutation({
  args: { id: v.id("colorSamples"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Waste (Toko Cat) ──
export const listWaste = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("wasteLogsCat").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createWaste = mutation({
  args: { tenantId: v.string(), type: v.string(), drumCode: v.optional(v.string()), disposalMethod: v.string(), buyerName: v.optional(v.string()), qty: v.number(), unit: v.string(), note: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("wasteLogsCat", { ...args, createdAt: Date.now() }),
});

// ── Contractor Projects ──
export const listContractorProjects = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("contractorProjects").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createContractorProject = mutation({
  args: { tenantId: v.string(), customerId: v.optional(v.string()), name: v.string(), location: v.optional(v.string()), luasTotalM2: v.number(), totalValue: v.number(), paymentType: v.string(), terminDetails: v.optional(v.any()) },
  handler: async (ctx, args) => ctx.db.insert("contractorProjects", { ...args, status: "survey", createdAt: Date.now() }),
});
export const updateProjectStatus = mutation({
  args: { id: v.id("contractorProjects"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Complaint Tickets ──
export const listComplaints = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("complaintTickets").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createComplaint = mutation({
  args: { tenantId: v.string(), customerId: v.optional(v.string()), orderId: v.optional(v.string()), type: v.string(), description: v.string(), evidenceUrls: v.optional(v.any()) },
  handler: async (ctx, args) => ctx.db.insert("complaintTickets", { ...args, status: "open", createdAt: Date.now() }),
});
export const updateComplaint = mutation({
  args: { id: v.id("complaintTickets"), status: v.string(), investigationResult: v.optional(v.string()), resolution: v.optional(v.string()), handledBy: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries(args).filter(([k, v]) => k !== "id" && v !== undefined))),
});

// ── HSE Checklists ──
export const listHSE = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("hseChecklists").withIndex("by_tenant_date", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createHSE = mutation({
  args: { tenantId: v.string(), date: v.string(), data: v.any(), checkedBy: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("hseChecklists", { ...args, createdAt: Date.now() }),
});

// ── Delivery Orders ──
export const listDeliveryOrders = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("deliveryOrders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createDeliveryOrder = mutation({
  args: { tenantId: v.string(), projectId: v.optional(v.string()), doNumber: v.string(), vehicleNumber: v.optional(v.string()), driverName: v.optional(v.string()), quantityTotal: v.number() },
  handler: async (ctx, args) => ctx.db.insert("deliveryOrders", { ...args, status: "prepared", createdAt: Date.now() }),
});
export const updateDeliveryStatus = mutation({
  args: { id: v.id("deliveryOrders"), status: v.string(), signedBy: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status, ...(args.signedBy ? { signedBy: args.signedBy, signedAt: Date.now() } : {}) }),
});

// ── Machine Maintenance ──
export const listMaintenance = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("machineMaintenanceLogs").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createMaintenance = mutation({
  args: { tenantId: v.string(), machineId: v.optional(v.string()), type: v.string(), performedBy: v.optional(v.string()), nextDueAt: v.optional(v.number()), notes: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("machineMaintenanceLogs", { ...args, createdAt: Date.now() }),
});

// ── Opening/Closing Logs ──
export const listOpeningClosing = query({
  args: { tenantId: v.string(), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const q = ctx.db.query("openingClosingLogs").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    let results = await q.collect();
    if (args.type) results = results.filter((r) => r.type === args.type);
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});
export const createOpeningClosing = mutation({
  args: { tenantId: v.string(), type: v.string(), data: v.any(), performedBy: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("openingClosingLogs", { ...args, createdAt: Date.now() }),
});

// ── Pigment Stock ──
export const listPigmentStock = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("pigmentStock").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createPigmentStock = mutation({
  args: { tenantId: v.string(), colorCode: v.string(), quantityMl: v.number() },
  handler: async (ctx, args) => ctx.db.insert("pigmentStock", { ...args, lastRestockedAt: Date.now(), createdAt: Date.now() }),
});
export const updatePigmentStock = mutation({
  args: { id: v.id("pigmentStock"), quantityMl: v.number() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { quantityMl: args.quantityMl, lastRestockedAt: Date.now() }),
});
