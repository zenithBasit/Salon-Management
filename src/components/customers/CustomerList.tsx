
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Gift, Heart, Phone, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CustomerListProps {
  searchTerm: string;
  onEditCustomer: (customer: unknown) => void;
}

const CustomerList = ({ searchTerm, onEditCustomer }: CustomerListProps) => {
  const customers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      birthday: "1990-12-28",
      anniversary: "2018-06-15",
      totalVisits: 24,
      totalSpent: 1850,
      lastVisit: "2024-12-15",
      status: "active"
    },
    {
      id: 2,
      name: "Emily Chen",
      email: "emily.chen@email.com",
      phone: "+1 (555) 987-6543",
      birthday: "1985-01-05",
      anniversary: null,
      totalVisits: 12,
      totalSpent: 920,
      lastVisit: "2024-12-10",
      status: "active"
    },
    {
      id: 3,
      name: "Mike Davis",
      email: "mike.davis@email.com",
      phone: "+1 (555) 456-7890",
      birthday: "1992-03-22",
      anniversary: "2020-01-02",
      totalVisits: 18,
      totalSpent: 1340,
      lastVisit: "2024-12-08",
      status: "active"
    },
    {
      id: 4,
      name: "Jessica Brown",
      email: "jessica.brown@email.com",
      phone: "+1 (555) 321-0987",
      birthday: "1988-07-14",
      anniversary: null,
      totalVisits: 31,
      totalSpent: 2650,
      lastVisit: "2024-12-20",
      status: "vip"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleDeleteCustomer = (customerId: number) => {
    toast({
      title: "Customer deleted",
      description: "Customer has been removed from the system.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vip":
        return <Badge className="bg-yellow-100 text-yellow-800">VIP</Badge>;
      case "active":
        return <Badge variant="secondary">Active</Badge>;
      default:
        return <Badge variant="outline">Regular</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Customers ({filteredCustomers.length})</span>
          <div className="text-sm font-normal text-gray-600">
            Total Revenue: ${customers.reduce((sum, customer) => sum + customer.totalSpent, 0).toLocaleString()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                    {getStatusBadge(customer.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-pink-600" />
                      <span>Birthday: {formatDate(customer.birthday)}</span>
                    </div>
                    {customer.anniversary && (
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span>Anniversary: {formatDate(customer.anniversary)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center space-x-6 text-sm">
                    <span className="font-medium">Visits: {customer.totalVisits}</span>
                    <span className="font-medium text-green-600">Spent: ${customer.totalSpent}</span>
                    <span className="text-gray-500">Last visit: {formatDate(customer.lastVisit)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditCustomer(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerList;
