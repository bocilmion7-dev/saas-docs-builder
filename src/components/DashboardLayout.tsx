import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  Menu,
  Boxes,
  Truck,
  Tags,
  Building2,
  ClipboardCheck,
  Wallet,
  Trash2,
  ArrowDownCircle,
  FileText,
  Grid3X3,
  ChefHat,
  CalendarDays,
  Paintbrush,
  Calculator,
  Wrench,
  Car,
  Link2,
  Scissors,
  Heart,
  Cake,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/dashboard/products", icon: Package, label: "Produk" },
  { to: "/dashboard/orders", icon: ShoppingCart, label: "Pesanan" },
  { to: "/dashboard/pos", icon: Receipt, label: "POS / Kasir" },
  { to: "/dashboard/customers", icon: Users, label: "Pelanggan" },
  { to: "/dashboard/inventory", icon: Boxes, label: "Inventaris" },
  { to: "/dashboard/suppliers", icon: Truck, label: "Supplier" },
  { to: "/dashboard/categories", icon: Tags, label: "Kategori" },
  { to: "/dashboard/opening-closing", icon: ClipboardCheck, label: "Opening / Closing" },
  { to: "/dashboard/pos-shifts", icon: Wallet, label: "Shift POS" },
  { to: "/dashboard/waste", icon: Trash2, label: "Waste" },
  { to: "/dashboard/stock-movements", icon: ArrowDownCircle, label: "Riwayat Stok" },
  { to: "/dashboard/purchase-orders", icon: FileText, label: "Purchase Order" },
  { to: "/dashboard/reports", icon: BarChart3, label: "Laporan" },
  { to: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
  { to: "/dashboard/admin/tenants", icon: Building2, label: "Admin Tenant" },
];

const categoryMenus = [
  // Cafe/Resto
  { to: "/dashboard/table-management", icon: Grid3X3, label: "Manajemen Meja", category: "cafe_resto" },
  { to: "/dashboard/kds", icon: ChefHat, label: "Kitchen Display", category: "cafe_resto" },
  { to: "/dashboard/reservations", icon: CalendarDays, label: "Reservasi", category: "cafe_resto" },
  { to: "/dashboard/modifiers", icon: Settings, label: "Modifier Menu", category: "cafe_resto" },
  // Toko Cat
  { to: "/dashboard/tinting", icon: Paintbrush, label: "Tinting & Mixing", category: "toko_cat" },
  { to: "/dashboard/volume-calculator", icon: Calculator, label: "Volume Calculator", category: "toko_cat" },
  // Bengkel
  { to: "/dashboard/work-orders", icon: Wrench, label: "Work Order", category: "bengkel" },
  { to: "/dashboard/vehicle-db", icon: Car, label: "Vehicle Database", category: "bengkel" },
  // Sparepart
  { to: "/dashboard/vin-lookup", icon: Link2, label: "VIN / Part Lookup", category: "sparepart" },
  // Kain
  { to: "/dashboard/fabric-rolls", icon: Scissors, label: "Fabric Rolls", category: "kain" },
  { to: "/dashboard/obras", icon: Scissors, label: "Obras Service", category: "kain" },
  { to: "/dashboard/konveksi-b2b", icon: FileText, label: "Konveksi B2B", category: "kain" },
  // Spa
  { to: "/dashboard/spa-bookings", icon: Heart, label: "Spa Booking", category: "spa" },
  // Bakery
  { to: "/dashboard/production-plan", icon: Cake, label: "Production Plan", category: "bakery" },
  { to: "/dashboard/custom-cake", icon: Cake, label: "Custom Cake", category: "bakery" },
  // Universal
  { to: "/dashboard/vouchers-loyalty", icon: Ticket, label: "Voucher & Loyalty", category: "universal" },
];

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-[10px]">
          TB
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-sidebar-foreground">
            TokoBuilder
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )
            }
          >
            <link.icon className="size-4 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
        {/* Category-specific menus */}
        <div className="pt-2 mt-2 border-t border-sidebar-border/50">
          {!collapsed && <p className="px-3 pb-1 text-[10px] font-bold uppercase text-sidebar-foreground/40 tracking-wider">Kategori Spesifik</p>}
          {categoryMenus.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )
              }
            >
              <link.icon className="size-3.5 shrink-0" />
              {!collapsed && <span className="text-xs">{link.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <Store className="size-4 shrink-0" />
          {!collapsed && <span>Lihat Toko</span>}
        </NavLink>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="relative flex flex-col h-full">
          {sidebarContent}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-7 z-10 flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft
              className={cn(
                "size-3 transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
              {(user?.name || "A")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
