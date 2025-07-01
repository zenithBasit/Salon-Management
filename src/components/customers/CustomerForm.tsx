import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, User, Mail, Phone, Gift, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  birthday?: string;
  anniversary?: string;
  address?: string;
  notes?: string;
}

interface CustomerFormProps {
  customer?: Customer;
  onClose: () => void;
  refreshCustomers: () => void;
}

const CustomerForm = ({ customer, onClose, refreshCustomers }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    birthday: customer?.birthday || "",
    anniversary: customer?.anniversary || "",
    notes: customer?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = !!customer;
    const url = isEdit ? `/api/customers/${customer.id}` : "/api/customers";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        birthday: formData.birthday,
        anniversary: formData.anniversary,
      }),
    });

    if (response.ok) {
      toast({
        title: customer ? "Customer updated" : "Customer created",
        description: customer
          ? "Customer information has been updated successfully."
          : "New customer has been added to the system.",
      });
      refreshCustomers();
      onClose();
    } else {
      const data = await response.json();
      toast({
        title: "Error",
        description: data.message || "Failed to add customer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-purple-600" />
            <span>{customer ? "Edit Customer" : "Add New Customer"}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={e => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anniversary">Anniversary</Label>
                <Input
                  id="anniversary"
                  name="anniversary"
                  type="date"
                  value={formData.anniversary}
                  onChange={e => setFormData(prev => ({ ...prev, anniversary: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 pt-6 border-t">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                {customer ? "Update Customer" : "Add Customer"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerForm;
