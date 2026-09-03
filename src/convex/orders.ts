import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    tenantId: v.optional(v.string()),
    status: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = ((args.page ?? 1) - 1) * limit;
    let q = ctx.db.query("orders").fullTableScan();
    if (args.tenantId) {
      q = ctx.db.query("orders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId!));
    }
    const all = await q.collect();
    let results = all.sort((a, b) => b.createdAt - a.createdAt);
    if (args.status) {
      results = results.filter((r) => r.status === args.status);
    }
    const total = results.length;
    return { items: results.slice(offset, offset + limit), total, page: args.page ?? 1 };
  },
});

export const create = mutation({
  args: {
    tenantId: v.string(),
    orderNumber: v.string(),
    customerId: v.optional(v.string()),
    subtotal: v.number(),
    discountTotal: v.number(),
    taxTotal: v.number(),
    grandTotal: v.number(),
    paymentMethod: v.optional(v.union(
      v.literal("tunai"), v.literal("qris"), v.literal("kartu_debit"),
      v.literal("kartu_kredit"), v.literal("transfer"), v.literal("tempo"),
    )),
    notes: v.optional(v.string()),
    createdBy: v.string(),
    items: v.array(
      v.object({
        productId: v.string(),
        variantId: v.optional(v.string()),
        nameSnapshot: v.string(),
        priceSnapshot: v.number(),
        qty: v.number(),
        subtotal: v.number(),
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { items, ...orderFields } = args;
    const tenant = (await ctx.db.get(args.tenantId as any)) as any;
    // Kategori produk fisik: stok otomatis berkurang saat pesanan dibuat.
    // Kategori jasa/menu (cafe, restoran, spa, bengkel) mengelola stok terpisah.
    const deductStock = tenant && ["toko_retail", "toko_cat", "toko_sparepart", "toko_kain", "toko_pakaian", "bakery"].includes(tenant.category);

    // Cek ketersediaan dulu (produk dengan stok tercatat) sebelum order dibuat
    if (deductStock) {
      for (const item of items) {
        if (item.variantId) {
          const v = (await ctx.db.get(item.variantId as any)) as any;
          if (v && v.tenantId === args.tenantId && (v.stockQuantity ?? 0) > 0 && v.stockQuantity < item.qty) {
            throw new Error(`Stok tidak cukup untuk ${item.nameSnapshot} (sisa ${v.stockQuantity})`);
          }
        } else {
          const p = (await ctx.db.get(item.productId as any)) as any;
          if (p && p.tenantId === args.tenantId && (p.stockQuantity ?? 0) > 0 && p.stockQuantity < item.qty) {
            throw new Error(`Stok tidak cukup untuk ${item.nameSnapshot} (sisa ${p.stockQuantity})`);
          }
        }
      }
    }

    const orderId = await ctx.db.insert("orders", {
      ...orderFields,
      status: "pending",
      paymentStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });
    for (const item of items) {
      await ctx.db.insert("orderItems", { orderId, ...item });
      if (!deductStock) continue;
      if (item.variantId) {
        const v = (await ctx.db.get(item.variantId as any)) as any;
        if (v && v.tenantId === args.tenantId && (v.stockQuantity ?? 0) > 0) {
          const qtyAfter = Math.max(0, v.stockQuantity - item.qty);
          await ctx.db.patch(v._id, { stockQuantity: qtyAfter });
          const product = (await ctx.db.get(v.productId as any)) as any;
          if (product) await ctx.db.patch(product._id, { stockQuantity: Math.max(0, (product.stockQuantity ?? 0) - item.qty), updatedAt: now });
          await ctx.db.insert("stockMovements", {
            tenantId: args.tenantId, productId: item.productId, variantId: item.variantId,
            type: "out_sale", qty: item.qty, qtyBefore: v.stockQuantity, qtyAfter,
            referenceType: "order", referenceId: orderId as any,
            note: `Penjualan ${args.orderNumber} — ${item.nameSnapshot}`,
            createdAt: now,
          });
        }
      } else {
        const p = (await ctx.db.get(item.productId as any)) as any;
        if (p && p.tenantId === args.tenantId && (p.stockQuantity ?? 0) > 0) {
          const qtyAfter = Math.max(0, p.stockQuantity - item.qty);
          await ctx.db.patch(p._id, { stockQuantity: qtyAfter, updatedAt: now });
          await ctx.db.insert("stockMovements", {
            tenantId: args.tenantId, productId: item.productId,
            type: "out_sale", qty: item.qty, qtyBefore: p.stockQuantity, qtyAfter,
            referenceType: "order", referenceId: orderId as any,
            note: `Penjualan ${args.orderNumber} — ${item.nameSnapshot}`,
            createdAt: now,
          });
        }
      }
    }
    return orderId;
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getItems = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) =>
    ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect(),
});

export const updatePayment = mutation({
  args: {
    id: v.id("orders"),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("unpaid"), v.literal("refunded")),
    paymentNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Pesanan tidak ditemukan");
    const patch: Record<string, unknown> = {
      paymentStatus: args.paymentStatus,
      updatedAt: Date.now(),
    };
    if (args.paymentNote !== undefined) patch.notes = args.paymentNote;
    await ctx.db.patch(args.id, patch as any);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"), v.literal("confirmed"), v.literal("preparing"),
      v.literal("ready"), v.literal("served"), v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) =>
    ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() }),
});

export const todayStats = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();

    const all = await ctx.db
      .query("orders")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    const todayOrders = all.filter((o) => o.createdAt >= startOfDay);
    const revenue = todayOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.grandTotal, 0);
    const count = todayOrders.length;
    const pending = todayOrders.filter(
      (o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing",
    ).length;

    return { count, revenue, pending };
  },
});
