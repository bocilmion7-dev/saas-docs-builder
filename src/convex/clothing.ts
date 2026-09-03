import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ════════════════════════════════════════════════════════════════════════════
// TOKO PAKAIAN / FASHION — variants (SKU Matrix Size × Color), receiving & QC,
// RTS, size exchange, retail returns, stock opname, security, maintenance,
// and store checklists. Source: "Workflow Bisnis Toko Pakaian (Retail)" v1.0
// ════════════════════════════════════════════════════════════════════════════

type Db = any;

async function getDoc(ctx: Db, id: string) {
  return (await ctx.db.get(id as any)) as any;
}

async function findVariant(ctx: Db, productId: string, size?: string, color?: string) {
  const variants = await ctx.db.query("productVariants").withIndex("by_product", (q: any) => q.eq("productId", productId)).collect();
  return (
    variants.find((x: any) => {
      const a = x.attributes ?? {};
      const sizeOk = !size || a.size === size || x.name?.includes(size);
      const colorOk = !color || a.color === color || x.name?.includes(color);
      return sizeOk && colorOk;
    }) ?? null
  );
}

// ── Variants (SKU Matrix) ───────────────────────────────────────────────────

export const matrix = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const products = (await ctx.db.query("products").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    const variants = await ctx.db.query("productVariants").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    return products.map((p) => ({
      productId: p._id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      costPrice: p.costPrice ?? 0,
      stockQuantity: p.stockQuantity ?? 0,
      hasVariants: variants.some((x) => x.productId === p._id),
      variants: variants
        .filter((x) => x.productId === p._id)
        .sort((a, b) => (a.attributes?.size ?? "").localeCompare(b.attributes?.size ?? "")),
    }));
  },
});

export const listVariants = query({
  args: { tenantId: v.string(), productId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("productVariants").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    if (args.productId) q = ctx.db.query("productVariants").withIndex("by_product", (q) => q.eq("productId", args.productId!));
    return (await q.collect()).sort((a, b) => (a.attributes?.size ?? "").localeCompare(b.attributes?.size ?? ""));
  },
});

export const createVariant = mutation({
  args: {
    tenantId: v.string(),
    productId: v.string(),
    size: v.string(),
    color: v.string(),
    sku: v.string(),
    barcode: v.optional(v.string()),
    price: v.number(),
    costPrice: v.optional(v.number()),
    stockQuantity: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await getDoc(ctx, args.productId);
    if (!product || product.tenantId !== args.tenantId) throw new Error("Produk tidak ditemukan");
    const name = `${args.size} / ${args.color}`;
    const existing = await ctx.db.query("productVariants").withIndex("by_product", (q) => q.eq("productId", args.productId)).collect();
    const dup = existing.find((x) => x.sku === args.sku || ((x.attributes?.size ?? "") === args.size && (x.attributes?.color ?? "") === args.color));
    if (dup) throw new Error(`Varian ${dup.name} sudah ada (SKU ${dup.sku})`);
    const id = await ctx.db.insert("productVariants", {
      productId: args.productId,
      tenantId: args.tenantId,
      name,
      sku: args.sku,
      barcode: args.barcode,
      price: args.price,
      stockQuantity: args.stockQuantity,
      attributes: { size: args.size, color: args.color, costPrice: args.costPrice ?? product.costPrice ?? 0 },
      createdAt: Date.now(),
    });
    // Roll-up ke stok induk
    await ctx.db.patch(args.productId as any, { stockQuantity: (product.stockQuantity ?? 0) + args.stockQuantity, updatedAt: Date.now() });
    if (args.stockQuantity > 0) {
      await ctx.db.insert("stockMovements", {
        tenantId: args.tenantId, productId: args.productId, variantId: id as any,
        type: "in_awal", qty: args.stockQuantity, qtyBefore: 0, qtyAfter: args.stockQuantity,
        referenceType: "variant", referenceId: id as any, note: `Stok awal varian ${name}`, createdAt: Date.now(),
      });
    }
    return id;
  },
});

