import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Vouchers ──
export const listVouchers = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("vouchers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createVoucher = mutation({
  args: { tenantId: v.string(), code: v.string(), type: v.string(), value: v.number(), minPurchase: v.number(), maxDiscount: v.optional(v.number()), quota: v.number(), startDate: v.optional(v.number()), endDate: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.insert("vouchers", { ...args, usedCount: 0, isActive: true, createdAt: Date.now() }),
});
export const updateVoucher = mutation({
  args: { id: v.id("vouchers"), isActive: v.optional(v.boolean()), quota: v.optional(v.number()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ isActive: args.isActive, quota: args.quota }).filter(([, v]) => v !== undefined))),
});
export const removeVoucher = mutation({ args: { id: v.id("vouchers") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Loyalty Programs ──
export const listLoyaltyPrograms = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("loyaltyPrograms").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect(),
});
export const createLoyaltyProgram = mutation({
  args: { tenantId: v.string(), name: v.string(), type: v.string(), threshold: v.number(), rewardDescription: v.string() },
  handler: async (ctx, args) => ctx.db.insert("loyaltyPrograms", { ...args, isActive: true, createdAt: Date.now() }),
});
export const updateLoyaltyProgram = mutation({
  args: { id: v.id("loyaltyPrograms"), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ isActive: args.isActive }).filter(([, v]) => v !== undefined))),
});
export const removeLoyaltyProgram = mutation({ args: { id: v.id("loyaltyPrograms") }, handler: async (ctx, args) => ctx.db.delete(args.id) });

// ── Loyalty Transactions ──
export const listLoyaltyTransactions = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => ctx.db.query("loyaltyTransactions").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect().then((r) => r.sort((a, b) => b.createdAt - a.createdAt)),
});
export const createLoyaltyTransaction = mutation({
  args: { tenantId: v.string(), customerId: v.string(), type: v.string(), points: v.number(), referenceType: v.optional(v.string()), referenceId: v.optional(v.string()), note: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("loyaltyTransactions", { ...args, createdAt: Date.now() }),
});

// ── Poin Pelanggan (SDOT 2.2: poin per pembelian, redeem diskon/hadiah) ────
// Berikan / kurangi poin pelanggan + catat riwayat loyaltyTransactions.
export const addPoints = mutation({
  args: {
    tenantId: v.string(),
    customerId: v.string(),
    points: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customer = (await ctx.db.get(args.customerId as any)) as any;
    if (!customer || customer.tenantId !== args.tenantId) throw new Error("Pelanggan tidak ditemukan");
    const newBalance = Math.max(0, (customer.loyaltyPoints ?? 0) + args.points);
    await ctx.db.patch(customer._id, { loyaltyPoints: newBalance });
    await ctx.db.insert("loyaltyTransactions", {
      tenantId: args.tenantId,
      customerId: args.customerId,
      type: args.points >= 0 ? "earn" : "adjust",
      points: args.points,
      note: args.note ?? (args.points >= 0 ? "Poin diberikan" : "Poin dikurangi"),
      createdAt: Date.now(),
    });
    return newBalance;
  },
});

// Tukar poin → voucher diskon otomatis (konversi 100 poin = Rp 50.000, min. belanja 2×).
export const redeemPoints = mutation({
  args: {
    tenantId: v.string(),
    customerId: v.string(),
    points: v.number(),
  },
  handler: async (ctx, args) => {
    const customer = (await ctx.db.get(args.customerId as any)) as any;
    if (!customer || customer.tenantId !== args.tenantId) throw new Error("Pelanggan tidak ditemukan");
    if ((customer.loyaltyPoints ?? 0) < args.points) throw new Error("Poin tidak cukup");
    if (args.points < 50) throw new Error("Minimal tukar 50 poin");

    const value = Math.round((args.points / 100) * 50000);
    const code = `PTS-${Date.now().toString(36).toUpperCase()}`;
    await ctx.db.insert("vouchers", {
      tenantId: args.tenantId,
      code,
      type: "discount",
      value,
      minPurchase: value * 2,
      quota: 1,
      usedCount: 0,
      startDate: Date.now(),
      endDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
      isActive: true,
      createdAt: Date.now(),
    });
    const newBalance = (customer.loyaltyPoints ?? 0) - args.points;
    await ctx.db.patch(customer._id, { loyaltyPoints: newBalance });
    await ctx.db.insert("loyaltyTransactions", {
      tenantId: args.tenantId,
      customerId: args.customerId,
      type: "redeem",
      points: -args.points,
      referenceType: "voucher",
      note: `Tukar ${args.points} poin → voucher ${code} (Rp ${value.toLocaleString("id-ID")})`,
      createdAt: Date.now(),
    });
    return { code, value, newBalance };
  },
});

// Pelanggan + saldo poin (untuk halaman loyalty)
export const listCustomersWithPoints = query({
  args: { tenantId: v.string(), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const customers = await ctx.db.query("customers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    let results = customers.map((c) => ({
      _id: c._id as any,
      name: c.name,
      phone: c.phone ?? "",
      loyaltyPoints: c.loyaltyPoints ?? 0,
      birthDate: c.birthDate,
    }));
    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter((c) => c.name.toLowerCase().includes(s) || c.phone.includes(s));
    }
    return results.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);
  },
});
