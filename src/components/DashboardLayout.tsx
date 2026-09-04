import { useState, createContext, useContext } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LogOut, Store, ChevronLeft, Menu, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMenusForCategory, CATEGORY_LABELS, type SidebarMenuItem } from "@/config/categoryMenus";

// ── Tenant Category Context ─────────────────────────────────────────────────
// In production, this comes from the tenant's category field in Convex.
// For demo, defaults to "cafe". Tenant owner can change in Settings.

interface TenantContext {
  category: string;
  setCategory: (c: string) => void;
  tenantName: string;
}

const TenantCategoryContext = createContext<TenantContext>({
  category: "cafe",
  setCategory: () => {},
  tenantName: "Kopi Senja",
});

export const useTenantCategory = () => useContext(TenantCategoryContext);

// ── Dashboard Layout ────────────────────────────────────────────────────────

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOverride, setCategoryOverride] = useState<string | null>(null);

  // Fetch tenant data from user's tenantId
  const tenant = useQuery(
    api.tenants.getById,
    user?.tenantId ? { id: user.tenantId } : "skip",
  );

  const hasTenant = !!user?.tenantId && !!tenant;
  const category = categoryOverride ?? tenant?.category ?? "cafe";
  const tenantName = tenant?.name ?? "Belum ada toko";
  const setCategory = setCategoryOverride;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get menus for this tenant's category — kosong sampai tenant dibuat (wizard Buat Toko)
  const menus: SidebarMenuItem[] = hasTenant ? getMenusForCategory(category) : [];

  const sidebarContent = (
    <>
      {/* Logo & Tenant Info */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-[10px]">
          TB
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-sidebar-foreground truncate">{tenantName}</p>
            <p className="text-[10px] text-sidebar-foreground/50">{hasTenant ? (CATEGORY_LABELS[category] ?? category) : "Belum ada toko"}</p>
          </div>
        )}
      </div>

      {/* Dynamic Navigation — filtered by tenant category */}
      {!hasTenant && !collapsed && (
        <div className="mx-3 mt-4 rounded-lg border border-dashed border-border p-3 text-center">
          <p className="text-xs font-semibold text-sidebar-foreground">Belum ada toko</p>
          <p className="text-[10px] text-sidebar-foreground/50 mt-1">Buat toko lewat tombol di halaman utama</p>
        </div>
      )}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menus.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )
            }
          >
            <link.icon className="size-4 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {hasTenant && (
          <NavLink
            to="/store"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <Store className="size-4 shrink-0" />
            {!collapsed && <span>Lihat Toko</span>}
          </NavLink>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </>
  );

  return (
    <TenantCategoryContext.Provider value={{ category, setCategory, tenantName }}>
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
              <ChevronLeft className={cn("size-3 transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top Bar */}
          <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors">
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4" />
              <span className="hidden sm:inline">{tenantName}</span>
              <span className="text-border">·</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {CATEGORY_LABELS[category] ?? category}
              </span>
            </div>
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
    </TenantCategoryContext.Provider>
  );
}