export const adjustVariant = mutation({
  args: {
    variantId: v.id("productVariants"),
    tenantId: v.string(),
    stockDelta: v.number(),
    price: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    if (!variant || variant.tenantId !== args.tenantId) throw new Error("Varian tidak ditemukan");
    const newStock = variant.stockQuantity + args.stockDelta;
    if (newStock < 0) throw new Error("Stok tidak boleh negatif");
    const now = Date.now();
    await ctx.db.patch(args.variantId, {
      stockQuantity: newStock,
      ...(args.price !== undefined ? { price: args.price } : {}),
    });
    // Sinkronkan stok produk induk
    const product = await getDoc(ctx, variant.productId);
    if (product) {
      const parentNew = (product.stockQuantity ?? 0) + args.stockDelta;
      await ctx.db.patch(product._id, { stockQuantity: Math.max(0, parentNew), updatedAt: now });
    }
    await ctx.db.insert("stockMovements", {
      tenantId: args.tenantId, productId: variant.productId, variantId: args.variantId as any,
      type: args.stockDelta >= 0 ? "in_adjust" : "out_adjust", qty: Math.abs(args.stockDelta),
      qtyBefore: variant.stockQuantity, qtyAfter: newStock,
      referenceType: "variant", referenceId: args.variantId as any,
      note: args.reason || (args.stockDelta >= 0 ? "Penyesuaian masuk" : "Penyesuaian keluar"),
      createdAt: now,
    });
    return newStock;
  },
});

export const removeVariant = mutation({
  args: { variantId: v.id("productVariants"), tenantId: v.string() },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    if (!variant || variant.tenantId !== args.tenantId) throw new Error("Varian tidak ditemukan");
    const product = await getDoc(ctx, variant.productId);
    if (product) {
      await ctx.db.patch(product._id, { stockQuantity: Math.max(0, (product.stockQuantity ?? 0) - variant.stockQuantity), updatedAt: Date.now() });
    }
    await ctx.db.delete(args.variantId);
  },
});

// ── Penerimaan Barang & QC (GRN) ────────────────────────────────────────────

export const listReceivings = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const notes = (await ctx.db.query("goodsReceivedNotes").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).sort((a, b) => b.receivedAt - a.receivedAt);
    const items = await ctx.db.query("grnItems").collect();
    return notes.map((n) => ({ ...n, items: items.filter((i) => i.grnId === n._id) }));
  },
});

export const receiveGoods = mutation({
  args: {
    tenantId: v.string(),
    poId: v.optional(v.string()),
    supplierId: v.string(),
    grnNumber: v.string(),
    receivedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.string(),
        variantId: v.optional(v.string()),
        qtyOrdered: v.number(),
        qtyReceived: v.number(),
        qtyRejected: v.number(),
        batchNumber: v.optional(v.string()),
        note: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const grnId = await ctx.db.insert("goodsReceivedNotes", {
      tenantId: args.tenantId,
      poId: args.poId ?? "",
      grnNumber: args.grnNumber,
      receivedBy: args.receivedBy,
      receivedAt: now,
      status: "received",
      notes: args.notes,
      createdAt: now,
    });
    for (const it of args.items) {
      await ctx.db.insert("grnItems", {
        grnId: grnId as any,
        productId: it.productId,
        qtyOrdered: it.qtyOrdered,
        qtyReceived: it.qtyReceived,
        qtyRejected: it.qtyRejected,
        batchNumber: it.batchNumber,
        notes: it.note,
        createdAt: now,
      });
      if (it.qtyReceived > 0) {
        if (it.variantId) {
          const variant = await getDoc(ctx, it.variantId!);
          if (variant) {
            await ctx.db.patch(variant._id, { stockQuantity: variant.stockQuantity + it.qtyReceived });
            const product = await getDoc(ctx, variant.productId);
            if (product) await ctx.db.patch(product._id, { stockQuantity: (product.stockQuantity ?? 0) + it.qtyReceived, updatedAt: now });
          }
        } else {
          const product = await getDoc(ctx, it.productId);
          if (product) await ctx.db.patch(product._id, { stockQuantity: (product.stockQuantity ?? 0) + it.qtyReceived, updatedAt: now });
        }
        await ctx.db.insert("stockMovements", {
          tenantId: args.tenantId, productId: it.productId, variantId: it.variantId,
          type: "in_grn", qty: it.qtyReceived, qtyBefore: 0, qtyAfter: it.qtyReceived,
          referenceType: "grn", referenceId: grnId as any,
          note: `Penerimaan ${args.grnNumber}${it.qtyRejected > 0 ? ` (${it.qtyRejected} ditolak)` : ""}`,
          createdAt: now,
        });
      }
    }
    if (args.poId) {
      const po = await getDoc(ctx, args.poId);
      if (po) await ctx.db.patch(po._id, { status: po.status === "shipped" ? "received" : po.status === "open" ? "confirmed" : po.status });
    }
    return grnId;
  },
});

