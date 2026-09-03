"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a Midtrans Snap transaction.
 * Returns { token, redirect_url } for frontend to open Snap popup.
 */
export const createSnapTransaction = action({
  args: {
    orderId: v.string(),
    amount: v.number(),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    items: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    serverKey: v.string(),
    isProduction: v.boolean(),
  },
  handler: async (_ctx, args) => {
    const baseUrl = args.isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";

    const auth = Buffer.from(args.serverKey + ":").toString("base64");

    const body = {
      transaction_details: {
        order_id: args.orderId,
        gross_amount: args.amount,
      },
      customer_details: {
        first_name: args.customerName,
        email: args.customerEmail ?? undefined,
        phone: args.customerPhone ?? undefined,
      },
      item_details: args.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    const res = await fetch(`${baseUrl}/v1/payment-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.status_code === "201" || data.status_code === "200") {
      return {
        success: true,
        redirectUrl: data.redirect_url as string,
        paymentUrl: data.payment_url as string,
      };
    }

    return {
      success: false,
      error: data.status_message ?? "Midtrans error",
    };
  },
});

/**
 * Verify Midtrans transaction status.
 */
export const verifyTransaction = action({
  args: {
    orderId: v.string(),
    serverKey: v.string(),
    isProduction: v.boolean(),
  },
  handler: async (_ctx, args) => {
    const baseUrl = args.isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";

    const auth = Buffer.from(args.serverKey + ":").toString("base64");

    const res = await fetch(`${baseUrl}/v2/${args.orderId}/status`, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json",
      },
    });

    const data = await res.json();

    return {
      orderId: data.order_id,
      transactionStatus: data.transaction_status,
      paymentType: data.payment_type,
      grossAmount: data.gross_amount,
      fraudStatus: data.fraud_status,
    };
  },
});
