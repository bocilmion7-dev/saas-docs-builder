import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Webhook Midtrans Payment Notification (payment-links / Snap).
 * Dokumen: https://docs.midtrans.com/reference/overview-webhooks
 *
 * Midtrans mengirim POST JSON berisi:
 *   order_id, status_code, gross_amount, transaction_status, fraud_status, signature_key, ...
 *
 * Signature: sha512(order_id + status_code + gross_amount + ServerKey)
 * Transaksi sukses: transaction_status = capture | settlement (fraud accept utk kartu kredit).
 */
http.route({
  path: "/midtrans-notification",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ status: "error", message: "invalid json" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const orderId: string = String(body.order_id ?? "");
    const statusCode: string = String(body.status_code ?? "");
    const grossAmount: string = String(body.gross_amount ?? "");
    const signatureKey: string = String(body.signature_key ?? "");
    const transactionStatus: string = String(body.transaction_status ?? "");
    const fraudStatus: string = String(body.fraud_status ?? "");

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
      return new Response(JSON.stringify({ status: "error", message: "missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Setting platform (server key + mode) untuk verifikasi & konteks
    const settings = await ctx.runQuery(internal.platformSettings.getSettingsHttp);
    const serverKey: string = String(settings?.midtrans_server_key ?? "");

    // Verifikasi signature SHA-512
    const plain = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const data = new TextEncoder().encode(plain);
    const digest = await crypto.subtle.digest("SHA-512", data);
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const signatureValid = hex === signatureKey.toLowerCase();

    if (!serverKey || !signatureValid) {
      return new Response(JSON.stringify({ status: "error", message: "invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transaksi dianggap sukses (fraud accept / bukan kartu kredit)
    const fraudOk = fraudStatus === "" || fraudStatus === "accept";
    const success =
      (transactionStatus === "capture" || transactionStatus === "settlement") && fraudOk;
    const pending = transactionStatus === "pending" || transactionStatus === "authorize";
    const failed =
      transactionStatus === "cancel" || transactionStatus === "deny" ||
      transactionStatus === "expire" || transactionStatus === "failure" ||
      fraudStatus === "deny" || fraudStatus === "challenge";

    // Cari order storefront dengan order_number = order_id Midtrans
    const order = await ctx.runQuery(internal.orders.getByOrderNumber, { orderNumber: orderId });

    if (order && success) {
      await ctx.runMutation(internal.orders.settlePaid, { orderId: order._id as any });
      return new Response(JSON.stringify({ status: "ok", orderId, settled: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (order && failed) {
      await ctx.runMutation(internal.orders.markPaymentFailed, { orderId: order._id as any });
      return new Response(JSON.stringify({ status: "ok", orderId, settled: false, action: "cancelled" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Order tidak dikenal / status menunggu — selalu balas 200 supaya Midtrans tidak retry terus
    return new Response(JSON.stringify({ status: "ok", orderId, action: pending ? "waiting" : "ignored" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