// ── Return to Supplier (RTS) ────────────────────────────────────────────────

export const listRts = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const list = (await ctx.db.query("returnToSupplier").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).sort((a, b) => b.createdAt - a.createdAt);
    const items = await ctx.db.query("rtsItems").collect();
    return list.map((r) => ({ ...r, items: items.filter((i) => i.rtsId === r._id) }));
  },
});

export const createRts = mutation({
  args: {
    tenantId: v.string(),
    supplierId: v.string(),
    poId: v.optional(v.string()),
    rtsNumber: v.string(),
    reason: v.string(),
    notes: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    items: v.array(v.object({ productId: v.string(), variantId: v.optional(v.string()), qty: v.number(), reason: v.string() })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const rtsId = await ctx.db.insert("returnToSupplier", {
      tenantId: args.tenantId, poId: args.poId, supplierId: args.supplierId,
      rtsNumber: args.rtsNumber, reason: args.reason, status: "requested",
      notes: args.notes, createdBy: args.createdBy, createdAt: now,
    });
    for (const it of args.items) {
      await ctx.db.insert("rtsItems", { rtsId: rtsId as any, productId: it.productId, qty: it.qty, reason: it.reason, createdAt: now });
    }
    return rtsId;
  },
});

export const updateRtsStatus = mutation({
  args: { id: v.id("returnToSupplier"), status: v.string() },
  handler: async (ctx, args) => ctx.db.patch(args.id, { status: args.status }),
});

// ── Size Exchange ────────────────────────────────────────────────────────────

export const listSizeExchanges = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const list = (await ctx.db.query("sizeExchanges").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).sort((a, b) => b.createdAt - a.createdAt);
    const customers = await ctx.db.query("customers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    return list.map((r) => ({ ...r, customerName: r.customerId ? customers.find((c) => c._id === r.customerId)?.name : undefined }));
  },
});

export const createSizeExchange = mutation({
  args: {
    tenantId: v.string(),
    orderId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    productId: v.string(),
    variantId: v.optional(v.string()),
    productName: v.string(),
    oldSize: v.string(),
    newSize: v.string(),
    color: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("sizeExchanges", { ...args, status: "requested", createdAt: now, updatedAt: now });
  },
});

export const updateSizeExchange = mutation({
  args: {
    id: v.id("sizeExchanges"),
    status: v.string(),
    tagsAttached: v.optional(v.boolean()),
    conditionOk: v.optional(v.boolean()),
    priceDiff: v.optional(v.number()),
    handledBy: v.optional(v.string()),
    rejectReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ex = await ctx.db.get(args.id);
    if (!ex) throw new Error("Tidak ditemukan");
    const now = Date.now();
    const patch: Record<string, unknown> = { ...args };
    delete patch.id;
    if (args.status === "approved" && ex.status === "requested") {
      // Stok: +1 ukuran lama, −1 ukuran baru (workflow #11)
      const oldVar = await findVariant(ctx, ex.productId, ex.oldSize, ex.color);
      const newVar = await findVariant(ctx, ex.productId, ex.newSize, ex.color);
      if (newVar) {
        if (newVar.stockQuantity < 1 && !ex.variantId) throw new Error("Stok ukuran baru kosong");
        await ctx.db.patch(newVar._id, { stockQuantity: newVar.stockQuantity - (newVar.stockQuantity > 0 ? 1 : 0) });
        const np = await getDoc(ctx, newVar.productId);
        if (np) await ctx.db.patch(np._id, { stockQuantity: Math.max(0, (np.stockQuantity ?? 0) - (newVar.stockQuantity > 0 ? 1 : 0)), updatedAt: now });
      }
      if (oldVar) await ctx.db.patch(oldVar._id, { stockQuantity: oldVar.stockQuantity + 1 });
      if (oldVar) {
        const op = await getDoc(ctx, oldVar.productId);
        if (op) await ctx.db.patch(op._id, { stockQuantity: (op.stockQuantity ?? 0) + 1, updatedAt: now });
      }
    }
    if (args.status === "rejected") patch.rejectReason = args.rejectReason;
    await ctx.db.patch(args.id, { ...patch, updatedAt: now });
  },
});

