import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const BUSINESS_CATEGORIES = [
  "cafe",
  "restoran",
  "toko_retail",
  "bengkel",
  "bakery",
  "toko_cat",
  "spa",
  "toko_sparepart",
  "toko_kain",
] as const;
export const businessCategoryValidator = v.union(
  ...BUSINESS_CATEGORIES.map(v.literal),
);
export type BusinessCategory = Infer<typeof businessCategoryValidator>;

export const TENANT_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "expired",
  "suspended",
  "cancelled",
] as const;
export const tenantStatusValidator = v.union(
  ...TENANT_STATUSES.map(v.literal),
);

export const USER_ROLES = [
  "super_admin",
  "owner",
  "manager",
  "supervisor",
  "barista",
  "kasir",
  "kitchen",
  "sales",
  "gudang",
  "finance",
  "therapist",
  "mechanic",
  "head_baker",
  "waiter",
  "runner",
] as const;
export const userRoleValidator = v.union(...USER_ROLES.map(v.literal));

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
] as const;
export const orderStatusValidator = v.union(
  ...ORDER_STATUSES.map(v.literal),
);

export const PAYMENT_METHODS = [
  "tunai",
  "qris",
  "kartu_debit",
  "kartu_kredit",
  "transfer",
] as const;
export const paymentMethodValidator = v.union(
  ...PAYMENT_METHODS.map(v.literal),
);

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;
export const paymentStatusValidator = v.union(
  ...PAYMENT_STATUSES.map(v.literal),
);

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = defineSchema(
  {
    ...authTables,

    // ── Users ──────────────────────────────────────────────────────────────
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),

      // TokoBuilder fields
      tenantId: v.optional(v.string()),
      role: v.optional(v.string()),
      phone: v.optional(v.string()),
      pin: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      isPlatformAdmin: v.optional(v.boolean()),
    })
      .index("email", ["email"])
      .index("by_tenant", ["tenantId"]),

    // ── Platform ───────────────────────────────────────────────────────────

    tenants: defineTable({
      name: v.string(),
      subdomain: v.string(),
      category: businessCategoryValidator,
      status: tenantStatusValidator,
      trialEndsAt: v.number(),
      subscriptionPlanId: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      cityId: v.optional(v.number()),
      settings: v.optional(v.any()),
      activeTemplateId: v.optional(v.string()),
      storefrontConfig: v.optional(v.any()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_subdomain", ["subdomain"])
      .index("by_category", ["category"])
      .index("by_status", ["status"]),

    subscriptionPlans: defineTable({
      name: v.string(),
      slug: v.string(),
      priceMonthly: v.number(),
      priceYearly: v.number(),
      trialDaysDefault: v.number(),
      maxProducts: v.number(),
      maxStaff: v.number(),
      maxTransactionsMonth: v.number(),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_slug", ["slug"]),

    featureFlags: defineTable({
      key: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      categoryModule: v.string(),
      isPaidDefault: v.boolean(),
      isTrialAccessible: v.boolean(),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_key", ["key"]),

    planFeatures: defineTable({
      planId: v.string(),
      featureFlagId: v.string(),
      isEnabled: v.boolean(),
    })
      .index("by_plan", ["planId"])
      .index("by_feature", ["featureFlagId"]),

    templates: defineTable({
      category: businessCategoryValidator,
      name: v.string(),
      slug: v.string(),
      previewUrl: v.optional(v.string()),
      configJson: v.any(),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_category", ["category"]),

    // ── RBAC ───────────────────────────────────────────────────────────────

    roles: defineTable({
      tenantId: v.string(),
      name: v.string(),
      isSystem: v.boolean(),
      description: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_tenant_name", ["tenantId", "name"]),

    permissions: defineTable({
      key: v.string(),
      name: v.string(),
      createdAt: v.number(),
    }).index("by_key", ["key"]),

    rolePermissions: defineTable({
      roleId: v.string(),
      permissionId: v.string(),
    })
      .index("by_role", ["roleId"])
      .index("by_permission", ["permissionId"]),

    // ── Catalog ────────────────────────────────────────────────────────────

    categories: defineTable({
      tenantId: v.string(),
      name: v.string(),
      slug: v.string(),
      type: v.string(),
      parentId: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_tenant_slug", ["tenantId", "slug"]),

    brands: defineTable({
      tenantId: v.string(),
      name: v.string(),
      logoUrl: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_tenant", ["tenantId"]),

    units: defineTable({
      tenantId: v.string(),
      name: v.string(),
      symbol: v.string(),
      createdAt: v.number(),
    }).index("by_tenant", ["tenantId"]),

    products: defineTable({
      tenantId: v.string(),
      categoryId: v.optional(v.string()),
      brandId: v.optional(v.string()),
      unitId: v.optional(v.string()),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      price: v.number(),
      costPrice: v.number(),
      sku: v.string(),
      barcode: v.optional(v.string()),
      stockQuantity: v.number(),
      minStock: v.number(),
      maxStock: v.optional(v.number()),
      weightGram: v.number(),
      isActive: v.boolean(),
      isTintable: v.optional(v.boolean()),
      baseType: v.optional(v.string()),
      expiryDays: v.optional(v.number()),
      isFastMoving: v.optional(v.boolean()),
      isRaw: v.optional(v.boolean()),
      attributes: v.optional(v.any()),
      imageUrl: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_tenant_category", ["tenantId", "categoryId"])
      .index("by_tenant_sku", ["tenantId", "sku"])
      .index("by_tenant_barcode", ["tenantId", "barcode"]),

    productVariants: defineTable({
      productId: v.string(),
      tenantId: v.string(),
      name: v.string(),
      sku: v.string(),
      barcode: v.optional(v.string()),
      price: v.number(),
      stockQuantity: v.number(),
      attributes: v.optional(v.any()),
      createdAt: v.number(),
    })
      .index("by_product", ["productId"])
      .index("by_tenant", ["tenantId"]),

    // ── Customers & Suppliers ──────────────────────────────────────────────

    customers: defineTable({
      tenantId: v.string(),
      name: v.string(),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      address: v.optional(v.string()),
      type: v.string(),
      loyaltyPoints: v.number(),
      colorHistory: v.optional(v.any()),
      vehicleHistory: v.optional(v.any()),
      piutangTotal: v.number(),
      createdAt: v.number(),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_tenant_name", ["tenantId", "name"]),

    suppliers: defineTable({
      tenantId: v.string(),
      name: v.string(),
      contactName: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      address: v.optional(v.string()),
      type: v.string(),
      isApproved: v.boolean(),
      createdAt: v.number(),
    }).index("by_tenant", ["tenantId"]),

    // ── Inventory ──────────────────────────────────────────────────────────

    warehouses: defineTable({
      tenantId: v.string(),
      name: v.string(),
      location: v.optional(v.string()),
      type: v.string(),
      createdAt: v.number(),
    }).index("by_tenant", ["tenantId"]),

    stockMovements: defineTable({
      tenantId: v.string(),
      productId: v.string(),
      variantId: v.optional(v.string()),
      warehouseId: v.optional(v.string()),
      type: v.string(),
      qty: v.number(),
      qtyBefore: v.number(),
      qtyAfter: v.number(),
      referenceType: v.optional(v.string()),
      referenceId: v.optional(v.string()),
      note: v.optional(v.string()),
      createdBy: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_tenant_product", ["tenantId", "productId"])
      .index("by_tenant_created", ["tenantId", "createdAt"]),

    // ── Orders & POS ───────────────────────────────────────────────────────

    orders: defineTable({
      tenantId: v.string(),
      orderNumber: v.string(),
      customerId: v.optional(v.string()),
      status: orderStatusValidator,
      subtotal: v.number(),
      discountTotal: v.number(),
      taxTotal: v.number(),
      grandTotal: v.number(),
      paymentMethod: v.optional(paymentMethodValidator),
      paymentStatus: paymentStatusValidator,
      notes: v.optional(v.string()),
      tableId: v.optional(v.string()),
      createdBy: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_tenant_status", ["tenantId", "status"])
      .index("by_tenant_created", ["tenantId", "createdAt"]),

    orderItems: defineTable({
      orderId: v.string(),
      productId: v.string(),
      variantId: v.optional(v.string()),
      nameSnapshot: v.string(),
      priceSnapshot: v.number(),
      qty: v.number(),
      subtotal: v.number(),
      notes: v.optional(v.string()),
    }).index("by_order", ["orderId"]),

    // ── POS Shifts ─────────────────────────────────────────────────────────

    posShifts: defineTable({
      tenantId: v.string(),
      userId: v.string(),
      openingCash: v.number(),
      closingCashActual: v.optional(v.number()),
      expectedCash: v.optional(v.number()),
      variance: v.optional(v.number()),
      status: v.string(),
      openedAt: v.number(),
      closedAt: v.optional(v.number()),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_tenant_status", ["tenantId", "status"]),

    // ── Reports ────────────────────────────────────────────────────────────

    dailyReports: defineTable({
      tenantId: v.string(),
      date: v.string(),
      data: v.any(),
      createdAt: v.number(),
    })
      .index("by_tenant_date", ["tenantId", "date"]),

    // ── Audit Log ──────────────────────────────────────────────────────────

    auditLogs: defineTable({
      tenantId: v.string(),
      userId: v.optional(v.string()),
      action: v.string(),
      entityType: v.string(),
      entityId: v.optional(v.string()),
      oldValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      ipAddress: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_tenant", ["tenantId"])
      .index("by_tenant_created", ["tenantId", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
