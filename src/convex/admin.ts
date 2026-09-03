import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Platform Super Admin default credentials.
 * Login dilakukan di halaman tersembunyi /platform-login (email + password,
 * tanpa OTP). Ganti password dengan mengubah konstanta ini, atau perketat
 * dengan memindahkannya ke platformSettings.
 */
export const ADMIN_EMAIL = "admin@tokobuilder.id";
export const ADMIN_PASSWORD = "TokoBuilder@2026";

/** Cek apakah email/password cocok dengan kredensial admin default. */
export const checkCredentials = query({
  args: { email: v.string(), password: v.string() },
  handler: async (_ctx, args) => {
    return (
      args.email.trim().toLowerCase() === ADMIN_EMAIL &&
      args.password === ADMIN_PASSWORD
    );
  },
});

/**
 * Jadikan user yang sedang login sebagai Platform Admin.
 * Hanya berhasil jika email+password yang dikirim cocok dengan kredensial
 * default admin — dipanggil setelah sign-in password berhasil di halaman
 * /platform-login.
 */
export const claimAdmin = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const valid =
      args.email.trim().toLowerCase() === ADMIN_EMAIL &&
      args.password === ADMIN_PASSWORD;
    if (!valid) throw new Error("Kredensial tidak valid");

    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Belum login");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User tidak ditemukan");

    await ctx.db.patch(user._id, {
      isPlatformAdmin: true,
      role: "Platform Admin",
      isActive: true,
    });
    return true;
  },
});

/** Siapa saja yang berstatus platform admin (dipakai untuk gate halaman /platform). */
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.isPlatformAdmin)
      .map((u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role }));
  },
});