// ── Retail Returns & Refund ──────────────────────────────────────────────────

export const listRetailReturns = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const list = (await ctx.db.query("retailReturns").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).sort((a, b) => b.createdAt - a.createdAt);
    const customers = await ctx.db.query("customers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    return list.map((r) => ({ ...r, customerName: r.customerId ? customers.find((c) => c._id === r.customerId)?.name : undefined }));
  },
});

export const createRetailReturn = mutation({
  args: {
    tenantId: v.string(),
    orderId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    productId: v.string(),
    variantId: v.optional(v.string()),
    productName: v.string(),
    returnType: v.string(),
    reason: v.string(),
    condition: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("retailReturns", { ...args, status: "requested", rejectBin: false, createdAt: now, updatedAt: now });
  },
});

export const updateRetailReturn = mutation({
  args: {
    id: v.id("retailReturns"),
    status: v.string(),
    refundMethod: v.optional(v.string()),
    refundAmount: v.optional(v.number()),
    rejectBin: v.optional(v.boolean()),
    voucherCompensation: v.optional(v.string()),
    handledBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const r = await ctx.db.get(args.id);
    if (!r) throw new Error("Tidak ditemukan");
    const patch: Record<string, unknown> = { ...args };
    delete patch.id;
    const now = Date.now();
    if (args.status === "approved" && r.status === "requested") {
      // Cacat produksi → stok keluar ke reject bin / ganti produk
      const qty = 1;
      if (r.variantId) {
        const variant = await getDoc(ctx, r.variantId!);
        if (variant && variant.stockQuantity > 0) {
          await ctx.db.patch(variant._id, { stockQuantity: variant.stockQuantity - qty });
          const product = await getDoc(ctx, variant.productId);
          if (product) await ctx.db.patch(product._id, { stockQuantity: Math.max(0, (product.stockQuantity ?? 0) - qty), updatedAt: now });
        }
      }
      if (args.rejectBin === true) {
        // Produk cacat → kirim klaim ke supplier (RTS ringkas)
        const suppliers = await ctx.db.query("suppliers").withIndex("by_tenant", (q) => q.eq("tenantId", r.tenantId)).collect();
        if (suppliers.length > 0) {
          const supplier = suppliers[0];
          const count = (await ctx.db.query("returnToSupplier").withIndex("by_tenant", (q) => q.eq("tenantId", r.tenantId)).collect()).length + 1;
          const rtsId = await ctx.db.insert("returnToSupplier", {
            tenantId: r.tenantId, supplierId: supplier._id,
            rtsNumber: `RTS-${String(count).padStart(3, "0")}`,
            reason: `Klaim cacat produksi (${r.returnType}) — ${r.productName}`,
            status: "requested", notes: r.reason, createdAt: now,
          });
          await ctx.db.insert("rtsItems", { rtsId: rtsId as any, productId: r.productId, qty, reason: r.reason, createdAt: now });
        }
      }
    }
    await ctx.db.patch(args.id, { ...patch, updatedAt: now });
  },
});

// ── Stock Opname ─────────────────────────────────────────────────────────────

export const listOpname = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const sessions = (await ctx.db.query("stockOpnameSessions").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).sort((a, b) => b.createdAt - a.createdAt);
    const items = await ctx.db.query("stockOpnameItems").collect();
    return sessions.map((s) => ({ ...s, items: items.filter((i) => i.sessionId === s._id) }));
  },
});

