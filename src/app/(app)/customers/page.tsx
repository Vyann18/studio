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
import { useUser } from '@/contexts/user-context';
import { useData } from '@/contexts/data-context';
import type { Customer } from '@/lib/types';


export default function CustomersPage() {
    const { currentUser } = useUser();
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const { toast } = useToast();

    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

    const handleEditClick = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (customerId: string) => {
        deleteCustomer(customerId);
        toast({ title: 'Success', description: 'Customer deleted successfully.'});
    };

    const AddCustomerDialog = () => {
        const [open, setOpen] = React.useState(false);
        const [name, setName] = React.useState('');
        const [email, setEmail] = React.useState('');
    
        const handleAdd = () => {
          if(!name || !email) {
            toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
            return;
          }
          
          addCustomer({ name, email });
          toast({ title: 'Success', description: 'Customer added successfully.'});
          setOpen(false);
          setName('');
          setEmail('');
        }
    
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>Enter the details of the new customer.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAdd}>Add Customer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
      }

      const EditCustomerDialog = () => {
        const [name, setName] = React.useState(selectedCustomer?.name || '');
        const [email, setEmail] = React.useState(selectedCustomer?.email || '');

        React.useEffect(() => {
            if(selectedCustomer) {
                setName(selectedCustomer.name);
                setEmail(selectedCustomer.email);
            }
        }, [selectedCustomer]);

        const handleSave = () => {
            if(!selectedCustomer || !name || !email) return;

            updateCustomer(selectedCustomer.id, { name, email });
            toast({ title: 'Success', description: 'Customer updated successfully.'});
            setIsEditDialogOpen(false);
            setSelectedCustomer(null);
        };

        return (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>Update the details of the customer.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Name</Label>
                            <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">Email</Label>
                            <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
      }


  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customer list.
          </p>
        </div>
        {canManage && <AddCustomerDialog />}
      </div>
        <Card>
            <CardHeader>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>A list of all customers and their contact information.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Total Spent</TableHead>
                            {canManage && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                            {canManage && (
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleEditClick(customer)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(customer.id)}>Delete</DropdownMenuItem>
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
        {canManage && <EditCustomerDialog />}
    </div>
  );
}
