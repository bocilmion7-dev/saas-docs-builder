/**
 * SDOT V7 — Per-Category Sidebar Menu Configuration
 *
 * Each tenant has ONE category. The dashboard sidebar ONLY shows
 * menus relevant to that tenant's category. NOT all 9 categories at once.
 *
 * Source: SDOT V7 Part 1 Section 3.2 "Dashboard Menu WAJIB"
 */

import {
  LayoutDashboard, Package, ShoppingCart, Receipt, Users, BarChart3, Settings,
  LogOut, Store, Boxes, Tags, Wallet, Trash2, ArrowDownCircle, FileText,
  ClipboardCheck, Grid3X3, ChefHat, CalendarDays, Paintbrush, Calculator,
  Wrench, Car, Link2, Scissors, Heart, Cake, Ticket, AlertTriangle,
  Beaker, HardHat, Bed, Shield, FlaskConical, Printer, Crown, Truck, Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SidebarMenuItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

// ── Universal menus (all categories get these) ──────────────────────────────

const universalMenus: SidebarMenuItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/products", icon: Package, label: "Produk" },
  { to: "/dashboard/orders", icon: ShoppingCart, label: "Pesanan" },
  { to: "/dashboard/pos", icon: Receipt, label: "POS / Kasir" },
  { to: "/dashboard/customers", icon: Users, label: "Pelanggan" },
];