export const startOpname = mutation({
  args: { tenantId: v.string(), countedBy: v.optional(v.string()), warehouseId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const count = (await ctx.db.query("stockOpnameSessions").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).length + 1;
    const sessionId = await ctx.db.insert("stockOpnameSessions", {
      tenantId: args.tenantId,
      warehouseId: args.warehouseId,
      sessionNumber: `OP-${String(count).padStart(3, "0")}`,
      status: "counting",
      snapshotAt: now,
      countedBy: args.countedBy,
      createdAt: now,
    });
    const products = await ctx.db.query("products").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const variants = await ctx.db.query("productVariants").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const variantProducts = new Set(variants.map((x) => x.productId));
    for (const p of products) {
      const pVariants = variants.filter((x) => x.productId === p._id);
      if (pVariants.length > 0) {
        for (const vv of pVariants) {
          await ctx.db.insert("stockOpnameItems", {
            sessionId: sessionId as any, productId: p._id, qtySystem: vv.stockQuantity,
            qtyActual: vv.stockQuantity, variance: 0, note: `Varian ${vv.name}`, createdAt: now,
          });
        }
      } else if (!variantProducts.has(p._id)) {
        await ctx.db.insert("stockOpnameItems", {
          sessionId: sessionId as any, productId: p._id, qtySystem: p.stockQuantity ?? 0,
          qtyActual: p.stockQuantity ?? 0, variance: 0, createdAt: now,
        });
      }
    }
    return sessionId;
  },
});

export const updateOpnameItem = mutation({
  args: { id: v.id("stockOpnameItems"), qtyActual: v.number() },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Item tidak ditemukan");
    await ctx.db.patch(args.id, { qtyActual: args.qtyActual, variance: args.qtyActual - item.qtySystem });
  },
});

export const finalizeOpname = mutation({
  args: { sessionId: v.id("stockOpnameSessions"), approvedBy: v.optional(v.string()), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Sesi tidak ditemukan");
    const items = await ctx.db.query("stockOpnameItems").withIndex("by_session", (q) => q.eq("sessionId", args.sessionId)).collect();
    const now = Date.now();
    let totalVariance = 0;
    for (const item of items) {
      const variance = item.qtyActual - item.qtySystem;
      totalVariance += variance;
      if (variance !== 0) {
        const variantMatch = await findVariant(ctx, item.productId);
        const variant = variantMatch && (await ctx.db.query("productVariants").withIndex("by_product", (q) => q.eq("productId", item.productId)).collect()).find((x: any) => x._id && (item.note ?? "").includes(x.name ?? "__"));
        const product = await getDoc(ctx, item.productId);
        if (product) {
          await ctx.db.patch(product._id, { stockQuantity: Math.max(0, (product.stockQuantity ?? 0) + variance), updatedAt: now });
        }
        if (variant) {
          await ctx.db.patch(variant._id, { stockQuantity: Math.max(0, variant.stockQuantity + variance) });
        }
        await ctx.db.insert("stockAdjustments", {
          tenantId: session.tenantId, productId: item.productId,
          type: variance > 0 ? "opname_plus" : "opname_minus", qty: Math.abs(variance),
          reason: item.note ? `Stock opname ${session.sessionNumber} — ${item.note}` : `Stock opname ${session.sessionNumber}`,
          status: "approved", approvedBy: args.approvedBy, createdAt: now,
        });
      }
    }
    await ctx.db.patch(args.sessionId, { status: "approved", approvedBy: args.approvedBy, notes: args.notes });
    return { adjusted: items.filter((i) => i.variance !== 0).length, totalVariance };
  },
});

// ── Security Logs (pencegahan pencurian) ────────────────────────────────────

export const listSecurity = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const list = (await ctx.db.query("securityLogs").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).sort((a, b) => b.createdAt - a.createdAt);
    const users = await ctx.db.query("users").filter((q) => q.eq(q.field("tenantId"), args.tenantId)).collect();
    return list.map((s) => ({ ...s, handledByName: s.handledBy ? users.find((u) => u._id === s.handledBy)?.name : undefined }));
  },
});

