
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import CustomerManagement from "@/components/customers/CustomerManagement";
import InvoiceManagement from "@/components/invoices/InvoiceManagement";
import Analytics from "@/components/analytics/Analytics";
import Profile from "@/components/profile/Profile";
import AuthForm from "@/components/auth/AuthForm";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "customers":
        return <CustomerManagement />;
      case "invoices":
        return <InvoiceManagement />;
      case "analytics":
        return <Analytics />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
