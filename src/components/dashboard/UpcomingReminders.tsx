
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Heart, Send } from "lucide-react";

const UpcomingReminders = () => {
  const reminders = [
    {
      id: 1,
      type: "birthday",
      customerName: "Sarah Johnson",
      date: "Dec 28",
      daysLeft: 3,
      phone: "+1 (555) 123-4567"
    },
    {
      id: 2,
      type: "anniversary",
      customerName: "Mike & Linda Davis",
      date: "Jan 2",
      daysLeft: 8,
      phone: "+1 (555) 987-6543"
    },
    {
      id: 3,
      type: "birthday",
      customerName: "Emma Wilson",
      date: "Jan 5",
      daysLeft: 11,
      phone: "+1 (555) 456-7890"
    },
    {
      id: 4,
      type: "birthday",
      customerName: "Robert Chen",
      date: "Jan 10",
      daysLeft: 16,
      phone: "+1 (555) 321-0987"
    }
  ];

  const getIcon = (type: string) => {
    return type === "birthday" ? 
      <Gift className="h-4 w-4 text-pink-600" /> : 
      <Heart className="h-4 w-4 text-red-600" />;
  };

  const getBadgeColor = (daysLeft: number) => {
    if (daysLeft <= 3) return "destructive";
    if (daysLeft <= 7) return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="h-5 w-5 text-purple-600" />
          <span>Upcoming Reminders</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getIcon(reminder.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{reminder.customerName}</p>
                    <p className="text-xs text-gray-600 capitalize">{reminder.type} - {reminder.date}</p>
                    <p className="text-xs text-gray-500">{reminder.phone}</p>
                  </div>
                </div>
                <Badge variant={getBadgeColor(reminder.daysLeft)} className="text-xs">
                  {reminder.daysLeft}d
                </Badge>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  <Send className="h-3 w-3 mr-1" />
                  SMS
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  WhatsApp
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4 text-sm">
          View All Reminders
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpcomingReminders;
