import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    return users.filter((u) => !u.isPlatformAdmin).map((u) => ({
      _id: u._id,
      name: u.name ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      role: u.role ?? "staff",
      pin: u.pin,
      isActive: u.isActive ?? true,
    }));
  },
});

export const create = mutation({
  args: { tenantId: v.string(), name: v.string(), email: v.string(), phone: v.optional(v.string()), role: v.string(), pin: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("users", { ...args, isActive: true, createdAt: Date.now() } as any),
});

export const update = mutation({
  args: { id: v.id("users"), name: v.optional(v.string()), phone: v.optional(v.string()), role: v.optional(v.string()), pin: v.optional(v.string()), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => ctx.db.patch(args.id, Object.fromEntries(Object.entries({ name: args.name, phone: args.phone, role: args.role, pin: args.pin, isActive: args.isActive }).filter(([, v]) => v !== undefined))),
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
