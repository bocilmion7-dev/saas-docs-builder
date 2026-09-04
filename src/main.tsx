import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const MarketplaceLanding = lazy(() => import("./pages/MarketplaceLanding.tsx"));
const CategoryPage = lazy(() => import("./pages/CategoryPage.tsx"));
const LandingPlatform = lazy(() => import("./pages/LandingPlatform.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Storefront = lazy(() => import("./pages/Storefront.tsx"));
const ProductDetailPage = lazy(() => import("./pages/storefront/ProductDetailPage.tsx"));
const CheckoutPage = lazy(() => import("./pages/storefront/CheckoutPage.tsx"));
const SearchPage = lazy(() => import("./pages/storefront/SearchPage.tsx"));
const DashboardLayout = lazy(() => import("@/components/DashboardLayout.tsx"));
const ProductsPage = lazy(() => import("./pages/ProductsPage.tsx"));
const OrdersPage = lazy(() => import("./pages/OrdersPage.tsx"));
const POSPage = lazy(() => import("./pages/POSPage.tsx"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage.tsx"));
const CustomersPage = lazy(() => import("./pages/CustomersPage.tsx"));
const InventoryPage = lazy(() => import("./pages/InventoryPage.tsx"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage.tsx"));
const ReportsPage = lazy(() => import("./pages/ReportsPage.tsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.tsx"));
const TenantsAdminPage = lazy(() => import("./pages/TenantsAdminPage.tsx"));
const OpeningClosingPage = lazy(() => import("./pages/OpeningClosingPage.tsx"));
const PosShiftsPage = lazy(() => import("./pages/PosShiftsPage.tsx"));
const WastePage = lazy(() => import("./pages/WastePage.tsx"));
const StockMovementsPage = lazy(() => import("./pages/StockMovementsPage.tsx"));
const PurchaseOrdersPage = lazy(() => import("./pages/PurchaseOrdersPage.tsx"));
const TableManagement = lazy(() => import("./pages/TableManagement.tsx"));
const KDSPage = lazy(() => import("./pages/KDSPage.tsx"));
const ReservationsPage = lazy(() => import("./pages/ReservationsPage.tsx"));
const ModifiersPage = lazy(() => import("./pages/ModifiersPage.tsx"));
const TintingMixing = lazy(() => import("./pages/TintingMixing.tsx"));
const VolumeCalculator = lazy(() => import("./pages/VolumeCalculator.tsx"));
const WorkOrders = lazy(() => import("./pages/WorkOrders.tsx"));
const VehicleDB = lazy(() => import("./pages/VehicleDB.tsx"));
const VINLookup = lazy(() => import("./pages/VINLookup.tsx"));
const FabricRolls = lazy(() => import("./pages/FabricRolls.tsx"));
const SpaBookings = lazy(() => import("./pages/SpaBookings.tsx"));
const ProductionPlan = lazy(() => import("./pages/ProductionPlan.tsx"));
const CustomCake = lazy(() => import("./pages/CustomCake.tsx"));
const Obras = lazy(() => import("./pages/Obras.tsx"));
const KonveksiB2B = lazy(() => import("./pages/KonveksiB2B.tsx"));
const VouchersLoyalty = lazy(() => import("./pages/VouchersLoyalty.tsx"));
const StaffManagement = lazy(() => import("./pages/StaffManagement.tsx"));
const BOMRecipe = lazy(() => import("./pages/BOMRecipe.tsx"));
const HardwareSettings = lazy(() => import("./pages/HardwareSettings.tsx"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage.tsx"));
const TherapistManagement = lazy(() => import("./pages/TherapistManagement.tsx"));
const RoomManagement = lazy(() => import("./pages/RoomManagement.tsx"));
const HealthForms = lazy(() => import("./pages/HealthForms.tsx"));
const TreatmentLogs = lazy(() => import("./pages/TreatmentLogs.tsx"));
const QCLog = lazy(() => import("./pages/QCLog.tsx"));
const DisplayCounter = lazy(() => import("./pages/DisplayCounter.tsx"));
const JobCards = lazy(() => import("./pages/JobCards.tsx"));
const QCTestDrive = lazy(() => import("./pages/QCTestDrive.tsx"));
const ServiceReminders = lazy(() => import("./pages/ServiceReminders.tsx"));
const CrossReference = lazy(() => import("./pages/CrossReference.tsx"));
const PartWarranty = lazy(() => import("./pages/PartWarranty.tsx"));
const CustomerReturns = lazy(() => import("./pages/CustomerReturns.tsx"));
const PreOrder = lazy(() => import("./pages/PreOrder.tsx"));
const FabricCutting = lazy(() => import("./pages/FabricCutting.tsx"));
const FabricRemnants = lazy(() => import("./pages/FabricRemnants.tsx"));
const FabricQualityCheck = lazy(() => import("./pages/FabricQualityCheck.tsx"));
const ColorSamples = lazy(() => import("./pages/ColorSamples.tsx"));
const ContractorProjects = lazy(() => import("./pages/ContractorProjects.tsx"));
const ComplaintTickets = lazy(() => import("./pages/ComplaintTickets.tsx"));
const HSEChecklist = lazy(() => import("./pages/HSEChecklist.tsx"));
const DeliveryOrders = lazy(() => import("./pages/DeliveryOrders.tsx"));
const WaitingList = lazy(() => import("./pages/WaitingList.tsx"));
const PigmentStock = lazy(() => import("./pages/PigmentStock.tsx"));
const DiscountRules = lazy(() => import("./pages/DiscountRules.tsx"));
const ToolsMaintenance = lazy(() => import("./pages/ToolsMaintenance.tsx"));
const DayPasses = lazy(() => import("./pages/DayPasses.tsx"));
const PiutangKonveksi = lazy(() => import("./pages/PiutangKonveksi.tsx"));
const VariantMatrixPage = lazy(() => import("./pages/VariantMatrixPage.tsx"));
const ReceivingPage = lazy(() => import("./pages/ReceivingPage.tsx"));
const SizeExchangesPage = lazy(() => import("./pages/SizeExchangesPage.tsx"));
const RetailReturnsPage = lazy(() => import("./pages/RetailReturnsPage.tsx"));
const StockOpnamePage = lazy(() => import("./pages/StockOpnamePage.tsx"));
const StoreChecklistsPage = lazy(() => import("./pages/StoreChecklistsPage.tsx"));
const SecurityMaintenancePage = lazy(() => import("./pages/SecurityMaintenancePage.tsx"));
const BrandsPage = lazy(() => import("./pages/BrandsPage.tsx"));
const UnitsPage = lazy(() => import("./pages/UnitsPage.tsx"));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage.tsx"));
const PlatformLayout = lazy(() => import("@/components/PlatformLayout.tsx"));
const PlatformAnalytics = lazy(() => import("./pages/platform/PlatformAnalytics.tsx"));
const PlatformTenants = lazy(() => import("./pages/platform/PlatformTenants.tsx"));
const PlatformPlans = lazy(() => import("./pages/platform/PlatformPlans.tsx"));
const PlatformFeatures = lazy(() => import("./pages/platform/PlatformFeatures.tsx"));
const PlatformSettings = lazy(() => import("./pages/platform/PlatformSettings.tsx"));
const PlatformAudit = lazy(() => import("./pages/platform/PlatformAudit.tsx"));
const PlatformTemplates = lazy(() => import("./pages/platform/PlatformTemplates.tsx"));
const PlatformLanding = lazy(() => import("./pages/platform/PlatformLanding.tsx"));
const PlatformBanners = lazy(() => import("./pages/platform/PlatformBanners.tsx"));
const AdminLogin = lazy(() => import("./pages/platform/AdminLogin.tsx"));
const SeedDemo = lazy(() => import("./pages/SeedDemo.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<MarketplaceLanding />} />
              <Route path="/marketplace/category/:category" element={<CategoryPage />} />
              <Route path="/platform-landing" element={<LandingPlatform />} />
              <Route path="/store" element={<Storefront />} />
              <Route path="/store/product/:slug" element={<ProductDetailPage />} />
              <Route path="/store/checkout" element={<CheckoutPage />} />
              <Route path="/store/search" element={<SearchPage />} />
              <Route path="/seed" element={<SeedDemo />} />              <Route path="/auth"
                element={<AuthPage redirectAfterAuth="/dashboard" />}
              />
              {/* Halaman login admin tersembunyi — hanya bisa dibuka via URL langsung */}
              <Route path="/platform-login" element={<AdminLogin />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <DashboardLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="pos" element={<POSPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="admin/tenants" element={<TenantsAdminPage />} />
                <Route path="opening-closing" element={<OpeningClosingPage />} />
                <Route path="pos-shifts" element={<PosShiftsPage />} />
                <Route path="waste" element={<WastePage />} />
                <Route path="stock-movements" element={<StockMovementsPage />} />
                <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="table-management" element={<TableManagement />} />
                <Route path="kds" element={<KDSPage />} />
                <Route path="reservations" element={<ReservationsPage />} />
                <Route path="modifiers" element={<ModifiersPage />} />
                <Route path="tinting" element={<TintingMixing />} />
                <Route path="volume-calculator" element={<VolumeCalculator />} />
                <Route path="work-orders" element={<WorkOrders />} />
                <Route path="vehicle-db" element={<VehicleDB />} />
                <Route path="vin-lookup" element={<VINLookup />} />
                <Route path="fabric-rolls" element={<FabricRolls />} />
                <Route path="spa-bookings" element={<SpaBookings />} />
                <Route path="production-plan" element={<ProductionPlan />} />
                <Route path="custom-cake" element={<CustomCake />} />
                <Route path="obras" element={<Obras />} />
                <Route path="konveksi-b2b" element={<KonveksiB2B />} />
                <Route path="vouchers-loyalty" element={<VouchersLoyalty />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="bom-recipe" element={<BOMRecipe />} />
                <Route path="hardware" element={<HardwareSettings />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="brands" element={<BrandsPage />} />
                <Route path="units" element={<UnitsPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                {/* Spa */}
                <Route path="therapists" element={<TherapistManagement />} />
                <Route path="rooms" element={<RoomManagement />} />
                <Route path="health-forms" element={<HealthForms />} />
                <Route path="treatment-logs" element={<TreatmentLogs />} />
                {/* Bakery */}
                <Route path="qc-log" element={<QCLog />} />
                <Route path="display-counter" element={<DisplayCounter />} />
                {/* Bengkel */}
                <Route path="job-cards" element={<JobCards />} />
                <Route path="qc-test-drive" element={<QCTestDrive />} />
                <Route path="service-reminders" element={<ServiceReminders />} />
                {/* Sparepart */}
                <Route path="cross-reference" element={<CrossReference />} />
                <Route path="warranty" element={<PartWarranty />} />
                <Route path="customer-returns" element={<CustomerReturns />} />
                <Route path="pre-order" element={<PreOrder />} />
                {/* Kain */}
                <Route path="fabric-cutting" element={<FabricCutting />} />
                <Route path="fabric-remnants" element={<FabricRemnants />} />
                <Route path="fabric-quality-check" element={<FabricQualityCheck />} />
                {/* Toko Cat */}
                <Route path="color-samples" element={<ColorSamples />} />
                <Route path="contractor-projects" element={<ContractorProjects />} />
                <Route path="complaint-tickets" element={<ComplaintTickets />} />
                <Route path="hse-checklist" element={<HSEChecklist />} />
                <Route path="delivery-orders" element={<DeliveryOrders />} />
                {/* Cafe/Resto */}
                <Route path="waiting-list" element={<WaitingList />} />
                {/* Pigment Stock (Toko Cat) */}
                <Route path="pigment-stock" element={<PigmentStock />} />
                {/* Discount Rules (Bakery) */}
                <Route path="discount-rules" element={<DiscountRules />} />
                {/* Tools Maintenance (Bengkel) */}
                <Route path="tools-maintenance" element={<ToolsMaintenance />} />
                {/* Day Passes (Spa) */}
                <Route path="day-passes" element={<DayPasses />} />
                {/* Piutang Konveksi (Kain) */}
                <Route path="piutang-konveksi" element={<PiutangKonveksi />} />
                {/* Toko Pakaian / Fashion */}
                <Route path="variant-matrix" element={<VariantMatrixPage />} />
                <Route path="receiving" element={<ReceivingPage />} />
                <Route path="size-exchange" element={<SizeExchangesPage />} />
                <Route path="retail-returns" element={<RetailReturnsPage />} />
                <Route path="stock-opname" element={<StockOpnamePage />} />
                <Route path="store-checklist" element={<StoreChecklistsPage />} />
                <Route path="security-maintenance" element={<SecurityMaintenancePage />} />
              </Route>
              {/* Platform Admin Routes */}
              <Route path="/platform" element={<PlatformLayout />}>
                <Route index element={<PlatformAnalytics />} />
                <Route path="tenants" element={<PlatformTenants />} />
                <Route path="plans" element={<PlatformPlans />} />
                <Route path="features" element={<PlatformFeatures />} />
                <Route path="plan-features" element={<PlatformFeatures />} />
                <Route path="templates" element={<PlatformTemplates />} />
                <Route path="banners" element={<PlatformBanners />} />
                <Route path="landing" element={<PlatformLanding />} />
                <Route path="settings" element={<PlatformSettings />} />
                <Route path="audit" element={<PlatformAudit />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        {/* Floating WhatsApp — landing + semua halaman platform */}
        <WhatsAppFloat />
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
