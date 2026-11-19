import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useEffect } from "react";
import { useBusinessSettings } from "@/hooks/use-settings";

const AdminAccess = lazy(() => import("@/components/admin/AdminAccess"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const OrderOnline = lazy(() => import("./pages/OrderOnline"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./components/admin/AdminOrders"));
const AdminProducts = lazy(() => import("./components/admin/AdminProducts"));
const AdminSettings = lazy(() => import("./components/admin/AdminSettings"));
const AdminSpecials = lazy(() => import("./components/admin/AdminSpecials"));
const AdminPayments = lazy(() => import("./components/admin/AdminPayments"));
const AdminPages = lazy(() => import("./components/admin/AdminPages"));
const AdminTestimonials = lazy(() => import("./components/admin/AdminTestimonials"));
const AdminNewsletter = lazy(() => import("./components/admin/AdminNewsletter"));
const AdminContacts = lazy(() => import("./components/admin/AdminContacts"));
const AdminHeaderFooter = lazy(() => import("./components/admin/AdminHeaderFooter"));
const AdminLoyalty = lazy(() => import("./components/admin/AdminLoyalty"));
const AdminCategories = lazy(() => import("./components/admin/AdminCategories"));
const AdminUnits = lazy(() => import("./components/admin/AdminUnits"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Invoice = lazy(() => import("./pages/Invoice"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function SiteBrandingRuntime() {
  const { data } = useBusinessSettings();
  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    const colors: Record<string, string | null> = {
      "--brand-red": data.brand_red, "--brand-yellow": data.brand_yellow,
      "--brand-green": data.brand_green, "--brand-charcoal": data.brand_charcoal,
      "--brand-sand": data.brand_sand,
    };
    Object.entries(colors).forEach(([key, value]) => { if (value && /^#[0-9a-f]{6}$/i.test(value)) root.style.setProperty(key, value); });
    const toHsl = (hex: string) => {
      const rgb = hex.match(/[0-9a-f]{2}/gi)?.map((part) => parseInt(part, 16) / 255) ?? [0, 0, 0];
      const max = Math.max(...rgb), min = Math.min(...rgb); let h = 0, s = 0; const l = (max + min) / 2;
      if (max !== min) { const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min); switch (max) { case rgb[0]: h = (rgb[1] - rgb[2]) / d + (rgb[1] < rgb[2] ? 6 : 0); break; case rgb[1]: h = (rgb[2] - rgb[0]) / d + 2; break; default: h = (rgb[0] - rgb[1]) / d + 4; } h /= 6; }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    if (data.brand_red) { root.style.setProperty("--primary", toHsl(data.brand_red)); root.style.setProperty("--ring", toHsl(data.brand_red)); }
    if (data.brand_yellow) { root.style.setProperty("--accent", toHsl(data.brand_yellow)); root.style.setProperty("--warning", toHsl(data.brand_yellow)); }
    if (data.brand_sand) root.style.setProperty("--background", toHsl(data.brand_sand));
    if (data.brand_charcoal) root.style.setProperty("--foreground", toHsl(data.brand_charcoal));
    root.style.setProperty("--heading-font", `"${data.heading_font || "Montserrat"}", sans-serif`);
    root.style.setProperty("--body-font", `"${data.body_font || "Inter"}", sans-serif`);
  }, [data]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SiteBrandingRuntime />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <CartDrawer />
            <main className="flex-1">
              <Suspense fallback={<div className="route-loading" role="status">Loading JayCee…</div>}>
                <Routes>
                  {/* Customer storefront */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/order" element={<OrderOnline />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/track" element={<TrackOrder />} />
                  <Route path="/invoice/:orderId" element={<Invoice />} />
                  <Route path="/:slug" element={<DynamicPage />} />

                  <Route element={<AdminAccess />}>
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                    <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
                    <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
                    <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                    <Route path="/admin/specials" element={<AdminLayout><AdminSpecials /></AdminLayout>} />
                    <Route path="/admin/payments" element={<AdminLayout><AdminPayments /></AdminLayout>} />
                    <Route path="/admin/pages" element={<AdminLayout><AdminPages /></AdminLayout>} />
                    <Route path="/admin/reviews" element={<AdminLayout><AdminTestimonials /></AdminLayout>} />
                    <Route path="/admin/newsletter" element={<AdminLayout><AdminNewsletter /></AdminLayout>} />
                    <Route path="/admin/contacts" element={<AdminLayout><AdminContacts /></AdminLayout>} />
                    <Route path="/admin/header-footer" element={<AdminLayout><AdminHeaderFooter /></AdminLayout>} />
                    <Route path="/admin/loyalty" element={<AdminLayout><AdminLoyalty /></AdminLayout>} />
                    <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
                    <Route path="/admin/units" element={<AdminLayout><AdminUnits /></AdminLayout>} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
