
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Scissors } from "lucide-react";

const ServiceAnalytics = () => {
  const serviceData = [
    { name: "Hair Cut & Style", value: 35, revenue: 8750, color: "#7c3aed" },
    { name: "Hair Color", value: 25, revenue: 6250, color: "#3b82f6" },
    { name: "Facial Treatment", value: 20, revenue: 4000, color: "#10b981" },
    { name: "Manicure & Pedicure", value: 12, revenue: 2400, color: "#f59e0b" },
    { name: "Massage", value: 8, revenue: 1600, color: "#ef4444" }
  ];

  const totalRevenue = serviceData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scissors className="h-5 w-5 text-purple-600" />
          <span>Service Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${value}%`}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Service List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Service Breakdown</h4>
            {serviceData.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: service.color }}
                  ></div>
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{service.value}%</p>
                  <p className="text-xs text-gray-600">${service.revenue}</p>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex justify-between">
                <span className="font-semibold">Total Revenue:</span>
                <span className="font-semibold text-green-600">${totalRevenue}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceAnalytics;
