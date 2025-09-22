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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/user-context';

type Sale = {
    id: string;
    customer: string;
    date: string;
    status: 'Paid' | 'Pending';
    total: number;
}

const initialSales: Sale[] = [
    { id: 'INV-001', customer: 'Alice Smith', date: '2024-05-28', status: 'Paid', total: 299.90 },
    { id: 'INV-002', customer: 'Bob Johnson', date: '2024-05-27', status: 'Pending', total: 199.90 },
    { id: 'INV-003', customer: 'Charlie Brown', date: '2024-05-26', status: 'Paid', total: 90.00 },
];

const initialCustomers = [
    { id: 'CUS-01', name: 'Alice Smith', email: 'alice@example.com' },
    { id: 'CUS-02', name: 'Bob Johnson', email: 'bob@example.com' },
];

const statuses: Sale['status'][] = ['Paid', 'Pending'];

export default function SalesPage() {
    const { currentUser } = useUser();
    const [sales, setSales] = React.useState(initialSales);
    const [customers] = React.useState(initialCustomers);
    const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const { toast } = useToast();

    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

    const handleEditClick = (sale: Sale) => {
        setSelectedSale(sale);
        setIsEditDialogOpen(true);
    };

    const AddSaleDialog = () => {
        const [open, setOpen] = React.useState(false);
        const [customer, setCustomer] = React.useState('');
        const [total, setTotal] = React.useState('');
    
        const handleAdd = () => {
          if(!customer || !total) {
            toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
            return;
          }
          
          const newSale = {
            id: `INV-00${sales.length + 1}`,
            customer,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending' as 'Pending',
            total: parseFloat(total),
          };
    
          setSales(prev => [newSale, ...prev]);
          toast({ title: 'Success', description: 'Sale added successfully.'});
          setOpen(false);
        }
    
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                     <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Sale
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Sale</DialogTitle>
                        <DialogDescription>Enter the details of the new sale.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer" className="text-right">Customer</Label>
                            <Select onValueChange={setCustomer} value={customer}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="total" className="text-right">Total</Label>
                            <Input id="total" type="number" value={total} onChange={e => setTotal(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAdd}>Create Sale</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    const EditSaleDialog = () => {
        const [status, setStatus] = React.useState<Sale['status']>(selectedSale?.status || 'Pending');

        React.useEffect(() => {
            if(selectedSale) {
                setStatus(selectedSale.status);
            }
        }, [selectedSale]);

        const handleSave = () => {
            if(!selectedSale) return;

            setSales(prev => prev.map(s => 
                s.id === selectedSale.id ? { ...s, status } : s
            ));
            toast({ title: 'Success', description: 'Sale status updated successfully.'});
            setIsEditDialogOpen(false);
            setSelectedSale(null);
        };

        return (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Sale Status</DialogTitle>
                        <DialogDescription>Update the payment status for invoice {selectedSale?.id}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-status" className="text-right">Status</Label>
                            <Select onValueChange={(v) => setStatus(v as any)} value={status}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            Create new sales and view sales history.
          </p>
        </div>
        <AddSaleDialog />
      </div>
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
                          {canManage && <TableHead className="text-right">Actions</TableHead>}
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
                          {canManage && (
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleEditClick(sale)}>Edit Status</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                          )}
                      </TableRow>
                      ))}
                  </TableBody>
                  </Table>
              </div>
          </CardContent>
      </Card>
      {canManage && <EditSaleDialog />}
    </div>
  );
}
