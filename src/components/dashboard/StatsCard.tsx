
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down";
}

const StatsCard = ({ title, value, change, icon: Icon, trend }: StatsCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={cn(
              "text-sm font-medium",
              trend === "up" ? "text-green-600" : "text-red-600"
            )}>
              {change} from last month
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
