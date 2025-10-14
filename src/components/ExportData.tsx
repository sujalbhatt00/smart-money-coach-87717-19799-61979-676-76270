import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const ExportData = () => {
  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: income } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const { data, error } = await supabase.from('income').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: investments } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('investments').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const exportToCSV = () => {
    try {
      let csv = 'Type,Date,Description,Category/Source/Type,Amount\n';
      
      expenses?.forEach(exp => {
        csv += `Expense,${exp.date},"${exp.description || ''}",${exp.category},${exp.amount}\n`;
      });
      
      income?.forEach(inc => {
        csv += `Income,${inc.date},"${inc.description || ''}",${inc.source},${inc.amount}\n`;
      });
      
      investments?.forEach(inv => {
        csv += `Investment,${inv.date},"${inv.description || ''}",${inv.type},${inv.amount}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      
      toast.success("Data exported to CSV successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Financial Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy')}`, 14, 28);

      let yPosition = 40;

      // Expenses
      if (expenses && expenses.length > 0) {
        doc.setFontSize(14);
        doc.text('Expenses', 14, yPosition);
        yPosition += 5;

        const expenseData = expenses.map(exp => [
          format(new Date(exp.date), 'MMM dd, yyyy'),
          exp.description || '-',
          exp.category,
          `$${Number(exp.amount).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Description', 'Category', 'Amount']],
          body: expenseData,
          theme: 'grid',
          headStyles: { fillColor: [66, 133, 244] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Income
      if (income && income.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Income', 14, yPosition);
        yPosition += 5;

        const incomeData = income.map(inc => [
          format(new Date(inc.date), 'MMM dd, yyyy'),
          inc.description || '-',
          inc.source,
          `$${Number(inc.amount).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Description', 'Source', 'Amount']],
          body: incomeData,
          theme: 'grid',
          headStyles: { fillColor: [52, 168, 83] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Investments
      if (investments && investments.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Investments', 14, yPosition);
        yPosition += 5;

        const investmentData = investments.map(inv => [
          format(new Date(inv.date), 'MMM dd, yyyy'),
          inv.description || '-',
          inv.type,
          `$${Number(inv.amount).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Description', 'Type', 'Amount']],
          body: investmentData,
          theme: 'grid',
          headStyles: { fillColor: [156, 39, 176] },
        });
      }

      doc.save(`financial-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success("Data exported to PDF successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const totalRecords = (expenses?.length || 0) + (income?.length || 0) + (investments?.length || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export Data</h2>
        <p className="text-muted-foreground">Download your financial records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Records</CardTitle>
          <CardDescription>
            You have {totalRecords} total records to export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expenses?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{income?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Investments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{investments?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRecords}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Choose your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={exportToCSV} 
            className="w-full justify-start" 
            variant="outline"
            size="lg"
          >
            <FileSpreadsheet className="h-5 w-5 mr-3" />
            <div className="text-left flex-1">
              <div className="font-semibold">Export as CSV</div>
              <div className="text-xs text-muted-foreground">
                Compatible with Excel, Google Sheets, and other spreadsheet apps
              </div>
            </div>
            <Download className="h-4 w-4" />
          </Button>

          <Button 
            onClick={exportToPDF} 
            className="w-full justify-start" 
            variant="outline"
            size="lg"
          >
            <FileText className="h-5 w-5 mr-3" />
            <div className="text-left flex-1">
              <div className="font-semibold">Export as PDF</div>
              <div className="text-xs text-muted-foreground">
                Professional report format for printing or sharing
              </div>
            </div>
            <Download className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportData;