
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Users, FileText } from "lucide-react";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "invoice",
      title: "Invoice #INV-2024-001 created",
      description: "Hair cut and styling for Sarah Johnson",
      amount: "$85.00",
      time: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "customer",
      title: "New customer registered",
      description: "Emily Chen joined the salon",
      time: "4 hours ago",
      status: "new"
    },
    {
      id: 3,
      type: "payment",
      title: "Payment received",
      description: "Invoice #INV-2024-002 paid by credit card",
      amount: "$120.00",
      time: "6 hours ago",
      status: "completed"
    },
    {
      id: 4,
      type: "reminder",
      title: "Birthday reminder sent",
      description: "SMS sent to Maria Rodriguez",
      time: "1 day ago",
      status: "sent"
    },
    {
      id: 5,
      type: "invoice",
      title: "Invoice #INV-2024-003 created",
      description: "Full hair treatment for Jessica Brown",
      amount: "$200.00",
      time: "1 day ago",
      status: "pending"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FileText className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "new":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-purple-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-purple-100 rounded-full">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <div className="flex items-center space-x-2">
                    {activity.amount && (
                      <span className="text-sm font-semibold text-green-600">{activity.amount}</span>
                    )}
                    <Badge variant={getBadgeVariant(activity.status)} className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
