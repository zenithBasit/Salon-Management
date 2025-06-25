import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
  Gift,
} from "lucide-react"
import StatsCard from "./StatsCard"
import RecentActivity from "./RecentActivity"
import UpcomingReminders from "./UpcomingReminders"

import { StatsCardProps } from "./StatsCard"

const Dashboard = () => {
  const stats: StatsCardProps[] = [
    {
      title: "Total Customers",
      value: "1,234",
      change: "+12%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Monthly Revenue",
      value: "$15,640",
      change: "+8%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Total Invoices",
      value: "856",
      change: "+18%",
      icon: FileText,
      trend: "up",
    },
    {
      title: "Growth Rate",
      value: "23.5%",
      change: "+5%",
      icon: TrendingUp,
      trend: "up",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening at your salon.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Upcoming Reminders - Takes 1 column */}
        <div className="lg:col-span-1">
          <UpcomingReminders />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Common tasks for salon management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Add Customer</h3>
                  <p className="text-sm text-gray-600">Register new client</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Create Invoice</h3>
                  <p className="text-sm text-gray-600">Bill for services</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <Gift className="h-8 w-8 text-pink-600" />
                <div>
                  <h3 className="font-semibold">Send Reminder</h3>
                  <p className="text-sm text-gray-600">Birthday/Anniversary</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
