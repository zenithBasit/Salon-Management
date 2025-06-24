
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { DollarSign } from "lucide-react";

const RevenueChart = () => {
  const data = [
    { month: "Jan", revenue: 12400, customers: 45, invoices: 78 },
    { month: "Feb", revenue: 13200, customers: 52, invoices: 85 },
    { month: "Mar", revenue: 15600, customers: 48, invoices: 92 },
    { month: "Apr", revenue: 14800, customers: 61, invoices: 88 },
    { month: "May", revenue: 16900, customers: 55, invoices: 95 },
    { month: "Jun", revenue: 18200, customers: 67, invoices: 102 },
    { month: "Jul", revenue: 17500, customers: 58, invoices: 98 },
    { month: "Aug", revenue: 19200, customers: 72, invoices: 108 },
    { month: "Sep", revenue: 16800, customers: 63, invoices: 94 },
    { month: "Oct", revenue: 20100, customers: 78, invoices: 115 },
    { month: "Nov", revenue: 18900, customers: 69, invoices: 106 },
    { month: "Dec", revenue: 22300, customers: 84, invoices: 125 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Revenue Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#7c3aed" 
                strokeWidth={3}
                dot={{ fill: "#7c3aed", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#3b82f6" name="Customers" />
              <Bar dataKey="invoices" fill="#10b981" name="Invoices" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueChart;
