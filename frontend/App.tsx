import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { ReactNode } from "react";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Overview from "./pages/Overview";
import CatalogList from "./pages/CatalogList";
import ProductEditor from "./pages/ProductEditor";
import CSVImport from "./pages/CSVImport";
import PolicyCenter from "./pages/PolicyCenter";
import AgentReadiness from "./pages/AgentReadiness";
import Playground from "./pages/Playground";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Integrations from "./pages/Integrations";
import APIKeys from "./pages/APIKeys";
import GeneralSettings from "./pages/GeneralSettings";
import SecuritySettings from "./pages/SecuritySettings";
import CheckoutPage from "./pages/CheckoutPage";
import Developers from "./pages/Developers";
import Security from "./pages/SecurityPage";
import Customers from "./pages/Customers";
import Segments from "./pages/Segments";
import Workflows from "./pages/Workflows";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMerchants from "./pages/admin/AdminMerchants";
import AdminWebhooks from "./pages/admin/AdminWebhooks";
import { AppShell } from "./components/layout/AppShell";
import { Toaster } from "./components/ui/toaster";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return <AppShell>{children}</AppShell>;
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app/overview" replace /> : <Landing />} />
      <Route path="/developers" element={<Developers />} />
      <Route path="/security" element={<Security />} />
      <Route path="/auth" element={user ? <Navigate to="/app/overview" replace /> : <Auth />} />
      <Route path="/checkout/:publicId" element={<CheckoutPage />} />
      <Route path="/app" element={<Navigate to="/app/overview" replace />} />
      <Route path="/app/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/app/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
      <Route path="/app/catalog" element={<ProtectedRoute><CatalogList /></ProtectedRoute>} />
      <Route path="/app/catalog/new" element={<ProtectedRoute><ProductEditor /></ProtectedRoute>} />
      <Route path="/app/catalog/import" element={<ProtectedRoute><CSVImport /></ProtectedRoute>} />
      <Route path="/app/catalog/:productId" element={<ProtectedRoute><ProductEditor /></ProtectedRoute>} />
      <Route path="/app/policies" element={<ProtectedRoute><PolicyCenter /></ProtectedRoute>} />
      <Route path="/app/agent-readiness" element={<ProtectedRoute><AgentReadiness /></ProtectedRoute>} />
      <Route path="/app/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
      <Route path="/app/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/app/orders/:orderId" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
      <Route path="/app/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/app/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/app/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
      <Route path="/app/integrations/api" element={<ProtectedRoute><APIKeys /></ProtectedRoute>} />
      <Route path="/app/settings/general" element={<ProtectedRoute><GeneralSettings /></ProtectedRoute>} />
      <Route path="/app/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
      <Route path="/app/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/app/customers/segments" element={<ProtectedRoute><Segments /></ProtectedRoute>} />
      <Route path="/app/operations/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
      <Route path="/internal/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/internal/admin/merchants" element={<ProtectedRoute><AdminMerchants /></ProtectedRoute>} />
      <Route path="/internal/admin/webhooks" element={<ProtectedRoute><AdminWebhooks /></ProtectedRoute>} />
      
      {/* Domain Redirects */}
      <Route path="/app/commerce" element={<Navigate to="/app/catalog" replace />} />
      <Route path="/app/agents" element={<Navigate to="/app/agent-readiness" replace />} />
      <Route path="/app/growth" element={<Navigate to="/app/analytics" replace />} />
      <Route path="/app/operations" element={<Navigate to="/app/operations/workflows" replace />} />
      <Route path="/app/developers" element={<Navigate to="/app/integrations/api" replace />} />
      <Route path="/app/intelligence" element={<Navigate to="/app/analytics" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

