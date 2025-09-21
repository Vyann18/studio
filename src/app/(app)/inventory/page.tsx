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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { inventoryItems } from '@/lib/data';
import type { InventoryItem, Category } from '@/lib/types';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  category: z.enum(['Electronics', 'Apparel', 'Groceries', 'Books', 'Home Goods']),
  price: z.coerce.number().min(0, "Price must be non-negative"),
});

const categories: Category[] = ['Electronics', 'Apparel', 'Groceries', 'Books', 'Home Goods'];

export default function InventoryPage() {
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [items, setItems] = React.useState<InventoryItem[]>(inventoryItems);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);
  
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [deletingItemId, setDeletingItemId] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      sku: '',
      quantity: 0,
      price: 0,
    },
  });

  React.useEffect(() => {
    if (editingItem) {
      form.reset(editingItem);
      setIsSheetOpen(true);
    } else {
      form.reset({ name: '', sku: '', quantity: 0, category: 'Electronics', price: 0 });
    }
  }, [editingItem, form]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsSheetOpen(true);
  };
  
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
  };

  const handleDelete = (id: string) => {
    setDeletingItemId(id);
    setIsAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (deletingItemId) {
      setItems(items.filter(item => item.id !== deletingItemId));
      toast({ title: "Item Deleted", description: "The inventory item has been successfully deleted." });
    }
    setIsAlertOpen(false);
    setDeletingItemId(null);
  };

  const onSubmit = (values: z.infer<typeof itemSchema>) => {
    if (editingItem) {
      // Update item
      setItems(items.map(item => item.id === editingItem.id ? { ...item, ...values, lastUpdated: new Date().toISOString() } : item));
      toast({ title: "Item Updated", description: "The inventory item has been successfully updated." });
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        ...values,
        supplier: 'N/A',
        cost: 0,
        lastUpdated: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), quantity: values.quantity }]
      };
      setItems([newItem, ...items]);
      toast({ title: "Item Added", description: "A new item has been added to the inventory." });
    }
    setIsSheetOpen(false);
    setEditingItem(null);
  };

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
      const statusMatch = statusFilter === 'all' ||
                          (statusFilter === 'in-stock' && item.quantity > 10) ||
                          (statusFilter === 'low-stock' && item.quantity > 0 && item.quantity <= 10) ||
                          (statusFilter === 'out-of-stock' && item.quantity === 0);
      return searchMatch && categoryMatch && statusMatch;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const getStatusBadge = (quantity: number) => {
    if (quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (quantity <= 10) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Low Stock</Badge>;
    return <Badge variant="secondary">In Stock</Badge>;
  };
  
  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your products and inventory levels.
          </p>
        </div>
        <div className="flex-shrink-0">
          {isAdminOrManager && (
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <Link href={`/inventory/${item.id}`} className="hover:underline">
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{getStatusBadge(item.quantity)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {isAdminOrManager && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(item)}>Edit</DropdownMenuItem>
                              {currentUser.role === 'admin' && (
                                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">Delete</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</SheetTitle>
            <SheetDescription>
              {editingItem ? 'Update the details of the inventory item.' : 'Fill out the form to add a new item to your inventory.'}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Wireless Mouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. WM-1001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">Save Changes</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