export const createSecurityLog = mutation({
  args: {
    tenantId: v.string(), type: v.string(), description: v.string(),
    estimatedLoss: v.optional(v.number()), actionTaken: v.optional(v.string()), handledBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("securityLogs", { ...args, createdAt: Date.now() }),
});

// ── Maintenance Tickets (perawatan fasilitas) ───────────────────────────────

export const listMaintenance = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const list = (await ctx.db.query("maintenanceTickets").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect()).sort((a, b) => b.createdAt - a.createdAt);
    const users = await ctx.db.query("users").filter((q) => q.eq(q.field("tenantId"), args.tenantId)).collect();
    return list.map((s) => ({ ...s, assignedName: s.assignedTo ? users.find((u) => u._id === s.assignedTo)?.name : undefined }));
  },
});

export const createMaintenance = mutation({
  args: {
    tenantId: v.string(), item: v.string(), issue: v.string(),
    priority: v.string(), assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("maintenanceTickets", { ...args, status: "open", createdAt: now, updatedAt: now });
  },
});

export const updateMaintenance = mutation({
  args: { id: v.id("maintenanceTickets"), status: v.string(), assignedTo: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.assignedTo !== undefined ? { assignedTo: args.assignedTo } : {}),
      ...(args.status === "resolved" ? { resolvedAt: now } : {}),
      updatedAt: now,
    });
  },
});

// ── Store Checklists (opening / closing / daily VM) ─────────────────────────

const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  opening: [
    "Absen & briefing pagi (target penjualan, promo berjalan, new arrival)",
    "Cek kebersihan lantai, rak, display, fitting room & kasir",
    "Setting mannequin dengan outfit terbaru (rapi & disetrika)",
    "Atur display rak: produk baru di depan, harga jelas",
    "Cek perangkat POS, EDC, jaringan & CCTV",
    "Cek stok fast moving (Size M & L, warna netral)",
  ],
  closing: [
    "Stop menerima customer baru 15 menit sebelum tutup",
    "Selesaikan transaksi & fitting yang berjalan",
    "Rapikan display & rak (kembalikan baju, urutkan size)",
    "Tutup shift kasir & rekonsiliasi + setoran",
    "Cek fitting room (bersihkan, gantung baju tertinggal)",
    "Matikan AC, lampu display, POS, EDC; kunci toko & aktifkan alarm",
  ],
  daily_vm: [
    "Rotasi display mingguan & signage promo terpasang",
    "Cek pencahayaan spotlight warna akurat",
    "Tampilkan aksesoris pendukung (cross-selling) dekat produk utama",
    "Cek stok display tidak kosong (frontage penuh)",
  ],
};

export const listChecklists = query({
  args: { tenantId: v.string(), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("storeChecklists").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    const rows = await q.collect();
    const list = args.type ? rows.filter((r) => r.type === args.type) : rows;
    return list.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const getChecklistTemplates = query({
  args: { tenantId: v.string() },
  handler: async () => DEFAULT_CHECKLISTS,
});

export const seedChecklists = mutation({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("storeChecklists").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    if (existing.length > 0) return existing.length;
    for (const [type, titles] of Object.entries(DEFAULT_CHECKLISTS)) {
      for (const title of titles) {
        await ctx.db.insert("storeChecklists", {
          tenantId: args.tenantId, type, title, isChecked: false, createdAt: now, updatedAt: now,
        });
      }
    }
    return 0;
  },
});

export const toggleChecklist = mutation({
  args: { id: v.id("storeChecklists"), isChecked: v.boolean(), checkedBy: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.id, {
      isChecked: args.isChecked,
      checkedAt: args.isChecked ? now : undefined,
      checkedBy: args.isChecked ? args.checkedBy : undefined,
      updatedAt: now,
    });
  },
});

export const addChecklistItem = mutation({
  args: { tenantId: v.string(), type: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("storeChecklists", { ...args, isChecked: false, createdAt: now, updatedAt: now });
  },
});