const universalEndMenus: SidebarMenuItem[] = [
  { to: "/dashboard/staff", icon: Shield, label: "Staff & Roles" },
  { to: "/dashboard/vouchers-loyalty", icon: Ticket, label: "Voucher & Loyalty" },
  { to: "/dashboard/reports", icon: BarChart3, label: "Laporan" },
  { to: "/dashboard/subscription", icon: Crown, label: "Subscription" },
  { to: "/dashboard/hardware", icon: Printer, label: "Hardware (Print/Scan)" },
  { to: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
];

// ── Category-specific menus ─────────────────────────────────────────────────

const cafeMenus: SidebarMenuItem[] = [
  { to: "/dashboard/table-management", icon: Grid3X3, label: "Table Management" },
  { to: "/dashboard/kds", icon: ChefHat, label: "Kitchen Display" },
  { to: "/dashboard/reservations", icon: CalendarDays, label: "Reservasi" },
  { to: "/dashboard/waiting-list", icon: Users, label: "Waiting List" },
  { to: "/dashboard/modifiers", icon: Settings, label: "Modifier Manager" },
  { to: "/dashboard/bom-recipe", icon: FlaskConical, label: "BOM / Recipe" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Inventory Bahan" },
  { to: "/dashboard/waste", icon: Trash2, label: "Waste" },
  { to: "/dashboard/opening-closing", icon: ClipboardCheck, label: "Opening / Closing" },
  { to: "/dashboard/pos-shifts", icon: Wallet, label: "Shift POS" },
  { to: "/dashboard/stock-movements", icon: ArrowDownCircle, label: "Riwayat Stok" },
];

const restoranMenus: SidebarMenuItem[] = [
  { to: "/dashboard/table-management", icon: Grid3X3, label: "Table Management" },
  { to: "/dashboard/kds", icon: ChefHat, label: "KDS 4 Stasiun" },
  { to: "/dashboard/reservations", icon: CalendarDays, label: "Reservasi" },
  { to: "/dashboard/waiting-list", icon: Users, label: "Waiting List" },
  { to: "/dashboard/modifiers", icon: Settings, label: "Modifier Pedas/Doneness" },
  { to: "/dashboard/bom-recipe", icon: FlaskConical, label: "BOM / Recipe" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Inventory Bahan" },
  { to: "/dashboard/waste", icon: Trash2, label: "Waste" },
  { to: "/dashboard/opening-closing", icon: ClipboardCheck, label: "Opening / Closing" },
  { to: "/dashboard/pos-shifts", icon: Wallet, label: "Shift POS" },
  { to: "/dashboard/stock-movements", icon: ArrowDownCircle, label: "Riwayat Stok" },
];

const retailMenus: SidebarMenuItem[] = [
  { to: "/dashboard/inventory", icon: Boxes, label: "Inventory Gudang" },
  { to: "/dashboard/stock-movements", icon: ArrowDownCircle, label: "Stock Adjustment" },
  { to: "/dashboard/purchase-orders", icon: FileText, label: "Procurement PR/PO" },
  { to: "/dashboard/suppliers", icon: Package, label: "Supplier" },
  { to: "/dashboard/brands", icon: Tags, label: "Brands" },
  { to: "/dashboard/units", icon: Calculator, label: "Units" },
  { to: "/dashboard/expenses", icon: Wallet, label: "Expense / Petty Cash" },
  { to: "/dashboard/opening-closing", icon: ClipboardCheck, label: "Opening / Closing" },
  { to: "/dashboard/pos-shifts", icon: Wallet, label: "Shift POS" },
  { to: "/dashboard/waste", icon: Trash2, label: "Waste" },
];

const tokoCatMenus: SidebarMenuItem[] = [
  { to: "/dashboard/volume-calculator", icon: Calculator, label: "Volume Calculator" },
  { to: "/dashboard/tinting", icon: Paintbrush, label: "Tinting & Mixing" },
  { to: "/dashboard/color-samples", icon: Paintbrush, label: "Color Samples" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Stok Base & Pigment" },
  { to: "/dashboard/contractor-projects", icon: HardHat, label: "Proyek Kontraktor" },
  { to: "/dashboard/delivery-orders", icon: Truck, label: "Delivery Orders (DO)" },
  { to: "/dashboard/complaint-tickets", icon: AlertTriangle, label: "Complaint Ticket" },
  { to: "/dashboard/hse-checklist", icon: Shield, label: "HSE Checklist" },
  { to: "/dashboard/waste", icon: Trash2, label: "Waste B3 Drum" },
  { to: "/dashboard/stock-movements", icon: ArrowDownCircle, label: "Riwayat Stok" },
  { to: "/dashboard/opening-closing", icon: ClipboardCheck, label: "Opening / Closing 15 Poin" },
];

const spaMenus: SidebarMenuItem[] = [
  { to: "/dashboard/spa-bookings", icon: CalendarDays, label: "Booking Calendar" },
  { to: "/dashboard/therapists", icon: Users, label: "Therapist Management" },
  { to: "/dashboard/rooms", icon: Bed, label: "Room Management" },
  { to: "/dashboard/health-forms", icon: Heart, label: "Health Forms" },
  { to: "/dashboard/treatment-logs", icon: FlaskConical, label: "Treatment Logs" },
  { to: "/dashboard/customers", icon: Users, label: "Pelanggan & Membership" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Retail Products" },
];

const bakeryMenus: SidebarMenuItem[] = [
  { to: "/dashboard/production-plan", icon: Cake, label: "Production Plan & Batch" },
  { to: "/dashboard/bom-recipe", icon: FlaskConical, label: "Recipe BOM" },
  { to: "/dashboard/qc-log", icon: Shield, label: "QC Log (6 Param)" },
  { to: "/dashboard/display-counter", icon: Boxes, label: "Display Counter Chiller" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Inventory Bahan Baku" },
  { to: "/dashboard/custom-cake", icon: Cake, label: "Custom Cake Orders" },
  { to: "/dashboard/waste", icon: Trash2, label: "Waste Log / Day-Old" },
  { to: "/dashboard/pos-shifts", icon: Wallet, label: "Shift POS" },
  { to: "/dashboard/stock-movements", icon: ArrowDownCircle, label: "Riwayat Stok" },
  { to: "/dashboard/purchase-orders", icon: FileText, label: "Procurement" },
];

const bengkelMenus: SidebarMenuItem[] = [
  { to: "/dashboard/vehicle-db", icon: Car, label: "Vehicle Database" },
  { to: "/dashboard/work-orders", icon: Wrench, label: "Work Order" },
  { to: "/dashboard/job-cards", icon: ClipboardCheck, label: "Job Cards" },
  { to: "/dashboard/qc-test-drive", icon: Car, label: "QC Test Drive 1-5KM" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Sparepart Issue" },
  { to: "/dashboard/service-reminders", icon: CalendarDays, label: "Service Reminder" },
  { to: "/dashboard/opening-closing", icon: ClipboardCheck, label: "Tools Maintenance" },
  { to: "/dashboard/stock-movements", icon: ArrowDownCircle, label: "Riwayat Stok" },
  { to: "/dashboard/purchase-orders", icon: FileText, label: "Procurement" },
];

const sparepartMenus: SidebarMenuItem[] = [
  { to: "/dashboard/vin-lookup", icon: Link2, label: "Part Compatibility" },
  { to: "/dashboard/cross-reference", icon: Link2, label: "Cross Reference OEM" },
  { to: "/dashboard/warranty", icon: Shield, label: "Warranty & Claims" },
  { to: "/dashboard/customer-returns", icon: AlertTriangle, label: "Customer Returns" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Inventory Part" },
  { to: "/dashboard/stock-movements", icon: ArrowDownCircle, label: "Bin Location A1-02" },
  { to: "/dashboard/pre-order", icon: FileText, label: "Pre-Order Part" },
  { to: "/dashboard/suppliers", icon: Package, label: "Supplier" },
];

const kainMenus: SidebarMenuItem[] = [
  { to: "/dashboard/fabric-rolls", icon: Scissors, label: "Fabric Roll Mgmt" },
  { to: "/dashboard/fabric-cutting", icon: Scissors, label: "Fabric Cutting" },
  { to: "/dashboard/fabric-remnants", icon: Tag, label: "Remnants (<0.5m)" },
  { to: "/dashboard/fabric-quality-check", icon: Shield, label: "Quality Check" },
  { to: "/dashboard/obras", icon: Scissors, label: "Obras Service" },
  { to: "/dashboard/konveksi-b2b", icon: FileText, label: "Konveksi B2B" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Inventory Kain" },
  { to: "/dashboard/suppliers", icon: Package, label: "Supplier" },
];

// ── Master map ──────────────────────────────────────────────────────────────

export const CATEGORY_MENUS: Record<string, SidebarMenuItem[]> = {
  cafe: [...universalMenus, ...cafeMenus, ...universalEndMenus],
  restoran: [...universalMenus, ...restoranMenus, ...universalEndMenus],
  toko_retail: [...universalMenus, ...retailMenus, ...universalEndMenus],
  toko_cat: [...universalMenus, ...tokoCatMenus, ...universalEndMenus],
  spa: [...universalMenus, ...spaMenus, ...universalEndMenus],
  bakery: [...universalMenus, ...bakeryMenus, ...universalEndMenus],
  bengkel: [...universalMenus, ...bengkelMenus, ...universalEndMenus],
  toko_sparepart: [...universalMenus, ...sparepartMenus, ...universalEndMenus],
  toko_kain: [...universalMenus, ...kainMenus, ...universalEndMenus],
};

// ── Category labels ─────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  cafe: "☕ Cafe",
  restoran: "🍜 Restoran",
  toko_retail: "🛒 Retail",
  toko_cat: "🎨 Toko Cat",
  spa: "💆 Spa",
  bakery: "🍞 Bakery",
  bengkel: "🔧 Bengkel",
  toko_sparepart: "🚗 Sparepart",
  toko_kain: "🧵 Kain",
};

// ── Get menus for a tenant ──────────────────────────────────────────────────

export function getMenusForCategory(category: string): SidebarMenuItem[] {
  return CATEGORY_MENUS[category] ?? CATEGORY_MENUS.cafe;
}
