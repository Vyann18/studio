'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { inventoryItems } from '@/lib/data';
import type { InventoryItem } from '@/lib/types';
import { Download, FileText, Package, AlertTriangle } from 'lucide-react';

type ReportType = 'stock-levels' | 'low-stock';

export default function ReportsPage() {
  const [reportData, setReportData] = useState<InventoryItem[] | null>(null);
  const [reportType, setReportType] = useState<ReportType | null>(null);

  const generateReport = (type: ReportType) => {
    setReportType(type);
    if (type === 'stock-levels') {
      setReportData(inventoryItems);
    } else if (type === 'low-stock') {
      setReportData(inventoryItems.filter(item => item.quantity > 0 && item.quantity <= 10));
    }
  };

  const getStatusBadge = (quantity: number) => {
    if (quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (quantity <= 10) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Low Stock</Badge>;
    return <Badge variant="secondary">In Stock</Badge>;
  };
  
  const reportTitles: Record<ReportType, string> = {
    'stock-levels': 'Full Stock Level Report',
    'low-stock': 'Low Stock Items Report'
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view inventory reports.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package/>Stock Levels</CardTitle>
            <CardDescription>Generate a report of all items and their current stock levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => generateReport('stock-levels')}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle/>Low Stock Items</CardTitle>
            <CardDescription>Generate a report of all items that are currently low on stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => generateReport('low-stock')}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {reportData && reportType && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{reportTitles[reportType]}</CardTitle>
              <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
            </div>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length > 0 ? (
                    reportData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{getStatusBadge(item.quantity)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No items to display for this report.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
