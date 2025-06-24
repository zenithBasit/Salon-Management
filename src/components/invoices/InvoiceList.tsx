
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Download, DollarSign, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InvoiceListProps {
  searchTerm: string;
  onEditInvoice: (invoice: any) => void;
}

const InvoiceList = ({ searchTerm, onEditInvoice }: InvoiceListProps) => {
  const invoices = [
    {
      id: "INV-2024-001",
      customerName: "Sarah Johnson",
      customerPhone: "+1 (555) 123-4567",
      date: "2024-12-20",
      dueDate: "2024-12-27",
      amount: 185.00,
      tax: 15.00,
      total: 200.00,
      status: "paid",
      services: [
        { name: "Hair Cut & Style", price: 85.00 },
        { name: "Hair Color", price: 100.00 }
      ]
    },
    {
      id: "INV-2024-002",
      customerName: "Emily Chen",
      customerPhone: "+1 (555) 987-6543",
      date: "2024-12-19",
      dueDate: "2024-12-26",
      amount: 120.00,
      tax: 10.00,
      total: 130.00,
      status: "pending",
      services: [
        { name: "Facial Treatment", price: 80.00 },
        { name: "Eyebrow Shaping", price: 40.00 }
      ]
    },
    {
      id: "INV-2024-003",
      customerName: "Jessica Brown",
      customerPhone: "+1 (555) 321-0987",
      date: "2024-12-18",
      dueDate: "2024-12-25",
      amount: 250.00,
      tax: 20.00,
      total: 270.00,
      status: "overdue",
      services: [
        { name: "Full Hair Treatment", price: 150.00 },
        { name: "Manicure & Pedicure", price: 100.00 }
      ]
    },
    {
      id: "INV-2024-004",
      customerName: "Mike Davis",
      customerPhone: "+1 (555) 456-7890",
      date: "2024-12-17",
      dueDate: "2024-12-24",
      amount: 65.00,
      tax: 5.00,
      total: 70.00,
      status: "paid",
      services: [
        { name: "Men's Haircut", price: 35.00 },
        { name: "Beard Trim", price: 30.00 }
      ]
    }
  ];

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.total.toString().includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownload = (invoiceId: string) => {
    toast({
      title: "Download started",
      description: `Invoice ${invoiceId} is being downloaded.`,
    });
  };

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invoices ({filteredInvoices.length})</span>
          <div className="text-sm font-normal text-gray-600 flex space-x-4">
            <span>Total: ${totalAmount.toFixed(2)}</span>
            <span className="text-green-600">Paid: ${paidAmount.toFixed(2)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{invoice.id}</h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{invoice.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date: {new Date(invoice.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">Services:</p>
                    <div className="text-sm text-gray-600">
                      {invoice.services.map((service, index) => (
                        <span key={index}>
                          {service.name} (${service.price.toFixed(2)})
                          {index < invoice.services.length - 1 && ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditInvoice(invoice)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(invoice.id)}
                  >
                    <Download className="h-4 w-4" />
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

export default InvoiceList;
