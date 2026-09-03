import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Reuse the schema defined in schema.ts — products with isRaw flag and attributes.bom
// BOM is stored as product attributes: { bom: [{ productId, qty, unit }] }

export const listRecipes = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    return products.filter((p) => p.attributes?.bom && Array.isArray(p.attributes.bom) && p.attributes.bom.length > 0)
      .map((p) => ({ _id: p._id, name: p.name, sku: p.sku, bom: p.attributes.bom, updatedAt: p.updatedAt }));
  },
});

export const saveRecipe = mutation({
  args: { productId: v.id("products"), bom: v.any() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.productId, { attributes: { ...product.attributes, bom: args.bom }, updatedAt: Date.now() });
  },
});

export const listIngredients = query({
  args: { tenantId: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId)).collect();
    return products.filter((p) => p.isRaw === true).map((p) => ({ _id: p._id, name: p.name, sku: p.sku, stockQuantity: p.stockQuantity }));
  },
});
