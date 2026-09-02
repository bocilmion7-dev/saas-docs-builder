import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// ─── Validators ─────────────────────────────────────────────────────────────

export const BUSINESS_CATEGORIES = ["cafe","restoran","toko_retail","bengkel","bakery","toko_cat","spa","toko_sparepart","toko_kain"] as const;
export const businessCategoryValidator = v.union(...BUSINESS_CATEGORIES.map(v.literal));
export type BusinessCategory = Infer<typeof businessCategoryValidator>;

export const TENANT_STATUSES = ["trialing","active","past_due","expired","suspended","cancelled"] as const;
export const tenantStatusValidator = v.union(...TENANT_STATUSES.map(v.literal));

export const ORDER_STATUSES = ["pending","confirmed","preparing","ready","served","completed","cancelled"] as const;
export const orderStatusValidator = v.union(...ORDER_STATUSES.map(v.literal));

export const PAYMENT_METHODS = ["tunai","qris","kartu_debit","kartu_kredit","transfer","tempo","room_charge","corporate"] as const;
export const paymentMethodValidator = v.union(...PAYMENT_METHODS.map(v.literal));

export const PAYMENT_STATUSES = ["pending","paid","failed","refunded"] as const;
export const paymentStatusValidator = v.union(...PAYMENT_STATUSES.map(v.literal));

// ─── Schema ─────────────────────────────────────────────────────────────────

