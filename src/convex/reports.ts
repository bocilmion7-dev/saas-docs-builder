import { query } from "./_generated/server";
import { v } from "convex/values";

export const overview = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const expenses = await ctx.db.query("expenses").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const customers = await ctx.db.query("customers").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const products = await ctx.db.query("products").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();

    const totalRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.grandTotal, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const completedOrders = orders.filter((o) => o.status === "completed").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toISOString().startsWith(today));
    const todayRevenue = todayOrders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.grandTotal, 0);

    // Last 7 days revenue
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayOrders = orders.filter((o) => new Date(o.createdAt).toISOString().startsWith(ds) && o.paymentStatus === "paid");
      return { date: ds, revenue: dayOrders.reduce((sum, o) => sum + o.grandTotal, 0), count: dayOrders.length };
    }).reverse();

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalOrders: orders.length,
      completedOrders,
      cancelledOrders,
      totalCustomers: customers.length,
      totalProducts: products.length,
      todayRevenue,
      todayOrders: todayOrders.length,
      last7Days: last7,
    };
  },
});

// ── Laporan Penjualan Harian (SDOT 2.2): revenue, diskon, per kategori,
// top SKU, metode pembayaran, peak hour ─────────────────────────────────────
export const sales = query({
  args: { tenantId: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const days = args.days ?? 7;
    const orders = await ctx.db.query("orders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const recent = orders.filter((o) => o.createdAt >= cutoff);
    const paid = recent.filter((o) => o.paymentStatus === "paid");

    const products = await ctx.db.query("products").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const categories = await ctx.db.query("categories").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const productMap = new Map(products.map((p) => [p._id as any, p]));
    const catMap = new Map(categories.map((c) => [c._id as any, c]));

    // Ambil item order utk semua order terbaru
    const itemsByOrder = new Map<string, any[]>();
    for (const o of recent) {
      const items = await ctx.db.query("orderItems").withIndex("by_order", (q: any) => q.eq("orderId", o._id as any)).collect();
      itemsByOrder.set(o._id as any, items);
    }

    // Harian
    const dailyMap = new Map<string, { revenue: number; count: number; discount: number }>();
    const paymentMap = new Map<string, { count: number; revenue: number }>();
    const hourMap = new Map<number, { count: number; revenue: number }>();
    const catMapAgg = new Map<string, { revenue: number; count: number }>();
    const skuMap = new Map<string, { name: string; qty: number; revenue: number }>();

    for (const o of recent) {
      const d = new Date(o.createdAt);
      const ds = d.toISOString().split("T")[0];
      const day = dailyMap.get(ds) ?? { revenue: 0, count: 0, discount: 0 };
      day.count += 1;
      day.revenue += o.paymentStatus === "paid" ? o.grandTotal : 0;
      day.discount += o.discountTotal ?? 0;
      dailyMap.set(ds, day);

      const hour = hourMap.get(d.getHours()) ?? { count: 0, revenue: 0 };
      hour.count += 1;
      hour.revenue += o.paymentStatus === "paid" ? o.grandTotal : 0;
      hourMap.set(d.getHours(), hour);

      const method = o.paymentMethod ?? "lainnya";
      const pm = paymentMap.get(method) ?? { count: 0, revenue: 0 };
      pm.count += 1;
      pm.revenue += o.paymentStatus === "paid" ? o.grandTotal : 0;
      paymentMap.set(method, pm);

      const items = itemsByOrder.get(o._id as any) ?? [];
      for (const it of items) {
        const sku = skuMap.get(it.productId) ?? { name: it.nameSnapshot, qty: 0, revenue: 0 };
        sku.qty += it.qty;
        sku.revenue += it.subtotal;
        skuMap.set(it.productId, sku);

        const prod = productMap.get(it.productId);
        const catId = prod?.categoryId;
        const catName = catId ? catMap.get(catId)?.name ?? "Tanpa Kategori" : "Tanpa Kategori";
        const ca = catMapAgg.get(catName) ?? { revenue: 0, count: 0 };
        ca.revenue += it.subtotal;
        ca.count += it.qty;
        catMapAgg.set(catName, ca);
      }
    }

    return {
      days,
      daily: Array.from(dailyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, v]) => ({ date, ...v })),
      totalRevenue: paid.reduce((s, o) => s + o.grandTotal, 0),
      totalOrders: recent.length,
      totalDiscount: recent.reduce((s, o) => s + (o.discountTotal ?? 0), 0),
      byPayment: Array.from(paymentMap.entries()).map(([method, v]) => ({ method, ...v })),
      peakHours: Array.from(hourMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .map(([hour, v]) => ({ hour, ...v })),
      byCategory: Array.from(catMapAgg.entries())
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .map(([name, v]) => ({ name, ...v })),
      topSku: Array.from(skuMap.entries())
        .sort((a, b) => b[1].qty - a[1].qty)
        .slice(0, 10)
        .map(([productId, v]) => ({ productId, ...v })),
    };
  },
});

// ── P&L / Keuangan (SDOT 2.2): COGS, gross profit, margin per kategori ─────
export const finance = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const paid = orders.filter((o) => o.paymentStatus === "paid");
    const expenses = await ctx.db.query("expenses").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const products = await ctx.db.query("products").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const categories = await ctx.db.query("categories").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    const productMap = new Map(products.map((p) => [p._id as any, p]));
    const catMap = new Map(categories.map((c) => [c._id as any, c]));

    const revenue = paid.reduce((s, o) => s + o.grandTotal, 0);
    let cogs = 0;
    const catAgg = new Map<string, { revenue: number; cogs: number; qty: number }>();

    for (const o of orders) {
      const items = await ctx.db.query("orderItems").withIndex("by_order", (q: any) => q.eq("orderId", o._id as any)).collect();
      for (const it of items) {
        const prod = productMap.get(it.productId);
        const cost = prod?.costPrice ?? 0;
        const itemCogs = cost * it.qty;
        const itemRev = it.subtotal;
        cogs += itemCogs;
        const catId = prod?.categoryId;
        const catName = catId ? catMap.get(catId)?.name ?? "Tanpa Kategori" : "Tanpa Kategori";
        const ca = catAgg.get(catName) ?? { revenue: 0, cogs: 0, qty: 0 };
        ca.revenue += itemRev;
        ca.cogs += itemCogs;
        ca.qty += it.qty;
        catAgg.set(catName, ca);
      }
    }

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    return {
      revenue,
      cogs,
      grossProfit,
      grossMarginPercent: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      totalExpenses,
      netProfit,
      netMarginPercent: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      byCategory: Array.from(catAgg.entries())
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .map(([name, v]) => ({ name, ...v, marginPercent: v.revenue > 0 ? ((v.revenue - v.cogs) / v.revenue) * 100 : 0 })),
    };
  },
});
