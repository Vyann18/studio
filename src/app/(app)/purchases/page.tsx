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
import { PlusCircle, Truck } from 'lucide-react';

const purchaseOrders = [
    { id: 'PO-001', supplier: 'TechGear Inc.', date: '2024-05-28', status: 'Delivered', total: 1250.00 },
    { id: 'PO-002', supplier: 'Fashion Hub', date: '2024-05-27', status: 'Shipped', total: 800.00 },
    { id: 'PO-003', supplier: 'Global Foods', date: '2024-05-26', status: 'Pending', total: 750.00 },
];

const suppliers = [
    { id: 'SUP-01', name: 'TechGear Inc.', contact: 'john@techgear.com' },
    { id: 'SUP-02', name: 'Fashion Hub', contact: 'jane@fashionhub.com' },
]

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">
            Create and manage purchase orders and suppliers.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                    <CardDescription>Track all your purchase orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchaseOrders.map((po) => (
                            <TableRow key={po.id}>
                                <TableCell className="font-medium">{po.id}</TableCell>
                                <TableCell>{po.supplier}</TableCell>
                                <TableCell>{po.date}</TableCell>
                                <TableCell>
                                <Badge variant={po.status === 'Pending' ? 'destructive' : (po.status === 'Shipped' ? 'outline' : 'secondary') }>{po.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">${po.total.toFixed(2)}</TableCell>
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
                    <CardTitle>Suppliers</CardTitle>
                    <CardDescription>Manage your list of suppliers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button variant="outline" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Supplier
                        </Button>
                    </div>
                    <div className="space-y-4">
                       {suppliers.map(s => (
                         <div key={s.id} className="flex items-center justify-between p-2 rounded-md border">
                            <div>
                                <p className="font-medium">{s.name}</p>
                                <p className="text-sm text-muted-foreground">{s.contact}</p>
                            </div>
                            <Button variant="ghost" size="icon"><Truck className="h-4 w-4"/></Button>
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
