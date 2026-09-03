import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
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
    // Kategori produk fisik — stok berkurang saat pembayaran dikonfirmasi (lihat settlePaidCore).
    const physical = tenant && ["toko_retail", "toko_cat", "toko_sparepart", "toko_kain", "toko_pakaian", "bakery"].includes(tenant.category);

    // Cek ketersediaan dulu (produk dengan stok tercatat) sebelum order dibuat
    if (physical) {
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
      stockDeducted: false,
      createdAt: now,
      updatedAt: now,
    });
    for (const item of items) {
      await ctx.db.insert("orderItems", { orderId, ...item });
    }
    return orderId;
  },
});

// ── Settlement pembayaran: sekali & idempotent ──────────────────────────────
// Dipanggil dari: (1) webhook Midtrans, (2) tombol manual "Tandai Dibayar".
// Mengurangi stok varian/produk (kategori produk fisik) hanya SATU KALI.
async function settlePaidCore(ctx: any, orderId: string, source: string, extraNote?: string) {
  const order = (await ctx.db.get(orderId as any)) as any;
  if (!order) throw new Error("Pesanan tidak ditemukan");
  const now = Date.now();
  const tenant = (await ctx.db.get(order.tenantId as any)) as any;
  const physical = tenant && ["toko_retail", "toko_cat", "toko_sparepart", "toko_kain", "toko_pakaian", "bakery"].includes(tenant.category);
  const already = order.stockDeducted === true || order.paymentStatus === "paid";

  if (!already && physical) {
    const items = await ctx.db.query("orderItems").withIndex("by_order", (q: any) => q.eq("orderId", orderId)).collect();
    for (const item of items) {
      if (item.variantId) {
        const v = (await ctx.db.get(item.variantId as any)) as any;
        if (v && v.tenantId === order.tenantId && (v.stockQuantity ?? 0) > 0) {
          const qtyOut = Math.min(item.qty, v.stockQuantity);
          const qtyAfter = Math.max(0, v.stockQuantity - qtyOut);
          await ctx.db.patch(v._id, { stockQuantity: qtyAfter });
          const product = (await ctx.db.get(v.productId as any)) as any;
          if (product) await ctx.db.patch(product._id, { stockQuantity: Math.max(0, (product.stockQuantity ?? 0) - qtyOut), updatedAt: now });
          await ctx.db.insert("stockMovements", {
            tenantId: order.tenantId, productId: item.productId, variantId: item.variantId,
            type: "out_sale", qty: qtyOut, qtyBefore: v.stockQuantity, qtyAfter,
            referenceType: "order", referenceId: orderId,
            note: `Penjualan ${order.orderNumber} — ${item.nameSnapshot} (${source})`,
            createdAt: now,
          });
        }
      } else {
        const p = (await ctx.db.get(item.productId as any)) as any;
        if (p && p.tenantId === order.tenantId && (p.stockQuantity ?? 0) > 0) {
          const qtyOut = Math.min(item.qty, p.stockQuantity);
          const qtyAfter = Math.max(0, p.stockQuantity - qtyOut);
          await ctx.db.patch(p._id, { stockQuantity: qtyAfter, updatedAt: now });
          await ctx.db.insert("stockMovements", {
            tenantId: order.tenantId, productId: item.productId,
            type: "out_sale", qty: qtyOut, qtyBefore: p.stockQuantity, qtyAfter,
            referenceType: "order", referenceId: orderId,
            note: `Penjualan ${order.orderNumber} — ${item.nameSnapshot} (${source})`,
            createdAt: now,
          });
        }
      }
    }
  }

  const note = [order.notes, extraNote, `Pembayaran dikonfirmasi (${source})`].filter(Boolean).join(" | ");
  await ctx.db.patch(order._id, {
    paymentStatus: "paid",
    stockDeducted: true,
    paidAt: now,
    status: order.status === "pending" ? "confirmed" : order.status,
    notes: note,
    updatedAt: now,
  });
  return { orderId: order._id, deducted: !already && physical };
}

export const settlePaid = internalMutation({
  args: { orderId: v.string() },
  handler: async (ctx, args) => settlePaidCore(ctx, args.orderId, "midtrans-webhook"),
});

export const getByOrderNumber = internalQuery({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) =>
    ctx.db.query("orders").filter((q) => q.eq(q.field("orderNumber"), args.orderNumber)).first(),
});

export const markPaymentFailed = internalMutation({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const order = (await ctx.db.get(args.orderId as any)) as any;
    if (!order) throw new Error("Pesanan tidak ditemukan");
    const now = Date.now();
    await ctx.db.patch(order._id, {
      paymentStatus: "unpaid",
      status: order.status === "pending" || order.status === "confirmed" ? "cancelled" : order.status,
      notes: [order.notes, "Midtrans gagal — dibatalkan otomatis via webhook"].filter(Boolean).join(" | "),
      updatedAt: now,
    });
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
    if (args.paymentStatus === "paid") {
      // Setel lewat jalur settlement yang sama dengan webhook (deduksi stok sekali saja)
      return settlePaidCore(ctx, args.id, "manual", args.paymentNote);
    }
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
