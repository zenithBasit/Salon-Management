import { AuthContext, useAuth } from "@/hooks/useAuth";
import { useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import CustomerManagement from "@/components/customers/CustomerManagement";
import InvoiceManagement from "@/components/invoices/InvoiceManagement";
import Analytics from "@/components/analytics/Analytics";
import Profile from "@/components/profile/Profile";
import AuthForm from "@/components/auth/AuthForm";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// const AuthContext = createContext<{ isAuthenticated: boolean; login: () => void; logout: () => void }>({
//   isAuthenticated: false,
//   login: () => {},
//   logout: () => {},
// });
// export const useAuth = () => useContext(AuthContext);

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/" state={{ from: location }} replace />;
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthForm onAuthSuccess={login} />
                }
              />
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerManagement />} />
                <Route path="/invoices" element={<InvoiceManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
