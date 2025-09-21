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

type PurchaseOrder = {
    id: string;
    supplier: string;
    date: string;
    status: 'Pending' | 'Shipped' | 'Delivered';
    total: number;
}

const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', supplier: 'TechGear Inc.', date: '2024-05-28', status: 'Delivered', total: 1250.00 },
    { id: 'PO-002', supplier: 'Fashion Hub', date: '2024-05-27', status: 'Shipped', total: 800.00 },
    { id: 'PO-003', supplier: 'Global Foods', date: '2024-05-26', status: 'Pending', total: 750.00 },
];

const initialSuppliers = [
    { id: 'SUP-01', name: 'TechGear Inc.', contact: 'john@techgear.com' },
    { id: 'SUP-02', name: 'Fashion Hub', contact: 'jane@fashionhub.com' },
];

const statuses: PurchaseOrder['status'][] = ['Pending', 'Shipped', 'Delivered'];

export default function PurchasesPage() {
    const { currentUser } = useUser();
    const [purchaseOrders, setPurchaseOrders] = React.useState(initialPurchaseOrders);
    const [suppliers] = React.useState(initialSuppliers);
    const [selectedPO, setSelectedPO] = React.useState<PurchaseOrder | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const { toast } = useToast();
    
    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

    const handleEditClick = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (poId: string) => {
        setPurchaseOrders(prev => prev.filter(po => po.id !== poId));
        toast({ title: 'Success', description: 'Purchase Order deleted successfully.'});
    };

    const AddPurchaseOrderDialog = () => {
        const [open, setOpen] = React.useState(false);
        const [supplier, setSupplier] = React.useState('');
        const [total, setTotal] = React.useState('');
    
        const handleAdd = () => {
          if(!supplier || !total) {
            toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
            return;
          }
          
          const newPO: PurchaseOrder = {
            id: `PO-00${purchaseOrders.length + 1}`,
            supplier,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            total: parseFloat(total),
          };
    
          setPurchaseOrders(prev => [newPO, ...prev]);
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

      const EditPurchaseOrderDialog = () => {
        const [supplier, setSupplier] = React.useState(selectedPO?.supplier || '');
        const [total, setTotal] = React.useState(selectedPO?.total.toString() || '');
        const [status, setStatus] = React.useState<PurchaseOrder['status']>(selectedPO?.status || 'Pending');

        React.useEffect(() => {
            if (selectedPO) {
                setSupplier(selectedPO.supplier);
                setTotal(selectedPO.total.toString());
                setStatus(selectedPO.status);
            }
        }, [selectedPO]);

        const handleSave = () => {
            if (!selectedPO || !supplier || !total) return;

            setPurchaseOrders(prev => prev.map(po => 
                po.id === selectedPO.id ? { ...po, supplier, total: parseFloat(total), status } : po
            ));
            toast({ title: 'Success', description: 'Purchase Order updated successfully.'});
            setIsEditDialogOpen(false);
            setSelectedPO(null);
        };

        return (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Purchase Order</DialogTitle>
                        <DialogDescription>Update the details of the purchase order.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-supplier" className="text-right">Supplier</Label>
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
                            <Label htmlFor="edit-total" className="text-right">Total</Label>
                            <Input id="edit-total" type="number" value={total} onChange={e => setTotal(e.target.value)} className="col-span-3" />
                        </div>
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
          <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">
            Create and manage purchase orders.
          </p>
        </div>
        {canManage && <AddPurchaseOrderDialog />}
      </div>
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
                          {canManage && <TableHead className="text-right">Actions</TableHead>}
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
                          {canManage && (
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleEditClick(po)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(po.id)}>Delete</DropdownMenuItem>
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
      {canManage && <EditPurchaseOrderDialog />}
    </div>
  );
}
