import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed 9 demo tenants — one per business category — with realistic dummy data.
 * Each tenant gets: user, categories, products, orders, customers, and category-specific data.
 *
 * Demo emails: cafe@tokobuilder.id, restoran@tokobuilder.id, etc.
 */
export const seedAllDemoTenants = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const day = 86400000;

    // Check if already seeded
    const existingTenants = await ctx.db.query("tenants").collect();
    if (existingTenants.length > 0) return "already seeded";

    // Auto-create plans if not seeded yet
    let freePlan = await ctx.db.query("subscriptionPlans").withIndex("by_slug", (q) => q.eq("slug", "free")).first();
    if (!freePlan) {
      const planId = await ctx.db.insert("subscriptionPlans", {
        name: "Free Trial", slug: "free", priceMonthly: 0, priceYearly: 0,
        trialDaysDefault: 14, maxProducts: 20, maxStaff: 1, maxTransactionsMonth: 50, isActive: true, createdAt: now,
      });
      freePlan = (await ctx.db.get(planId))!;
    }
    const planId = freePlan._id;

    const results: string[] = [];

    // ════════════════════════════════════════════════════════════════════════
    // 1. CAFÉ — Kopi Senja
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "cafe@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Kopi Senja", subdomain: "kopisenja", category: "cafe",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 10, currency: "IDR" },
        storefrontConfig: { primaryColor: "#8B4513", heroText: "Selamat Datang di Kopi Senja" },
        createdAt: now, updatedAt: now,
      });

      // User
      const userId = await ctx.db.insert("users", {
        name: "Owner Kopi Senja", email, tenantId, role: "Owner", isActive: true, isPlatformAdmin: false,
      } as any);

      // Categories
      const cats = ["Coffee", "Non-Coffee", "Food"];
      const catIds: string[] = [];
      for (const c of cats) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase().replace(/\s+/g, "-"), type: "product_category", createdAt: now }));
      }

      // Products (Coffee menu)
      const cafeProducts = [
        { name: "Es Kopi Susu", sku: "CF-001", price: 28000, costPrice: 8000, cat: 0 },
        { name: "Kopi Tubruk", sku: "CF-002", price: 18000, costPrice: 5000, cat: 0 },
        { name: "Cappuccino", sku: "CF-003", price: 32000, costPrice: 10000, cat: 0 },
        { name: "Matcha Latte", sku: "NC-001", price: 35000, costPrice: 12000, cat: 1 },
        { name: "Thai Tea", sku: "NC-002", price: 25000, costPrice: 7000, cat: 1 },
        { name: "Croissant", sku: "FD-001", price: 22000, costPrice: 8000, cat: 2 },
        { name: "Nasi Goreng", sku: "FD-002", price: 35000, costPrice: 12000, cat: 2 },
      ];
      const productIds: string[] = [];
      for (const p of cafeProducts) {
        productIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 100, minStock: 10, weightGram: 250, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      // Customers
      const cafeCustomers = ["Andi", "Budi", "Citra", "Dewi", "Eka"];
      const custIds: string[] = [];
      for (const c of cafeCustomers) {
        custIds.push(await ctx.db.insert("customers", { tenantId, name: c, phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`, type: "regular", loyaltyPoints: Math.floor(Math.random() * 500), piutangTotal: 0, createdAt: now }));
      }

      // Orders (7 orders over past 7 days)
      for (let i = 0; i < 7; i++) {
        const orderDate = now - i * day;
        const subtotal = 25000 + Math.floor(Math.random() * 50000);
        const tax = Math.round(subtotal * 0.1);
        const orderId = await ctx.db.insert("orders", {
          tenantId, orderNumber: `ORD-${String(i + 1).padStart(3, "0")}`,
          customerId: custIds[i % custIds.length], status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
          grandTotal: subtotal + tax, paymentMethod: "tunai", paymentStatus: "paid", createdBy: userId,
          createdAt: orderDate, updatedAt: orderDate,
        });
        await ctx.db.insert("orderItems", {
          orderId, productId: productIds[i % productIds.length], nameSnapshot: cafeProducts[i % cafeProducts.length].name,
          priceSnapshot: cafeProducts[i % cafeProducts.length].price, qty: 1 + Math.floor(Math.random() * 3),
          subtotal: cafeProducts[i % cafeProducts.length].price,
        });
      }

      // Tables
      for (let i = 1; i <= 6; i++) {
        await ctx.db.insert("diningTables", { tenantId, number: i, capacity: i <= 2 ? 2 : i <= 4 ? 4 : 6, area: i <= 3 ? "indoor" : "outdoor", status: "available", createdAt: now });
      }

      // Kitchen stations
      await ctx.db.insert("kitchenStations", { tenantId, name: "Bar", type: "bar", isActive: true, createdAt: now });
      await ctx.db.insert("kitchenStations", { tenantId, name: "Dapur", type: "kitchen", isActive: true, createdAt: now });

      results.push("cafe");
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. RESTORAN — Ayam Goreng Mantap
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "restoran@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Ayam Goreng Mantap", subdomain: "ayamgorengmantap", category: "restoran",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 10, currency: "IDR" },
        storefrontConfig: { primaryColor: "#b91c1c", heroText: "Ayam Goreng Nikmat" },
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert("users", { name: "Owner Restoran", email, tenantId, role: "Owner", isActive: true } as any);

      const catIds: string[] = [];
      for (const c of ["Makanan", "Minuman", "Pendamping"]) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase(), type: "product_category", createdAt: now }));
      }

      const restoProducts = [
        { name: "Ayam Goreng Original", sku: "RG-001", price: 35000, costPrice: 15000, cat: 0 },
        { name: "Nasi Putih", sku: "RG-002", price: 8000, costPrice: 3000, cat: 0 },
        { name: "Sambal Matah", sku: "RG-003", price: 5000, costPrice: 1500, cat: 2 },
        { name: "Es Teh Manis", sku: "RM-001", price: 8000, costPrice: 2000, cat: 1 },
        { name: "Jus Alpukat", sku: "RM-002", price: 18000, costPrice: 6000, cat: 1 },
        { name: "Kentang Goreng", sku: "RP-001", price: 20000, costPrice: 7000, cat: 2 },
      ];
      const prodIds: string[] = [];
      for (const p of restoProducts) {
        prodIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 200, minStock: 20, weightGram: 300, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      const custNames = ["Rina", "Sari", "Tommy", "Lestari", "Hendra"];
      const custIds: string[] = [];
      for (const c of custNames) {
        custIds.push(await ctx.db.insert("customers", { tenantId, name: c, phone: `0813${Math.floor(10000000 + Math.random() * 90000000)}`, type: "regular", loyaltyPoints: 0, piutangTotal: 0, createdAt: now }));
      }

      for (let i = 0; i < 10; i++) {
        const orderDate = now - i * day;
        const subtotal = 30000 + Math.floor(Math.random() * 80000);
        const tax = Math.round(subtotal * 0.1);
        const orderId = await ctx.db.insert("orders", {
          tenantId, orderNumber: `ORD-${String(i + 1).padStart(3, "0")}`,
          customerId: custIds[i % custIds.length], status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
          grandTotal: subtotal + tax, paymentMethod: "tunai", paymentStatus: "paid", createdBy: "system",
          createdAt: orderDate, updatedAt: orderDate,
        });
        await ctx.db.insert("orderItems", {
          orderId, productId: prodIds[i % prodIds.length], nameSnapshot: restoProducts[i % restoProducts.length].name,
          priceSnapshot: restoProducts[i % restoProducts.length].price, qty: 1 + Math.floor(Math.random() * 2),
          subtotal: restoProducts[i % restoProducts.length].price,
        });
      }

      for (let i = 1; i <= 8; i++) {
        await ctx.db.insert("diningTables", { tenantId, number: i, capacity: i <= 4 ? 4 : 6, area: i <= 5 ? "indoor" : "teras", status: "available", createdAt: now });
      }

      results.push("restoran");
    }

    // ════════════════════════════════════════════════════════════════════════
    // 3. RETAIL — Minimart Jaya
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "retail@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Minimart Jaya", subdomain: "minimartjaya", category: "toko_retail",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 11, currency: "IDR" },
        storefrontConfig: { primaryColor: "#0f172a", heroText: "Belanja Mudah di Minimart Jaya" },
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert("users", { name: "Owner Retail", email, tenantId, role: "Owner", isActive: true } as any);

      const catIds: string[] = [];
      for (const c of ["Fashion", "Elektronik", "Aksesoris"]) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase(), type: "product_category", createdAt: now }));
      }

      const retailProducts = [
        { name: "Kaos Polos Katun", sku: "RT-001", price: 89000, costPrice: 35000, cat: 0 },
        { name: "Celana Jeans Slim", sku: "RT-002", price: 199000, costPrice: 85000, cat: 0 },
        { name: "Headphone BT-500", sku: "RE-001", price: 299000, costPrice: 150000, cat: 1 },
        { name: "Powerbank 10000mAh", sku: "RE-002", price: 149000, costPrice: 75000, cat: 1 },
        { name: "Jam Tangan Digital", sku: "RA-001", price: 249000, costPrice: 120000, cat: 2 },
        { name: "Tas Selempang", sku: "RA-002", price: 129000, costPrice: 55000, cat: 2 },
      ];
      const prodIds: string[] = [];
      for (const p of retailProducts) {
        prodIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 50, minStock: 5, weightGram: 500, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      const custNames = ["Fajar", "Maya", "Rizky", "Putri", "Dimas"];
      const custIds: string[] = [];
      for (const c of custNames) {
        custIds.push(await ctx.db.insert("customers", { tenantId, name: c, phone: `0815${Math.floor(10000000 + Math.random() * 90000000)}`, type: "regular", loyaltyPoints: Math.floor(Math.random() * 200), piutangTotal: 0, createdAt: now }));
      }

      for (let i = 0; i < 8; i++) {
        const orderDate = now - i * day;
        const subtotal = 80000 + Math.floor(Math.random() * 300000);
        const tax = Math.round(subtotal * 0.11);
        const orderId = await ctx.db.insert("orders", {
          tenantId, orderNumber: `INV-${String(i + 1).padStart(3, "0")}`,
          customerId: custIds[i % custIds.length], status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
          grandTotal: subtotal + tax, paymentMethod: "qris", paymentStatus: "paid", createdBy: "system",
          createdAt: orderDate, updatedAt: orderDate,
        });
        await ctx.db.insert("orderItems", {
          orderId, productId: prodIds[i % prodIds.length], nameSnapshot: retailProducts[i % retailProducts.length].name,
          priceSnapshot: retailProducts[i % retailProducts.length].price, qty: 1,
          subtotal: retailProducts[i % retailProducts.length].price,
        });
      }

      // Supplier
      await ctx.db.insert("suppliers", { tenantId, name: "PT Fashionindo", contactName: "Budi", phone: "021-5551234", type: "product", isApproved: true, createdAt: now });
      await ctx.db.insert("suppliers", { tenantId, name: "PT Elektronik Jaya", contactName: "Sari", phone: "021-5555678", type: "product", isApproved: true, createdAt: now });

      results.push("retail");
    }

    // ════════════════════════════════════════════════════════════════════════
    // 4. BAKERY — Roti Enak
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "bakery@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Roti Enak", subdomain: "rotienak", category: "bakery",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 10, currency: "IDR" },
        storefrontConfig: { primaryColor: "#be185d", heroText: "Roti Fresh Setiap Hari" },
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert("users", { name: "Owner Bakery", email, tenantId, role: "Owner", isActive: true } as any);

      const catIds: string[] = [];
      for (const c of ["Roti", "Kue", "Pastry"]) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase(), type: "product_category", createdAt: now }));
      }

      const bakeryProducts = [
        { name: "Roti Tawar Gandum", sku: "BK-001", price: 22000, costPrice: 9000, cat: 0 },
        { name: "Croissant Butter", sku: "BK-002", price: 18000, costPrice: 6000, cat: 2 },
        { name: "Kue Lapis Legit", sku: "BK-003", price: 85000, costPrice: 35000, cat: 1 },
        { name: "Donat Coklat", sku: "BK-004", price: 8000, costPrice: 2500, cat: 0 },
        { name: "Brownies Keju", sku: "BK-005", price: 35000, costPrice: 12000, cat: 1 },
        { name: "Sosis Broodini", sku: "BK-006", price: 15000, costPrice: 5000, cat: 2 },
      ];
      const prodIds: string[] = [];
      for (const p of bakeryProducts) {
        prodIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 80, minStock: 10, weightGram: 200, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      const custNames = ["Yanti", "Rudi", "Sinta", "Agus", "Wati"];
      const custIds: string[] = [];
      for (const c of custNames) {
        custIds.push(await ctx.db.insert("customers", { tenantId, name: c, phone: `0816${Math.floor(10000000 + Math.random() * 90000000)}`, type: "regular", loyaltyPoints: Math.floor(Math.random() * 300), piutangTotal: 0, createdAt: now }));
      }

      for (let i = 0; i < 6; i++) {
        const orderDate = now - i * day;
        const subtotal = 15000 + Math.floor(Math.random() * 60000);
        const tax = Math.round(subtotal * 0.1);
        const orderId = await ctx.db.insert("orders", {
          tenantId, orderNumber: `ORD-${String(i + 1).padStart(3, "0")}`,
          customerId: custIds[i % custIds.length], status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
          grandTotal: subtotal + tax, paymentMethod: "tunai", paymentStatus: "paid", createdBy: "system",
          createdAt: orderDate, updatedAt: orderDate,
        });
        await ctx.db.insert("orderItems", {
          orderId, productId: prodIds[i % prodIds.length], nameSnapshot: bakeryProducts[i % bakeryProducts.length].name,
          priceSnapshot: bakeryProducts[i % bakeryProducts.length].price, qty: 2,
          subtotal: bakeryProducts[i % bakeryProducts.length].price * 2,
        });
      }

      results.push("bakery");
    }

    // ════════════════════════════════════════════════════════════════════════
    // 5. TOKO CAT — Jaya Cat
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "cat@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Jaya Cat", subdomain: "jayacat", category: "toko_cat",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 11, currency: "IDR" },
        storefrontConfig: { primaryColor: "#059669", heroText: "Warna Impian Anda" },
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert("users", { name: "Owner Toko Cat", email, tenantId, role: "Owner", isActive: true } as any);

      const catIds: string[] = [];
      for (const c of ["Cat Tembok", "Cat Kayu", "Thinner"]) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase().replace(/\s+/g, "-"), type: "product_category", createdAt: now }));
      }

      const catProducts = [
        { name: "Nippon Paint Vinilex 5000 1L", sku: "TC-001", price: 85000, costPrice: 55000, cat: 0 },
        { name: "Dulux Weathershield 1L", sku: "TC-002", price: 120000, costPrice: 78000, cat: 0 },
        { name: "Avian Cat Kayu 1L", sku: "TC-003", price: 65000, costPrice: 40000, cat: 1 },
        { name: "Thinner A Special", sku: "TC-004", price: 35000, costPrice: 22000, cat: 2 },
        { name: "Propan Decofloor 1L", sku: "TC-005", price: 95000, costPrice: 62000, cat: 1 },
      ];
      const prodIds: string[] = [];
      for (const p of catProducts) {
        prodIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 30, minStock: 5, weightGram: 1000, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      const custNames = ["Pak Bambang", "Ibu Sari", "Toko Bangunan Jaya", "Kontraktor ABC", "Rumah Sakit Sehat"];
      const custIds: string[] = [];
      for (const c of custNames) {
        custIds.push(await ctx.db.insert("customers", { tenantId, name: c, phone: `0817${Math.floor(10000000 + Math.random() * 90000000)}`, type: c.includes("Toko") || c.includes("Kontraktor") ? "contractor" : "regular", loyaltyPoints: 0, piutangTotal: 0, createdAt: now }));
      }

      for (let i = 0; i < 5; i++) {
        const orderDate = now - i * day;
        const subtotal = 50000 + Math.floor(Math.random() * 500000);
        const tax = Math.round(subtotal * 0.11);
        await ctx.db.insert("orders", {
          tenantId, orderNumber: `INV-${String(i + 1).padStart(3, "0")}`,
          customerId: custIds[i % custIds.length], status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
          grandTotal: subtotal + tax, paymentMethod: "tunai", paymentStatus: "paid", createdBy: "system",
          createdAt: orderDate, updatedAt: orderDate,
        });
      }

      // Tinting machines
      await ctx.db.insert("tintingMachines", { tenantId, name: "Nippon Mix Pro 1", status: "active", totalMixCount: 1250, dbWarnaVersion: "4316P", createdAt: now });
      await ctx.db.insert("tintingMachines", { tenantId, name: "Dulux Color Mixer", status: "active", totalMixCount: 800, dbWarnaVersion: "v3.2", createdAt: now });

      // Color formulas
      await ctx.db.insert("colorFormulas", { tenantId, colorCode: "NIP-4316P-01", colorName: "Ivory White", brand: "Nippon", baseType: "white", finish: "gloss", pigmentMix: { R12: 0.5, Y05: 0.3 }, createdAt: now });
      await ctx.db.insert("colorFormulas", { tenantId, colorCode: "DUL-S3020A", colorName: "Sage Green", brand: "Dulux", baseType: "white", finish: "matt", pigmentMix: { G08: 2.1, B03: 0.8 }, createdAt: now });

      results.push("toko_cat");
    }

    // ════════════════════════════════════════════════════════════════════════
    // 6. SPA — Luxury Spa Bali
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "spa@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Luxury Spa Bali", subdomain: "luxuryspa-bali", category: "spa",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 10, currency: "IDR" },
        storefrontConfig: { primaryColor: "#1e293b", heroText: "Relaksasi & Kesehatan" },
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert("users", { name: "Owner Spa", email, tenantId, role: "Owner", isActive: true } as any);

      const catIds: string[] = [];
      for (const c of ["Massage", "Facial", "Body Scrub"]) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase().replace(/\s+/g, "-"), type: "product_category", createdAt: now }));
      }

      const spaProducts = [
        { name: "Bali Massage 60m", sku: "SP-001", price: 250000, costPrice: 80000, cat: 0 },
        { name: "Deep Tissue 90m", sku: "SP-002", price: 350000, costPrice: 120000, cat: 0 },
        { name: "Facial Gold 60m", sku: "SP-003", price: 300000, costPrice: 100000, cat: 1 },
        { name: "Body Scrub Lulur 90m", sku: "SP-004", price: 280000, costPrice: 90000, cat: 2 },
        { name: "Aromatherapy 120m", sku: "SP-005", price: 450000, costPrice: 150000, cat: 0 },
      ];
      const prodIds: string[] = [];
      for (const p of spaProducts) {
        prodIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 999, minStock: 0, weightGram: 0, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      const custNames = ["Sarah", "Michael", "Lisa", "David", "Anna"];
      const custIds: string[] = [];
      for (const c of custNames) {
        custIds.push(await ctx.db.insert("customers", { tenantId, name: c, phone: `0818${Math.floor(10000000 + Math.random() * 90000000)}`, type: "regular", loyaltyPoints: Math.floor(Math.random() * 1000), piutangTotal: 0, createdAt: now }));
      }

      for (let i = 0; i < 8; i++) {
        const orderDate = now - i * day;
        const subtotal = 250000 + Math.floor(Math.random() * 200000);
        const tax = Math.round(subtotal * 0.1);
        await ctx.db.insert("orders", {
          tenantId, orderNumber: `ORD-${String(i + 1).padStart(3, "0")}`,
          customerId: custIds[i % custIds.length], status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
          grandTotal: subtotal + tax, paymentMethod: "kartu_kredit", paymentStatus: "paid", createdBy: "system",
          createdAt: orderDate, updatedAt: orderDate,
        });
      }

      // Rooms
      await ctx.db.insert("spaRooms", { tenantId, name: "Room Zen 1", type: "vip", capacity: 2, facilities: ["shower", "jacuzzi"], status: "available", createdAt: now });
      await ctx.db.insert("spaRooms", { tenantId, name: "Room Bamboo", type: "standard", capacity: 1, facilities: ["shower"], status: "available", createdAt: now });
      await ctx.db.insert("spaRooms", { tenantId, name: "Room Garden", type: "deluxe", capacity: 2, facilities: ["shower", "bath", "sauna"], status: "available", createdAt: now });

      // Therapists
      await ctx.db.insert("spaTherapists", { tenantId, name: "Wayan", gender: "male", specialization: ["balinese", "deep_tissue"], rating: 4.8, isAvailable: true, commissionRate: 0.2, createdAt: now });
      await ctx.db.insert("spaTherapists", { tenantId, name: "Made", gender: "male", specialization: ["thai", "aromatherapy"], rating: 4.6, isAvailable: true, commissionRate: 0.2, createdAt: now });
      await ctx.db.insert("spaTherapists", { tenantId, name: "Ketut", gender: "female", specialization: ["facial", "body_scrub"], rating: 4.9, isAvailable: true, commissionRate: 0.25, createdAt: now });

      results.push("spa");
    }

    // ════════════════════════════════════════════════════════════════════════
    // 7. BENGKEL — Bengkel Jaya
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "bengkel@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Bengkel Jaya", subdomain: "bengkeljaya", category: "bengkel",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 11, currency: "IDR" },
        storefrontConfig: { primaryColor: "#1e293b", heroText: "Servis Kendaraan Terpercaya" },
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert("users", { name: "Owner Bengkel", email, tenantId, role: "Owner", isActive: true } as any);

      const catIds: string[] = [];
      for (const c of ["Servis Ringan", "Servis Sedang", "Servis Berat"]) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase().replace(/\s+/g, "-"), type: "product_category", createdAt: now }));
      }

      const bengkelProducts = [
        { name: "Oli Mesin 5W-30 4L", sku: "BG-001", price: 180000, costPrice: 110000, cat: 0 },
        { name: "Filter Oli Toyota", sku: "BG-002", price: 45000, costPrice: 25000, cat: 0 },
        { name: "Kampas Rem Depan", sku: "BG-003", price: 120000, costPrice: 65000, cat: 1 },
        { name: "Busi NGK Iridium", sku: "BG-004", price: 75000, costPrice: 40000, cat: 0 },
        { name: "V-Belt Karet Mesin", sku: "BG-005", price: 95000, costPrice: 50000, cat: 2 },
      ];
      const prodIds: string[] = [];
      for (const p of bengkelProducts) {
        prodIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 40, minStock: 5, weightGram: 1000, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      const custNames = ["Pak Joko", "Bu Rina", "Pak Agung", "Pak Made", "Ibu Ayu"];
      const custIds: string[] = [];
      for (const c of custNames) {
        custIds.push(await ctx.db.insert("customers", { tenantId, name: c, phone: `0819${Math.floor(10000000 + Math.random() * 90000000)}`, type: "regular", loyaltyPoints: 0, piutangTotal: 0, vehicleHistory: [{ plateNumber: `DK${1000 + Math.floor(Math.random() * 9000)}XX`, brand: "Toyota", model: "Avanza" }], createdAt: now }));
      }

      // Vehicles
      const vehicles = [
        { plate: "DK1234AB", brand: "Toyota", model: "Avanza", year: 2020, engine: "1.5L" },
        { plate: "DK5678CD", brand: "Honda", model: "Civic", year: 2021, engine: "1.5T" },
        { plate: "DK9012EF", brand: "Suzuki", model: "Ertiga", year: 2019, engine: "1.4L" },
      ];
      const vehicleIds: string[] = [];
      for (const v of vehicles) {
        vehicleIds.push(await ctx.db.insert("vehicles", { tenantId, plateNumber: v.plate, brand: v.brand, model: v.model, year: v.year, engineType: v.engine, kmLast: 30000 + Math.floor(Math.random() * 50000), customerId: custIds[0], createdAt: now }));
      }

      // Work orders
      for (let i = 0; i < 5; i++) {
        const woDate = now - i * day;
        await ctx.db.insert("workOrders", {
          tenantId, woNumber: `WO-${String(i + 1).padStart(3, "0")}`, vehicleId: vehicleIds[i % vehicleIds.length],
          complaint: ["Ganti oli", "Servis rem", "Tune up", "Ganti filter", "Overhaul mesin"][i],
          type: ["ringan", "ringan", "sedang", "ringan", "berat"][i],
          status: ["finished", "in_progress", "queue", "approved", "draft"][i],
          estimatedCostPart: 50000 + Math.floor(Math.random() * 300000),
          estimatedCostJasa: 100000 + Math.floor(Math.random() * 200000),
          approvedByCustomer: true, createdBy: "system", createdAt: woDate, updatedAt: woDate,
        });
      }

      // Mechanics
      await ctx.db.insert("mechanics", { tenantId, name: "Pak Wayan", specialization: "mesin", rating: 4.7, isAvailable: true, createdAt: now });
      await ctx.db.insert("mechanics", { tenantId, name: "Pak Ketut", specialization: "kelistrikan", rating: 4.5, isAvailable: true, createdAt: now });

      results.push("bengkel");
    }

    // ════════════════════════════════════════════════════════════════════════
    // 8. SPAREPART — Sparepart Murah
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "sparepart@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Sparepart Murah", subdomain: "sparepart-murah", category: "toko_sparepart",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 11, currency: "IDR" },
        storefrontConfig: { primaryColor: "#0369a1", heroText: "Sparepart Lengkap & Murah" },
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert("users", { name: "Owner Sparepart", email, tenantId, role: "Owner", isActive: true } as any);

      const catIds: string[] = [];
      for (const c of ["Mesin", "Kelistrikan", "Rem"]) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase(), type: "product_category", createdAt: now }));
      }

      const spProducts = [
        { name: "Piston Kit Toyota Avanza", sku: "SP-001", price: 450000, costPrice: 280000, cat: 0 },
        { name: "Gasket Set Lengkap", sku: "SP-002", price: 180000, costPrice: 95000, cat: 0 },
        { name: "Alternator Suzuki Ertiga", sku: "SP-003", price: 850000, costPrice: 520000, cat: 1 },
        { name: "Kampas Rem Depan Honda Civic", sku: "SP-004", price: 220000, costPrice: 120000, cat: 2 },
        { name: "Busi NGK BP7ES", sku: "SP-005", price: 45000, costPrice: 22000, cat: 1 },
        { name: "V-Belt Toyota Avanza", sku: "SP-006", price: 85000, costPrice: 42000, cat: 0 },
      ];
      const prodIds: string[] = [];
      for (const p of spProducts) {
        prodIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 20, minStock: 3, weightGram: 500, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      // Part compatibility
      await ctx.db.insert("partCompatibility", { tenantId, productId: prodIds[0], brand: "Toyota", model: "Avanza", yearStart: 2018, yearEnd: 2023, engineType: "1.5L", createdAt: now });
      await ctx.db.insert("partCompatibility", { tenantId, productId: prodIds[2], brand: "Suzuki", model: "Ertiga", yearStart: 2019, yearEnd: 2024, engineType: "1.4L", createdAt: now });

      // Cross references
      await ctx.db.insert("partCrossReferences", { tenantId, productId: prodIds[4], oemNumber: "NGK BP7ES", aftermarketNumber: "Denso W22EP", brand: "NGK", type: "oem", createdAt: now });

      // Suppliers
      await ctx.db.insert("suppliers", { tenantId, name: "PT Astra Otoparts", contactName: "Hendra", phone: "021-87778888", type: "product", isApproved: true, createdAt: now });

      for (let i = 0; i < 5; i++) {
        const orderDate = now - i * day;
        const subtotal = 150000 + Math.floor(Math.random() * 700000);
        const tax = Math.round(subtotal * 0.11);
        await ctx.db.insert("orders", {
          tenantId, orderNumber: `INV-${String(i + 1).padStart(3, "0")}`,
          status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
          grandTotal: subtotal + tax, paymentMethod: "tunai", paymentStatus: "paid", createdBy: "system",
          createdAt: orderDate, updatedAt: orderDate,
        });
      }

      results.push("sparepart");
    }

    // ════════════════════════════════════════════════════════════════════════
    // 9. KAIN — Kain Batik Jaya
    // ════════════════════════════════════════════════════════════════════════
    {
      const email = "kain@tokobuilder.id";
      const tenantId = await ctx.db.insert("tenants", {
        name: "Kain Batik Jaya", subdomain: "kain-batik-jaya", category: "toko_kain",
        status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
        settings: { taxPercent: 11, currency: "IDR" },
        storefrontConfig: { primaryColor: "#92400e", heroText: "Kain Berkualitas & Eksklusif" },
        createdAt: now, updatedAt: now,
      });
      await ctx.db.insert("users", { name: "Owner Kain", email, tenantId, role: "Owner", isActive: true } as any);

      const catIds: string[] = [];
      for (const c of ["Katun", "Batik", "Denim"]) {
        catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase(), type: "product_category", createdAt: now }));
      }

      const kainProducts = [
        { name: "Kain Katun Jepang Premium", sku: "KN-001", price: 45000, costPrice: 28000, cat: 0 },
        { name: "Batik Tulis Solo", sku: "KN-002", price: 180000, costPrice: 95000, cat: 1 },
        { name: "Denim Japan Blue 14oz", sku: "KN-003", price: 120000, costPrice: 70000, cat: 2 },
        { name: "Kain Batik Cap Pekalongan", sku: "KN-004", price: 65000, costPrice: 35000, cat: 1 },
        { name: "Katun Toyobo 1.5m", sku: "KN-005", price: 32000, costPrice: 18000, cat: 0 },
      ];
      const prodIds: string[] = [];
      for (const p of kainProducts) {
        prodIds.push(await ctx.db.insert("products", {
          tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku, price: p.price, costPrice: p.costPrice,
          stockQuantity: 100, minStock: 10, weightGram: 300, isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
        }));
      }

      // Fabric rolls
      const rolls = [
        { productIdx: 0, rollNumber: "RL-001", totalMeter: 50, remainingMeter: 35.5, widthCm: 150 },
        { productIdx: 0, rollNumber: "RL-002", totalMeter: 45, remainingMeter: 45, widthCm: 150 },
        { productIdx: 1, rollNumber: "RL-003", totalMeter: 30, remainingMeter: 12.3, widthCm: 115 },
        { productIdx: 2, rollNumber: "RL-004", totalMeter: 40, remainingMeter: 28.7, widthCm: 150 },
        { productIdx: 4, rollNumber: "RL-005", totalMeter: 60, remainingMeter: 52.1, widthCm: 115 },
      ];
      for (const r of rolls) {
        await ctx.db.insert("fabricRolls", { tenantId, productId: prodIds[r.productIdx], rollNumber: r.rollNumber, totalMeter: r.totalMeter, remainingMeter: r.remainingMeter, widthCm: r.widthCm, createdAt: now });
      }

      // Konveksi B2B orders
      const konveksiCustIds: string[] = [];
      for (const c of ["Konveksi Jaya Abadi", "PT Tekstil Nusantara", "Garmen Sejahtera"]) {
        konveksiCustIds.push(await ctx.db.insert("customers", { tenantId, name: c, phone: `0821${Math.floor(10000000 + Math.random() * 90000000)}`, type: "konveksi", loyaltyPoints: 0, piutangTotal: 500000 + Math.floor(Math.random() * 2000000), createdAt: now }));
      }

      for (let i = 0; i < 3; i++) {
        await ctx.db.insert("konveksiOrders", {
          tenantId, customerId: konveksiCustIds[i], orderNumber: `KO-${String(i + 1).padStart(3, "0")}`,
          totalRoll: 10 + Math.floor(Math.random() * 20), totalMeter: 250 + Math.floor(Math.random() * 500),
          hargaGrosirPerRoll: 35000 + Math.floor(Math.random() * 30000),
          paymentType: i === 0 ? "piutang" : "tunai", status: "completed",
          piutangStatus: i === 0 ? "unpaid" : undefined, createdAt: now,
        });
      }

      // Piutang
      await ctx.db.insert("piutangKonveksi", {
        tenantId, konveksiOrderId: (await ctx.db.query("konveksiOrders").withIndex("by_tenant", (q) => q.eq("tenantId", tenantId)).first())?._id ?? "" as any,
        customerId: konveksiCustIds[0], amount: 1500000, dueDate: now + 30 * day, status: "unpaid",
        reminderH7Sent: false, reminderH3Sent: false, freezeNextOrder: false, createdAt: now,
      });

      // Supplier
      await ctx.db.insert("suppliers", { tenantId, name: "PT TexNet Indonesia", contactName: "Surya", phone: "021-33334444", type: "product", isApproved: true, createdAt: now });

      for (let i = 0; i < 5; i++) {
        const orderDate = now - i * day;
        const subtotal = 200000 + Math.floor(Math.random() * 800000);
        const tax = Math.round(subtotal * 0.11);
        await ctx.db.insert("orders", {
          tenantId, orderNumber: `INV-${String(i + 1).padStart(3, "0")}`,
          status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
          grandTotal: subtotal + tax, paymentMethod: "transfer", paymentStatus: "paid", createdBy: "system",
          createdAt: orderDate, updatedAt: orderDate,
        });
      }

      results.push("toko_kain");
    }

    // 10. TOKO PAKAIAN — Fashion Jaya (lihat helper seedFashionTenant di bawah)
    await seedFashionTenant(ctx, now, planId, day);
    results.push("toko_pakaian");

    return `seeded ${results.length} demo tenants: ${results.join(", ")}`;
  },
});

// ── Helper: tenant demo fashion (dipakai seedAll + seedFashionDemoTenant) ────
async function seedFashionTenant(ctx: any, now: number, planId: string, day: number) {
  const email = "pakaian@tokobuilder.id";
  const existing = await ctx.db.query("tenants").withIndex("by_subdomain", (q: any) => q.eq("subdomain", "fashionjaya")).first();
  if (existing) return;

  const tenantId = await ctx.db.insert("tenants", {
    name: "Fashion Jaya", subdomain: "fashionjaya", category: "toko_pakaian",
    status: "trialing", trialEndsAt: now + 14 * day, subscriptionPlanId: planId,
    settings: { taxPercent: 11, currency: "IDR", receiptFooter: "Terima kasih! Jangan lupa review produknya ya 😊" },
    storefrontConfig: { primaryColor: "#18181b", heroText: "Fashion Jaya — Gaya Terbaik Setiap Hari" },
    createdAt: now, updatedAt: now,
  });
  await ctx.db.insert("users", { name: "Owner Fashion", email, tenantId, role: "Owner", isActive: true, isPlatformAdmin: false } as any);

  const catNames = ["Atasan", "Bawahan", "Outerwear", "Dress"];
  const catIds: string[] = [];
  for (const c of catNames) {
    catIds.push(await ctx.db.insert("categories", { tenantId, name: c, slug: c.toLowerCase(), type: "product_category", createdAt: now }));
  }

  // ── Produk + SKU Matrix (Size × Warna) ──
  const products = [
    { name: "Kemeja Oxford Polos", sku: "KM-01", price: 149000, costPrice: 65000, cat: 0, colors: ["Putih", "Hitam", "Biru"], sizes: ["S", "M", "L", "XL"] },
    { name: "Kaos Premium Cotton Combed 30s", sku: "KS-02", price: 89000, costPrice: 38000, cat: 0, colors: ["Putih", "Hitam", "Abu"], sizes: ["S", "M", "L", "XL"] },
    { name: "Celana Chino Slim Fit", sku: "CL-03", price: 179000, costPrice: 85000, cat: 1, colors: ["Hitam", "Krem", "Navy"], sizes: ["28", "30", "32", "34"] },
    { name: "Denim Jacket Vintage", sku: "JK-04", price: 259000, costPrice: 120000, cat: 2, colors: ["Biru"], sizes: ["S", "M", "L", "XL"] },
    { name: "Dress Midi Elegan", sku: "DR-05", price: 239000, costPrice: 110000, cat: 3, colors: ["Hitam", "Burgundy"], sizes: ["S", "M", "L"] },
  ];
  const prodIds: string[] = [];
  for (const p of products) {
    const pid = await ctx.db.insert("products", {
      tenantId, name: p.name, slug: p.name.toLowerCase().replace(/\s+/g, "-"), sku: p.sku,
      price: p.price, costPrice: p.costPrice, stockQuantity: 0, minStock: 6, weightGram: 300,
      isActive: true, categoryId: catIds[p.cat], updatedAt: now, createdAt: now,
    });
    prodIds.push(pid);
    // Varian per ukuran × warna
    let totalStock = 0;
    for (const color of p.colors) {
      for (const size of p.sizes) {
        const stock = 2 + Math.floor(Math.random() * 14);
        totalStock += stock;
        const colorCode = { Putih: "WHT", Hitam: "BLK", Biru: "BLU", Abu: "GRY", Krem: "CRM", Navy: "NVY", Burgundy: "BRG" }[color] ?? color.slice(0, 3).toUpperCase();
        await ctx.db.insert("productVariants", {
          productId: pid, tenantId, name: `${size} / ${color}`,
          sku: `${p.sku}-${colorCode}-${size}`, price: p.price, stockQuantity: stock,
          attributes: { size, color, costPrice: p.costPrice },
          createdAt: now,
        });
      }
    }
    await ctx.db.patch(pid as any, { stockQuantity: totalStock });
  }

  // ── Supplier ──
  await ctx.db.insert("suppliers", { tenantId, name: "PT Garment Nusantara", contactName: "Budi", phone: "021-55551122", type: "product", isApproved: true, createdAt: now });

  // ── Pelanggan ──
  const custIds: string[] = [];
  for (const c of ["Salsabila Putri", "Dimas Anggara", "Rania Kirana"]) {
    custIds.push(await ctx.db.insert("customers", {
      tenantId, name: c, phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      type: "retail", loyaltyPoints: 120 + Math.floor(Math.random() * 500),
      favoriteSize: Math.random() > 0.5 ? "M" : "L", createdAt: now,
    }));
  }

  // ── Pesanan sample ──
  for (let i = 0; i < 6; i++) {
    const orderDate = now - i * day;
    const subtotal = 149000 + Math.floor(Math.random() * 900000);
    const tax = Math.round(subtotal * 0.11);
    await ctx.db.insert("orders", {
      tenantId, orderNumber: `INV-${String(i + 1).padStart(3, "0")}`,
      status: "completed", subtotal, discountTotal: 0, taxTotal: tax,
      grandTotal: subtotal + tax, paymentMethod: "qris", paymentStatus: "paid", createdBy: "system",
      createdAt: orderDate, updatedAt: orderDate,
    });
  }

  // ── Size Exchange (1 selesai, 1 menunggu) ──
  await ctx.db.insert("sizeExchanges", {
    tenantId, customerId: custIds[0], productId: prodIds[0], productName: "Kemeja Oxford Polos",
    oldSize: "M", newSize: "L", color: "Putih", reason: "Kebesaran di bagian bahu",
    status: "completed", tagsAttached: true, conditionOk: true, createdAt: now - 2 * day, updatedAt: now - day,
  });
  await ctx.db.insert("sizeExchanges", {
    tenantId, customerId: custIds[1], productId: prodIds[2], productName: "Celana Chino Slim Fit",
    oldSize: "30", newSize: "32", color: "Hitam", reason: "Kekecilan di pinggang",
    status: "requested", createdAt: now, updatedAt: now,
  });

  // ── Retur sample (cacat produksi → bin reject) ──
  await ctx.db.insert("retailReturns", {
    tenantId, customerId: custIds[2], productId: prodIds[0], productName: "Kemeja Oxford Polos",
    returnType: "cacat_produksi", reason: "Jahitan lengan kiri copot setelah dicoba", condition: "defective",
    status: "approved", rejectBin: true, refundMethod: "ganti_produk", createdAt: now - day, updatedAt: now - day,
  });

  // ── Keamanan & fasilitas ──
  await ctx.db.insert("securityLogs", {
    tenantId, type: "suspicious", description: "2 orang mencurigakan mondar-mandir di area fitting room — diingatkan oleh SA",
    actionTaken: "Customer service aktif + CCTV dicatat", createdAt: now - 3 * day,
  });
  await ctx.db.insert("maintenanceTickets", {
    tenantId, item: "Cermin fitting room", issue: "Cermin retak di pojok kanan", priority: "high",
    status: "open", createdAt: now - day, updatedAt: now - day,
  });

  // ── Checklist SOP (template standar) ──
  const checklists: [string, string][] = [
    ["opening", "Absen & briefing pagi (target, promo, new arrival)"],
    ["opening", "Cek kebersihan lantai, rak, display, fitting room & kasir"],
    ["opening", "Setting mannequin dengan outfit terbaru (rapi & disetrika)"],
    ["opening", "Atur display rak: produk baru di depan, harga jelas"],
    ["opening", "Cek perangkat POS, EDC, jaringan & CCTV"],
    ["opening", "Cek stok fast moving (Size M & L, warna netral)"],
    ["closing", "Rapikan display & rak (kembalikan baju, urutkan size)"],
    ["closing", "Cek fitting room (bersihkan, gantung baju tertinggal)"],
    ["closing", "Matikan AC, lampu display, POS, EDC; kunci toko & aktifkan alarm"],
    ["daily_vm", "Rotasi display mingguan & signage promo terpasang"],
  ];
  for (const [type, title] of checklists) {
    await ctx.db.insert("storeChecklists", { tenantId, type, title, isChecked: type === "opening" && title.startsWith("Absen") ? true : false, createdAt: now, updatedAt: now });
  }
}

/** Seed hanya tenant demo Toko Pakaian (idempotent — aman dijalankan kapan pun). */
export const seedFashionDemoTenant = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tenants").withIndex("by_subdomain", (q: any) => q.eq("subdomain", "fashionjaya")).first();
    if (existing) return `sudah ada — login ${existing.name} (pakaian@tokobuilder.id)`;
    const now = Date.now();
    const day = 86400000;
    let plan = await ctx.db.query("subscriptionPlans").withIndex("by_slug", (q) => q.eq("slug", "free")).first();
    if (!plan) {
      const planId = await ctx.db.insert("subscriptionPlans", {
        name: "Free Trial", slug: "free", priceMonthly: 0, priceYearly: 0,
        trialDaysDefault: 14, maxProducts: 20, maxStaff: 1, maxTransactionsMonth: 50, isActive: true, createdAt: now,
      });
      plan = (await ctx.db.get(planId))!;
    }
    await seedFashionTenant(ctx, now, plan._id, day);
    return "seeded toko_pakaian — Fashion Jaya (pakaian@tokobuilder.id)";
  },
});