const schema = defineSchema({
  ...authTables,

  // ═══════════════════════════════════════════════════════════════════════════
  // PLATFORM (10 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  users: defineTable({
    name: v.optional(v.string()), image: v.optional(v.string()), email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()), isAnonymous: v.optional(v.boolean()),
    tenantId: v.optional(v.string()), role: v.optional(v.string()), phone: v.optional(v.string()),
    pin: v.optional(v.string()), isActive: v.optional(v.boolean()), isPlatformAdmin: v.optional(v.boolean()),
  }).index("email", ["email"]).index("by_tenant", ["tenantId"]),

  tenants: defineTable({
    name: v.string(), subdomain: v.string(), category: businessCategoryValidator,
    status: tenantStatusValidator, trialEndsAt: v.number(), subscriptionPlanId: v.optional(v.string()),
    logoUrl: v.optional(v.string()), address: v.optional(v.string()), phone: v.optional(v.string()),
    email: v.optional(v.string()), cityId: v.optional(v.number()), settings: v.optional(v.any()),
    activeTemplateId: v.optional(v.string()), storefrontConfig: v.optional(v.any()),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_subdomain", ["subdomain"]).index("by_category", ["category"]).index("by_status", ["status"]),

  subscriptionPlans: defineTable({
    name: v.string(), slug: v.string(), priceMonthly: v.number(), priceYearly: v.number(),
    trialDaysDefault: v.number(), maxProducts: v.number(), maxStaff: v.number(),
    maxTransactionsMonth: v.number(), isActive: v.boolean(), createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  featureFlags: defineTable({
    key: v.string(), name: v.string(), description: v.optional(v.string()),
    categoryModule: v.string(), isPaidDefault: v.boolean(), isTrialAccessible: v.boolean(),
    isActive: v.boolean(), createdAt: v.number(),
  }).index("by_key", ["key"]),

  planFeatures: defineTable({
    planId: v.string(), featureFlagId: v.string(), isEnabled: v.boolean(),
  }).index("by_plan", ["planId"]).index("by_feature", ["featureFlagId"]),

  templates: defineTable({
    category: businessCategoryValidator, name: v.string(), slug: v.string(),
    previewUrl: v.optional(v.string()), configJson: v.any(), isActive: v.boolean(), createdAt: v.number(),
  }).index("by_category", ["category"]),

  roles: defineTable({
    tenantId: v.string(), name: v.string(), isSystem: v.boolean(),
    description: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_name", ["tenantId", "name"]),

  permissions: defineTable({
    key: v.string(), name: v.string(), createdAt: v.number(),
  }).index("by_key", ["key"]),

  rolePermissions: defineTable({
    roleId: v.string(), permissionId: v.string(),
  }).index("by_role", ["roleId"]).index("by_permission", ["permissionId"]),

  userRoles: defineTable({
    userId: v.string(), roleId: v.string(),
  }).index("by_user", ["userId"]).index("by_role", ["roleId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // CATALOG & UNIVERSAL (15 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  categories: defineTable({
    tenantId: v.string(), name: v.string(), slug: v.string(), type: v.string(),
    parentId: v.optional(v.string()), imageUrl: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_slug", ["tenantId", "slug"]),

  brands: defineTable({ tenantId: v.string(), name: v.string(), logoUrl: v.optional(v.string()), createdAt: v.number() }).index("by_tenant", ["tenantId"]),
  units: defineTable({ tenantId: v.string(), name: v.string(), symbol: v.string(), createdAt: v.number() }).index("by_tenant", ["tenantId"]),

  products: defineTable({
    tenantId: v.string(), categoryId: v.optional(v.string()), brandId: v.optional(v.string()),
    unitId: v.optional(v.string()), name: v.string(), slug: v.string(), description: v.optional(v.string()),
    price: v.number(), costPrice: v.number(), sku: v.string(), barcode: v.optional(v.string()),
    stockQuantity: v.number(), minStock: v.number(), maxStock: v.optional(v.number()),
    weightGram: v.number(), isActive: v.boolean(), isTintable: v.optional(v.boolean()),
    baseType: v.optional(v.string()), expiryDays: v.optional(v.number()),
    isFastMoving: v.optional(v.boolean()), isRaw: v.optional(v.boolean()),
    attributes: v.optional(v.any()), imageUrl: v.optional(v.string()),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_category", ["tenantId", "categoryId"])
    .index("by_tenant_sku", ["tenantId", "sku"]).index("by_tenant_barcode", ["tenantId", "barcode"]),

  productVariants: defineTable({
    productId: v.string(), tenantId: v.string(), name: v.string(), sku: v.string(),
    barcode: v.optional(v.string()), price: v.number(), stockQuantity: v.number(),
    attributes: v.optional(v.any()), createdAt: v.number(),
  }).index("by_product", ["productId"]).index("by_tenant", ["tenantId"]),

  productSuppliers: defineTable({
    productId: v.string(), supplierId: v.string(), tenantId: v.string(),
    supplierSku: v.optional(v.string()), costPrice: v.number(),
    leadTimeDays: v.number(), isPrimary: v.boolean(), createdAt: v.number(),
  }).index("by_product", ["productId"]).index("by_supplier", ["supplierId"]),

  customers: defineTable({
    tenantId: v.string(), name: v.string(), phone: v.optional(v.string()), email: v.optional(v.string()),
    address: v.optional(v.string()), type: v.string(), loyaltyPoints: v.number(),
    colorHistory: v.optional(v.any()), vehicleHistory: v.optional(v.any()),
    piutangTotal: v.number(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_name", ["tenantId", "name"]),

  suppliers: defineTable({
    tenantId: v.string(), name: v.string(), contactName: v.optional(v.string()),
    phone: v.optional(v.string()), email: v.optional(v.string()), address: v.optional(v.string()),
    type: v.string(), isApproved: v.boolean(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  warehouses: defineTable({
    tenantId: v.string(), name: v.string(), location: v.optional(v.string()),
    type: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  stockMovements: defineTable({
    tenantId: v.string(), productId: v.string(), variantId: v.optional(v.string()),
    warehouseId: v.optional(v.string()), type: v.string(), qty: v.number(),
    qtyBefore: v.number(), qtyAfter: v.number(), referenceType: v.optional(v.string()),
    referenceId: v.optional(v.string()), note: v.optional(v.string()),
    createdBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_product", ["tenantId", "productId"])
    .index("by_tenant_created", ["tenantId", "createdAt"]),

  orders: defineTable({
    tenantId: v.string(), orderNumber: v.string(), customerId: v.optional(v.string()),
    status: orderStatusValidator, subtotal: v.number(), discountTotal: v.number(),
    taxTotal: v.number(), grandTotal: v.number(), paymentMethod: v.optional(paymentMethodValidator()),
    paymentStatus: paymentStatusValidator, notes: v.optional(v.string()),
    tableId: v.optional(v.string()), createdBy: v.string(),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_status", ["tenantId", "status"])
    .index("by_tenant_created", ["tenantId", "createdAt"]),

  orderItems: defineTable({
    orderId: v.string(), productId: v.string(), variantId: v.optional(v.string()),
    nameSnapshot: v.string(), priceSnapshot: v.number(), qty: v.number(),
    subtotal: v.number(), notes: v.optional(v.string()),
  }).index("by_order", ["orderId"]),

  payments: defineTable({
    tenantId: v.string(), orderId: v.string(), method: v.string(), amount: v.number(),
    status: v.string(), midtransOrderId: v.optional(v.string()),
    midtransTransactionId: v.optional(v.string()), rawResponse: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_order", ["orderId"])
    .index("by_midtrans_order", ["midtransOrderId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTORY & PROCUREMENT (10 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  purchaseRequests: defineTable({
    tenantId: v.string(), productId: v.string(), qtyNeeded: v.number(),
    reason: v.string(), status: v.string(), requestedBy: v.optional(v.string()),
    approvedBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  purchaseOrders: defineTable({
    tenantId: v.string(), supplierId: v.string(), poNumber: v.string(),
    status: v.string(), totalCost: v.number(), expectedDate: v.optional(v.number()),
    notes: v.optional(v.string()), createdBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_status", ["tenantId", "status"]),

  purchaseOrderItems: defineTable({
    poId: v.string(), productId: v.string(), qty: v.number(), costPrice: v.number(),
    qtyReceived: v.number(), createdAt: v.number(),
  }).index("by_po", ["poId"]),

  goodsReceivedNotes: defineTable({
    tenantId: v.string(), poId: v.string(), grnNumber: v.string(),
    receivedBy: v.optional(v.string()), receivedAt: v.number(), status: v.string(),
    notes: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_po", ["poId"]),

  grnItems: defineTable({
    grnId: v.string(), productId: v.string(), qtyOrdered: v.number(),
    qtyReceived: v.number(), qtyRejected: v.number(), expiryDate: v.optional(v.number()),
    batchNumber: v.optional(v.string()), notes: v.optional(v.string()), createdAt: v.number(),
  }).index("by_grn", ["grnId"]),

  returnToSupplier: defineTable({
    tenantId: v.string(), poId: v.optional(v.string()), supplierId: v.string(),
    rtsNumber: v.string(), reason: v.string(), status: v.string(),
    notes: v.optional(v.string()), createdBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  rtsItems: defineTable({
    rtsId: v.string(), productId: v.string(), qty: v.number(), reason: v.string(), createdAt: v.number(),
  }).index("by_rts", ["rtsId"]),

  stockOpnameSessions: defineTable({
    tenantId: v.string(), warehouseId: v.optional(v.string()), sessionNumber: v.string(),
    status: v.string(), snapshotAt: v.number(), countedBy: v.optional(v.string()),
    approvedBy: v.optional(v.string()), notes: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  stockOpnameItems: defineTable({
    sessionId: v.string(), productId: v.string(), binLocationId: v.optional(v.string()),
    qtySystem: v.number(), qtyActual: v.number(), variance: v.number(),
    note: v.optional(v.string()), createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  stockAdjustments: defineTable({
    tenantId: v.string(), productId: v.string(), warehouseId: v.optional(v.string()),
    type: v.string(), qty: v.number(), reason: v.string(), evidenceUrl: v.optional(v.string()),
    status: v.string(), approvedBy: v.optional(v.string()),
    createdBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // POS & REPORTS (6 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  posShifts: defineTable({
    tenantId: v.string(), userId: v.string(), openingCash: v.number(),
    closingCashActual: v.optional(v.number()), expectedCash: v.optional(v.number()),
    variance: v.optional(v.number()), status: v.string(), openedAt: v.number(),
    closedAt: v.optional(v.number()),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_status", ["tenantId", "status"]),

  dailyReports: defineTable({
    tenantId: v.string(), date: v.string(), data: v.any(), createdAt: v.number(),
  }).index("by_tenant_date", ["tenantId", "date"]),

  auditLogs: defineTable({
    tenantId: v.string(), userId: v.optional(v.string()), action: v.string(),
    entityType: v.string(), entityId: v.optional(v.string()), oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()), ipAddress: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_created", ["tenantId", "createdAt"]),

  vouchers: defineTable({
    tenantId: v.string(), code: v.string(), type: v.string(), value: v.number(),
    minPurchase: v.number(), maxDiscount: v.optional(v.number()), quota: v.number(),
    usedCount: v.number(), startDate: v.optional(v.number()), endDate: v.optional(v.number()),
    isActive: v.boolean(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_code", ["tenantId", "code"]),

  loyaltyTransactions: defineTable({
    tenantId: v.string(), customerId: v.string(), type: v.string(), points: v.number(),
    referenceType: v.optional(v.string()), referenceId: v.optional(v.string()),
    note: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_customer", ["customerId"]),

  expenseCategories: defineTable({
    tenantId: v.string(), name: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  expenses: defineTable({
    tenantId: v.string(), categoryId: v.optional(v.string()), description: v.string(),
    amount: v.number(), date: v.number(), receiptUrl: v.optional(v.string()),
    createdBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_date", ["tenantId", "date"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // CAFE / RESTORAN (10 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  diningTables: defineTable({
    tenantId: v.string(), number: v.number(), capacity: v.number(),
    area: v.string(), status: v.string(), currentSessionId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_status", ["tenantId", "status"]),

  tableSessions: defineTable({
    tenantId: v.string(), tableId: v.string(), orderId: v.optional(v.string()),
    sessionNumber: v.string(), openedAt: v.number(), closedAt: v.optional(v.number()),
    guestCount: v.number(), status: v.string(),
  }).index("by_tenant", ["tenantId"]).index("by_table", ["tableId"]),

  reservations: defineTable({
    tenantId: v.string(), customerId: v.optional(v.string()), customerName: v.string(),
    customerPhone: v.string(), date: v.number(), time: v.string(), pax: v.number(),
    area: v.string(), tableId: v.optional(v.string()), specialRequest: v.optional(v.string()),
    status: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_date", ["tenantId", "date"]),

  waitingLists: defineTable({
    tenantId: v.string(), customerName: v.string(), phone: v.string(),
    guestCount: v.number(), waitingSince: v.number(), estimatedWaitMinutes: v.number(),
    status: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  kitchenStations: defineTable({
    tenantId: v.string(), name: v.string(), type: v.string(),
    printerIp: v.optional(v.string()), displayId: v.optional(v.string()), isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  kdsOrders: defineTable({
    tenantId: v.string(), orderId: v.string(), stationId: v.string(),
    ticketNumber: v.string(), items: v.any(), status: v.string(),
    priority: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_station", ["stationId"]),

  menuModifiers: defineTable({
    tenantId: v.string(), name: v.string(), type: v.string(),
    options: v.any(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  orderItemModifiers: defineTable({
    orderItemId: v.string(), modifierId: v.string(), optionName: v.string(),
    priceAdditional: v.number(), createdAt: v.number(),
  }).index("by_order_item", ["orderItemId"]),

  splitBills: defineTable({
    tenantId: v.string(), orderId: v.string(), billLabel: v.string(),
    itemIds: v.any(), subtotal: v.number(), paymentMethod: v.optional(v.string()),
    paymentStatus: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_order", ["orderId"]),

  loyaltyPrograms: defineTable({
    tenantId: v.string(), name: v.string(), type: v.string(),
    threshold: v.number(), rewardDescription: v.string(), isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKO CAT (11 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  tintingMachines: defineTable({
    tenantId: v.string(), name: v.string(), status: v.string(),
    totalMixCount: v.number(), lastCalibrationAt: v.optional(v.number()),
    lastCleanedAt: v.optional(v.number()), dbWarnaVersion: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  colorFormulas: defineTable({
    tenantId: v.string(), colorCode: v.string(), colorName: v.string(),
    brand: v.string(), baseType: v.string(), finish: v.string(),
    pigmentMix: v.any(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_code", ["tenantId", "colorCode"]),

  colorSamples: defineTable({
    tenantId: v.string(), customerId: v.optional(v.string()),
    colorCode: v.string(), volumeMl: v.number(), status: v.string(),
    testerPrice: v.number(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  wasteLogsCat: defineTable({
    tenantId: v.string(), type: v.string(), drumCode: v.optional(v.string()),
    disposalMethod: v.string(), buyerName: v.optional(v.string()),
    qty: v.number(), unit: v.string(), note: v.optional(v.string()),
    createdBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  contractorProjects: defineTable({
    tenantId: v.string(), customerId: v.optional(v.string()), name: v.string(),
    location: v.optional(v.string()), luasTotalM2: v.number(), status: v.string(),
    totalValue: v.number(), paymentType: v.string(),
    terminDetails: v.optional(v.any()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  deliveryOrders: defineTable({
    tenantId: v.string(), projectId: v.optional(v.string()), doNumber: v.string(),
    vehicleNumber: v.optional(v.string()), driverName: v.optional(v.string()),
    quantityTotal: v.number(), status: v.string(), signedBy: v.optional(v.string()),
    signedAt: v.optional(v.number()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  complaintTickets: defineTable({
    tenantId: v.string(), customerId: v.optional(v.string()), orderId: v.optional(v.string()),
    type: v.string(), description: v.string(), evidenceUrls: v.optional(v.any()),
    status: v.string(), investigationResult: v.optional(v.string()),
    resolution: v.optional(v.string()), handledBy: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_status", ["tenantId", "status"]),

  hseChecklists: defineTable({
    tenantId: v.string(), date: v.string(), data: v.any(),
    checkedBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant_date", ["tenantId", "date"]),

  openingClosingLogs: defineTable({
    tenantId: v.string(), type: v.string(), data: v.any(),
    performedBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_type", ["tenantId", "type"]),

  machineMaintenanceLogs: defineTable({
    tenantId: v.string(), machineId: v.optional(v.string()), type: v.string(),
    performedBy: v.optional(v.string()), nextDueAt: v.optional(v.number()),
    notes: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  pigmentStock: defineTable({
    tenantId: v.string(), colorCode: v.string(), quantityMl: v.number(),
    lastRestockedAt: v.optional(v.number()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // SPA (8 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  spaBookings: defineTable({
    tenantId: v.string(), customerId: v.optional(v.string()), serviceId: v.string(),
    therapistId: v.optional(v.string()), roomId: v.optional(v.string()),
    date: v.number(), time: v.string(), durationMinutes: v.number(),
    status: v.string(), specialRequest: v.optional(v.string()),
    source: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_date", ["tenantId", "date"]),

  spaHealthForms: defineTable({
    tenantId: v.string(), bookingId: v.string(), customerId: v.string(),
    jantung: v.boolean(), darahTinggi: v.boolean(), hamil: v.boolean(),
    alergi: v.optional(v.string()), tekanan: v.string(), areaFokus: v.optional(v.string()),
    aroma: v.optional(v.string()), informedConsent: v.boolean(),
    createdAt: v.number(),
  }).index("by_booking", ["bookingId"]),

  spaRooms: defineTable({
    tenantId: v.string(), name: v.string(), type: v.string(),
    capacity: v.number(), facilities: v.any(), status: v.string(),
    temperature: v.optional(v.number()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  spaTherapists: defineTable({
    tenantId: v.string(), name: v.string(), gender: v.string(),
    specialization: v.any(), rating: v.number(), isAvailable: v.boolean(),
    commissionRate: v.number(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  spaTreatmentLogs: defineTable({
    tenantId: v.string(), bookingId: v.string(), therapistId: v.string(),
    steps: v.any(), midCheckComfort: v.optional(v.boolean()),
    notes: v.optional(v.string()), createdAt: v.number(),
  }).index("by_booking", ["bookingId"]),

  spaMemberships: defineTable({
    tenantId: v.string(), customerId: v.string(), type: v.string(),
    visitsTotal: v.number(), visitsUsed: v.number(),
    startDate: v.number(), endDate: v.number(), status: v.string(),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_customer", ["customerId"]),

  spaDayPasses: defineTable({
    tenantId: v.string(), customerId: v.optional(v.string()), accessType: v.string(),
    price: v.number(), date: v.number(), status: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  spaRetailUpsells: defineTable({
    tenantId: v.string(), bookingId: v.string(), productId: v.string(),
    recommendedBy: v.optional(v.string()), sold: v.boolean(),
    soldAt: v.optional(v.number()), createdAt: v.number(),
  }).index("by_booking", ["bookingId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // BAKERY (8 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  productionPlans: defineTable({
    tenantId: v.string(), planDate: v.number(), type: v.string(),
    status: v.string(), notes: v.optional(v.string()),
    assignedTo: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_date", ["tenantId", "planDate"]),

  productionBatches: defineTable({
    tenantId: v.string(), planId: v.optional(v.string()), productId: v.string(),
    batchSize: v.number(), status: v.string(), proofingTemp: v.optional(v.number()),
    proofingHumidity: v.optional(v.number()), bakingTemp: v.optional(v.number()),
    startedAt: v.number(), completedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_plan", ["planId"]),

  productionQcLogs: defineTable({
    tenantId: v.string(), batchId: v.string(), checkType: v.string(),
    result: v.string(), notes: v.optional(v.string()),
    checkedBy: v.optional(v.string()), createdAt: v.number(),
  }).index("by_batch", ["batchId"]),

  displayCounters: defineTable({
    tenantId: v.string(), name: v.string(), type: v.string(),
    temperatureTarget: v.number(), status: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  displayCounterItems: defineTable({
    counterId: v.string(), batchId: v.optional(v.string()), productId: v.string(),
    qtyDisplay: v.number(), position: v.optional(v.string()),
    expiresAt: v.number(), createdAt: v.number(),
  }).index("by_counter", ["counterId"]),

  customCakeOrders: defineTable({
    tenantId: v.string(), customerId: v.optional(v.string()),
    cakeType: v.string(), size: v.string(), flavor: v.string(),
    filling: v.optional(v.string()), decoration: v.optional(v.string()),
    mockupUrl: v.optional(v.string()), priceEstimated: v.number(),
    deposit50Percent: v.number(), depositStatus: v.string(),
    deadline: v.number(), status: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  bakeryWasteLogs: defineTable({
    tenantId: v.string(), productId: v.optional(v.string()),
    reason: v.string(), disposalMethod: v.string(), qty: v.number(),
    unit: v.string(), note: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  discountRules: defineTable({
    tenantId: v.string(), name: v.string(), type: v.string(),
    value: v.number(), timeStart: v.optional(v.string()),
    timeEnd: v.optional(v.string()), minPurchase: v.number(),
    isActive: v.boolean(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // BENGKEL (10 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  vehicles: defineTable({
    tenantId: v.string(), plateNumber: v.string(), brand: v.string(),
    model: v.string(), year: v.number(), engineType: v.optional(v.string()),
    vinNumber: v.optional(v.string()), kmLast: v.optional(v.number()),
    lastServiceAt: v.optional(v.number()), customerId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_tenant_plate", ["tenantId", "plateNumber"]),

  workOrders: defineTable({
    tenantId: v.string(), woNumber: v.string(), vehicleId: v.string(),
    complaint: v.string(), diagnosis: v.optional(v.string()),
    type: v.string(), status: v.string(),
    estimatedCostPart: v.number(), estimatedCostJasa: v.number(),
    estimatedTimeHours: v.optional(v.number()),
    approvedByCustomer: v.boolean(), approvedAt: v.optional(v.number()),
    createdBy: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_vehicle", ["vehicleId"])
    .index("by_tenant_status", ["tenantId", "status"]),

  jobCards: defineTable({
    tenantId: v.string(), workOrderId: v.string(), area: v.string(),
    title: v.string(), mechanicId: v.optional(v.string()),
    status: v.string(), createdAt: v.number(),
  }).index("by_work_order", ["workOrderId"]).index("by_tenant", ["tenantId"]),

  vehicleInspections: defineTable({
    tenantId: v.string(), vehicleId: v.string(), workOrderId: v.optional(v.string()),
    type: v.string(), findings: v.any(), inspectedBy: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_vehicle", ["vehicleId"]),

  sparepartIssues: defineTable({
    tenantId: v.string(), jobCardId: v.string(), productId: v.string(),
    qty: v.number(), issuedBy: v.optional(v.string()),
    jobCardNumber: v.string(), createdAt: v.number(),
  }).index("by_job_card", ["jobCardId"]),

  additionalFindings: defineTable({
    tenantId: v.string(), workOrderId: v.string(), finding: v.string(),
    estimatedCostTambahan: v.number(), customerApprovalStatus: v.string(),
    informedAt: v.optional(v.number()), informedVia: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_work_order", ["workOrderId"]),

  qcTestDrives: defineTable({
    tenantId: v.string(), workOrderId: v.string(), foremanId: v.string(),
    kmStart: v.number(), kmEnd: v.number(), complaintResolved: v.boolean(),
    abnormalNoise: v.boolean(), vibration: v.boolean(), leakage: v.boolean(),
    result: v.string(), notes: v.optional(v.string()), createdAt: v.number(),
  }).index("by_work_order", ["workOrderId"]),

  serviceReminders: defineTable({
    tenantId: v.string(), vehicleId: v.string(), lastServiceKm: v.optional(v.number()),
    lastServiceDate: v.optional(v.number()), nextServiceKm: v.optional(v.number()),
    nextServiceDate: v.optional(v.number()),
    reminderH7Sent: v.boolean(), reminderH1Sent: v.boolean(),
    status: v.string(), createdAt: v.number(),
  }).index("by_vehicle", ["vehicleId"]),

  mechanics: defineTable({
    tenantId: v.string(), name: v.string(), specialization: v.string(),
    rating: v.number(), isAvailable: v.boolean(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  toolsMaintenance: defineTable({
    tenantId: v.string(), toolName: v.string(), lastMaintenanceAt: v.number(),
    nextMaintenanceAt: v.number(), notes: v.optional(v.string()), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // SPAREPART (4 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  partCompatibility: defineTable({
    tenantId: v.string(), productId: v.string(), brand: v.string(),
    model: v.string(), yearStart: v.number(), yearEnd: v.number(),
    engineType: v.optional(v.string()), vinPattern: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_product", ["productId"]),

  partCrossReferences: defineTable({
    tenantId: v.string(), productId: v.string(), oemNumber: v.string(),
    aftermarketNumber: v.string(), brand: v.string(), type: v.string(),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_product", ["productId"]),

  partWarranties: defineTable({
    tenantId: v.string(), productId: v.string(), warrantyType: v.string(),
    durationMonths: v.number(), kmLimit: v.number(), createdAt: v.number(),
  }).index("by_product", ["productId"]),

  customerReturnsSparepart: defineTable({
    tenantId: v.string(), orderId: v.string(), productId: v.string(),
    reason: v.string(), condition: v.string(), withinThreeDays: v.boolean(),
    refundMethod: v.string(), status: v.string(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // KAIN / TEXTILE (7 tables)
  // ═══════════════════════════════════════════════════════════════════════════

  fabricRolls: defineTable({
    tenantId: v.string(), productId: v.string(), rollNumber: v.string(),
    totalMeter: v.number(), remainingMeter: v.number(),
    widthCm: v.number(), warehouseId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_product", ["productId"]),

  fabricCuts: defineTable({
    tenantId: v.string(), rollId: v.string(), customerId: v.optional(v.string()),
    requestedMeter: v.number(), extraMeter: v.number(), lengthActual: v.number(),
    motifMatching: v.boolean(), isPrecise: v.boolean(),
    notes: v.optional(v.string()), createdAt: v.number(),
  }).index("by_roll", ["rollId"]),

  fabricRemnants: defineTable({
    tenantId: v.string(), rollId: v.string(), meterRemaining: v.number(),
    barcode: v.string(), price: v.number(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  obrasServices: defineTable({
    tenantId: v.string(), cutId: v.optional(v.string()),
    sisi: v.string(), benangWarna: v.string(), biayaPerMeter: v.number(),
    status: v.string(), qcPassed: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  konveksiOrders: defineTable({
    tenantId: v.string(), customerId: v.string(), orderNumber: v.string(),
    totalRoll: v.number(), totalMeter: v.number(), hargaGrosirPerRoll: v.number(),
    paymentType: v.string(), status: v.string(), piutangStatus: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_customer", ["customerId"]),

  piutangKonveksi: defineTable({
    tenantId: v.string(), konveksiOrderId: v.string(), customerId: v.string(),
    amount: v.number(), dueDate: v.number(), status: v.string(),
    reminderH7Sent: v.boolean(), reminderH3Sent: v.boolean(),
    freezeNextOrder: v.boolean(), createdAt: v.number(),
  }).index("by_tenant", ["tenantId"]).index("by_customer", ["customerId"]),

  fabricQualityChecks: defineTable({
    tenantId: v.string(), rollId: v.string(), checkType: v.string(),
    result: v.string(), selisihPanjangPercent: v.optional(v.number()),
    notes: v.optional(v.string()), checkedBy: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_roll", ["rollId"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // BIN LOCATIONS (universal)
  // ═══════════════════════════════════════════════════════════════════════════

  binLocations: defineTable({
    warehouseId: v.string(), code: v.string(), zone: v.string(),
    category: v.optional(v.string()), createdAt: v.number(),
  }).index("by_warehouse", ["warehouseId"]),
}, { schemaValidation: false });

export default schema;
