import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Download, DollarSign, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface Service {
  name: string;
  price: number;
}

interface Invoice {
  id: number;
  customer_name: string;
  date: string;
  due_date?: string;
  total_amount: number;
  tax_rate?: number;
  status: string;
  services?: Service[];
}

interface InvoiceListProps {
  searchTerm: string;
  onEditInvoice: (invoice: Invoice) => void;
}

const InvoiceList = ({ searchTerm, onEditInvoice }: InvoiceListProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/invoices')
      .then(res => res.json())
      .then(setInvoices);
  }, []);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toString().includes(searchTerm) ||
    (invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    invoice.total_amount.toString().includes(searchTerm)
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

  const handleDownload = (invoiceId: number) => {
    toast({
      title: "Download started",
      description: `Invoice ${invoiceId} is being downloaded.`,
    });
  };

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

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
                      <span>{invoice.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date: {new Date(invoice.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">${invoice.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">Services:</p>
                    <div className="text-sm text-gray-600">
                      {invoice.services && invoice.services.length > 0
                        ? invoice.services.map((service, index) => (
                            <span key={index}>
                              {service.name} (${service.price.toFixed(2)})
                              {index < invoice.services.length - 1 && ", "}
                            </span>
                          ))
                        : <span>—</span>
                      }
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
