
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Calendar, Heart } from "lucide-react";

const CustomerInsights = () => {
  const topCustomers = [
    { name: "Jessica Brown", visits: 31, spent: 2650, status: "VIP" },
    { name: "Sarah Johnson", visits: 24, spent: 1850, status: "Regular" },
    { name: "Mike Davis", visits: 18, spent: 1340, status: "Regular" },
    { name: "Emily Chen", visits: 12, spent: 920, status: "Regular" },
    { name: "Lisa Wilson", visits: 8, spent: 640, status: "New" }
  ];

  const upcomingEvents = [
    { customer: "Sarah Johnson", type: "birthday", date: "Dec 28", daysLeft: 3 },
    { customer: "Mike & Linda Davis", type: "anniversary", date: "Jan 2", daysLeft: 8 },
    { customer: "Emma Wilson", type: "birthday", date: "Jan 5", daysLeft: 11 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span>Customer Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Customers */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Top Paying Customers</h4>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.visits} visits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${customer.spent}</p>
                  {customer.status === "VIP" && <Crown className="h-4 w-4 text-yellow-500 ml-auto" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Upcoming Events</h4>
          <div className="space-y-2">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  {event.type === "birthday" ? 
                    <Calendar className="h-4 w-4 text-pink-600" /> : 
                    <Heart className="h-4 w-4 text-red-600" />
                  }
                  <div>
                    <p className="text-sm font-medium">{event.customer}</p>
                    <p className="text-xs text-gray-600 capitalize">{event.type} - {event.date}</p>
                  </div>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {event.daysLeft}d
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInsights;
