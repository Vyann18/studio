'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Users } from 'lucide-react';

const sales = [
    { id: 'INV-001', customer: 'Alice Smith', date: '2024-05-28', status: 'Paid', total: 299.90 },
    { id: 'INV-002', customer: 'Bob Johnson', date: '2024-05-27', status: 'Pending', total: 199.90 },
    { id: 'INV-003', customer: 'Charlie Brown', date: '2024-05-26', status: 'Paid', total: 90.00 },
];

const customers = [
    { id: 'CUS-01', name: 'Alice Smith', email: 'alice@example.com' },
    { id: 'CUS-02', name: 'Bob Johnson', email: 'bob@example.com' },
]

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            Create new sales, view history, and manage customers.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Sale
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Sales History</CardTitle>
                    <CardDescription>View all your past sales transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Payment Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell className="font-medium">{sale.id}</TableCell>
                                <TableCell>{sale.customer}</TableCell>
                                <TableCell>{sale.date}</TableCell>
                                <TableCell>
                                <Badge variant={sale.status === 'Paid' ? 'secondary' : 'destructive'}>{sale.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Customers</CardTitle>
                    <CardDescription>Manage your customer information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button variant="outline" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Customer
                        </Button>
                    </div>
                    <div className="space-y-4">
                       {customers.map(c => (
                         <div key={c.id} className="flex items-center justify-between p-2 rounded-md border">
                            <div>
                                <p className="font-medium">{c.name}</p>
                                <p className="text-sm text-muted-foreground">{c.email}</p>
                            </div>
                            <Button variant="ghost" size="icon"><Users className="h-4 w-4"/></Button>
                        </div>
                       ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
