'use client';

import * as React from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialPurchaseOrders = [
    { id: 'PO-001', supplier: 'TechGear Inc.', date: '2024-05-28', status: 'Delivered', total: 1250.00 },
    { id: 'PO-002', supplier: 'Fashion Hub', date: '2024-05-27', status: 'Shipped', total: 800.00 },
    { id: 'PO-003', supplier: 'Global Foods', date: '2024-05-26', status: 'Pending', total: 750.00 },
];

const initialSuppliers = [
    { id: 'SUP-01', name: 'TechGear Inc.', contact: 'john@techgear.com' },
    { id: 'SUP-02', name: 'Fashion Hub', contact: 'jane@fashionhub.com' },
]

export default function PurchasesPage() {
    const [purchaseOrders, setPurchaseOrders] = React.useState(initialPurchaseOrders);
    const [suppliers, setSuppliers] = React.useState(initialSuppliers);
    const { toast } = useToast();

    const AddPurchaseOrderDialog = () => {
        const [open, setOpen] = React.useState(false);
        const [supplier, setSupplier] = React.useState('');
        const [total, setTotal] = React.useState('');
    
        const handleAdd = () => {
          if(!supplier || !total) {
            toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
            return;
          }
          
          const newPO = {
            id: `PO-00${purchaseOrders.length + 1}`,
            supplier,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            total: parseFloat(total),
          };
    
          setPurchaseOrders(prev => [...prev, newPO]);
          toast({ title: 'Success', description: 'Purchase Order created successfully.'});
          setOpen(false);
        }
    
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Purchase Order
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Purchase Order</DialogTitle>
                        <DialogDescription>Enter the details of the new purchase order.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="supplier" className="text-right">Supplier</Label>
                             <Select onValueChange={setSupplier} value={supplier}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="total" className="text-right">Total</Label>
                            <Input id="total" type="number" value={total} onChange={e => setTotal(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAdd}>Create PO</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
      }

      const AddSupplierDialog = () => {
        const [open, setOpen] = React.useState(false);
        const [name, setName] = React.useState('');
        const [contact, setContact] = React.useState('');
    
        const handleAdd = () => {
          if(!name || !contact) {
            toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
            return;
          }
          
          const newSupplier = {
            id: `SUP-0${suppliers.length + 1}`,
            name,
            contact,
          };
    
          setSuppliers(prev => [...prev, newSupplier]);
          toast({ title: 'Success', description: 'Supplier added successfully.'});
          setOpen(false);
        }
    
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Supplier</DialogTitle>
                        <DialogDescription>Enter the details of the new supplier.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contact" className="text-right">Contact</Label>
                            <Input id="contact" type="email" value={contact} onChange={e => setContact(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAdd}>Add Supplier</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
      }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">
            Create and manage purchase orders and suppliers.
          </p>
        </div>
        <AddPurchaseOrderDialog />
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
                        <AddSupplierDialog />
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
