import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  Building2, Users, CreditCard, Flag, Layout, Settings, BarChart3,
  ClipboardList, LogOut, ChevronLeft, Menu, Shield, Eye, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const platformMenuItems = [
  { to: "/platform", icon: BarChart3, label: "Analytics", end: true },
  { to: "/platform/tenants", icon: Building2, label: "Tenants" },
  { to: "/platform/plans", icon: CreditCard, label: "Subscription Plans" },
  { to: "/platform/features", icon: Flag, label: "Feature Flags" },
  { to: "/platform/plan-features", icon: Layout, label: "Plan ↔ Features" },
  { to: "/platform/templates", icon: Globe, label: "Templates (27)" },
  { to: "/platform/settings", icon: Settings, label: "Platform Settings" },
  { to: "/platform/audit", icon: ClipboardList, label: "Audit Log" },
];

export default function PlatformLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <div className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-[10px]">
          <Shield className="size-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-sidebar-foreground">Platform Admin</p>
            <p className="text-[10px] text-sidebar-foreground/50">tokobuilder.id</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {platformMenuItems.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
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
        <NavLink
          to="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <Globe className="size-4 shrink-0" />
          {!collapsed && <span>Landing Page</span>}
        </NavLink>
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
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300", collapsed ? "w-16" : "w-60")}>
        <div className="relative flex flex-col h-full">
          {sidebarContent}
          <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-7 z-10 flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
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
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors">
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="size-4 text-red-500" />
            <span className="font-bold text-red-600">Platform Admin</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name || "Super Admin"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-sm font-bold">
              {(user?.name || "A")[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
