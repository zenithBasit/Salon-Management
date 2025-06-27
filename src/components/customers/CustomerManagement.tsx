import type { Customer } from "./CustomerList";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search } from "lucide-react";
import CustomerList from "./CustomerList";
import CustomerForm from "./CustomerForm";

const CustomerManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your salon customers and their information</p>
        </div>
        <Button onClick={handleAddCustomer} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <CustomerList 
        searchTerm={searchTerm} 
        onEditCustomer={handleEditCustomer}
      />

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
