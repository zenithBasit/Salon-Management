import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Scissors,
  LogOut
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { id: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "/customers", label: "Customers", icon: Users },
    { id: "/invoices", label: "Invoices", icon: FileText },
    { id: "/analytics", label: "Analytics", icon: BarChart3 },
    { id: "/profile", label: "Profile", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Scissors className="h-8 w-8 text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">SalonPro</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link to={item.id} key={item.id}>
              <Button
                variant={location.pathname === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start space-x-2",
                  location.pathname === item.id && "bg-purple-600 text-white hover:bg-purple-700"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button variant="ghost" className="w-full justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
