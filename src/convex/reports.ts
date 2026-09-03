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
