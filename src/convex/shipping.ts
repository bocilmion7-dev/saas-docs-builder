"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const RAJAONGKIR_BASE = "https://api.rajaongkir.com/starter";

/**
 * Search cities by name via RajaOngkir API.
 * API key is passed from platformSettings via frontend.
 */
export const searchCities = action({
  args: {
    query: v.string(),
    apiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const key = args.apiKey ?? "";

    // Fallback: return common Indonesian cities if no API key
    if (!key) {
      return [
        { cityId: "151", cityName: "Jakarta Selatan", province: "DKI Jakarta", type: "Kota", postalCode: "12000" },
        { cityId: "152", cityName: "Jakarta Pusat", province: "DKI Jakarta", type: "Kota", postalCode: "10000" },
        { cityId: "153", cityName: "Jakarta Barat", province: "DKI Jakarta", type: "Kota", postalCode: "11000" },
        { cityId: "154", cityName: "Jakarta Utara", province: "DKI Jakarta", type: "Kota", postalCode: "14000" },
        { cityId: "155", cityName: "Jakarta Timur", province: "DKI Jakarta", type: "Kota", postalCode: "13000" },
        { cityId: "22", cityName: "Bandung", province: "Jawa Barat", type: "Kota", postalCode: "40000" },
        { cityId: "44", cityName: "Surabaya", province: "Jawa Timur", type: "Kota", postalCode: "60000" },
        { cityId: "39", cityName: "Semarang", province: "Jawa Tengah", type: "Kota", postalCode: "50000" },
        { cityId: "50", cityName: "Yogyakarta", province: "DI Yogyakarta", type: "Kota", postalCode: "55000" },
        { cityId: "118", cityName: "Malang", province: "Jawa Timur", type: "Kota", postalCode: "65000" },
        { cityId: "59", cityName: "Medan", province: "Sumatera Utara", type: "Kota", postalCode: "20000" },
        { cityId: "23", cityName: "Bekasi", province: "Jawa Barat", type: "Kota", postalCode: "17000" },
        { cityId: "76", cityName: "Tangerang", province: "Banten", type: "Kota", postalCode: "15000" },
        { cityId: "21", cityName: "Bogor", province: "Jawa Barat", type: "Kota", postalCode: "16000" },
        { cityId: "116", cityName: "Makassar", province: "Sulawesi Selatan", type: "Kota", postalCode: "90000" },
      ].filter((c) => c.cityName.toLowerCase().includes(args.query.toLowerCase()));
    }

    try {
      const res = await fetch(`${RAJAONGKIR_BASE}/city?key=${key}`);
      const data = await res.json();
      const cities = data?.rajaongkir?.results ?? [];
      return cities
        .filter((c: any) => c.city_name.toLowerCase().includes(args.query.toLowerCase()))
        .slice(0, 10)
        .map((c: any) => ({
          cityId: c.city_id,
          cityName: c.city_name,
          province: c.province,
          type: c.type,
          postalCode: c.postal_code,
        }));
    } catch {
      return [];
    }
  },
});

/**
 * Calculate shipping cost via RajaOngkir API.
 * Supports JNE, J&T, SiCepat.
 * origin is the tenant's cityId, destination is customer's cityId.
 */
export const calculateCost = action({
  args: {
    origin: v.string(),
    destination: v.string(),
    weight: v.number(), // grams
    courier: v.string(), // jne, jnt, sicepat
    apiKey: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const key = args.apiKey ?? "";

    if (!key) {
      // Fallback: simulated costs
      const baseCosts: Record<string, Record<string, number>> = {
        jne: { regular: 8000, yes: 15000, oke: 6000 },
        jnt: { regular: 9000, express: 18000 },
        sicepat: { reg: 7000, instan: 20000, halu: 10000 },
      };
      const courierCosts = baseCosts[args.courier] ?? baseCosts.jne;
      return Object.entries(courierCosts).map(([service, base]) => ({
        courier: args.courier.toUpperCase(),
        service,
        cost: base + Math.ceil(args.weight / 1000) * 2000,
        etd: "2-3 Hari",
      }));
    }

    try {
      const res = await fetch(`${RAJAONGKIR_BASE}/cost`, {
        method: "POST",
        headers: {
          "key": key,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          origin: args.origin,
          destination: args.destination,
          weight: String(args.weight),
          courier: args.courier,
        }),
      });
      const data = await res.json();
      const results = data?.rajaongkir?.results?.[0]?.costs ?? [];
      return results.map((c: any) => ({
        courier: args.courier.toUpperCase(),
        service: c.service,
        cost: c.cost?.[0]?.value ?? 0,
        etd: c.cost?.[0]?.etd ?? "-",
      }));
    } catch {
      return [];
    }
  },
});
