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
import type { Supplier } from '@/lib/types';


export default function SuppliersPage() {
    const { currentUser } = useUser();
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
    const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const { toast } = useToast();

    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    
    const handleEditClick = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (supplierId: string) => {
        deleteSupplier(supplierId);
        toast({ title: 'Success', description: 'Supplier deleted successfully.'});
    };

    const AddSupplierDialog = () => {
        const [open, setOpen] = React.useState(false);
        const [name, setName] = React.useState('');
        const [contact, setContact] = React.useState('');
        const [category, setCategory] = React.useState('');
    
        const handleAdd = () => {
          if(!name || !contact || !category) {
            toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
            return;
          }
          
          addSupplier({ name, contact, category });
    
          toast({ title: 'Success', description: 'Supplier added successfully.'});
          setOpen(false);
          setName('');
          setContact('');
          setCategory('');
        }
    
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
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
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Input id="category" value={category} onChange={e => setCategory(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAdd}>Add Supplier</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    const EditSupplierDialog = () => {
        const [name, setName] = React.useState(selectedSupplier?.name || '');
        const [contact, setContact] = React.useState(selectedSupplier?.contact || '');
        const [category, setCategory] = React.useState(selectedSupplier?.category || '');

        React.useEffect(() => {
            if(selectedSupplier) {
                setName(selectedSupplier.name);
                setContact(selectedSupplier.contact);
                setCategory(selectedSupplier.category);
            }
        }, [selectedSupplier]);

        const handleSave = () => {
            if(!selectedSupplier || !name || !contact || !category) return;

            updateSupplier(selectedSupplier.id, { name, contact, category });
            toast({ title: 'Success', description: 'Supplier updated successfully.'});
            setIsEditDialogOpen(false);
            setSelectedSupplier(null);
        };

        return (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>Update the details of the supplier.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Name</Label>
                            <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-contact" className="text-right">Contact</Label>
                            <Input id="edit-contact" type="email" value={contact} onChange={e => setContact(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-category" className="text-right">Category</Label>
                            <Input id="edit-category" value={category} onChange={e => setCategory(e.target.value)} className="col-span-3" />
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
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground">
                View and manage your supplier list.
            </p>
            </div>
            {canManage && <AddSupplierDialog />}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Supplier List</CardTitle>
                <CardDescription>A list of all suppliers and their contact information.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Category</TableHead>
                            {canManage && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                            <TableCell className="font-medium">{supplier.name}</TableCell>
                            <TableCell>{supplier.contact}</TableCell>
                            <TableCell>{supplier.category}</TableCell>
                            {canManage && (
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleEditClick(supplier)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(supplier.id)}>Delete</DropdownMenuItem>
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
        {canManage && <EditSupplierDialog />}
    </div>
  );
}
