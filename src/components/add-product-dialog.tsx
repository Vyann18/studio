'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
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
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInventory } from '@/contexts/inventory-context';
import { categories, suppliers } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Category } from '@/lib/types';


export function AddProductDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [category, setCategory] = React.useState<Category | ''>('');
  const [supplier, setSupplier] = React.useState('');
  const [cost, setCost] = React.useState('');
  const [price, setPrice] = React.useState('');
  const { addInventoryItem } = useInventory();
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setSku('');
    setQuantity('');
    setCategory('');
    setSupplier('');
    setCost('');
    setPrice('');
  }

  React.useEffect(() => {
    if(open) {
      resetForm();
    }
  }, [open]);


  const handleAddItem = () => {
    // Basic validation
    if (!name || !sku || !quantity || !category || !supplier || !cost || !price) {
        toast({ title: 'Error', description: 'Please fill out all fields.', variant: 'destructive'});
        return;
    }

    const newItem = {
      id: `item-${Date.now()}`,
      name,
      sku,
      quantity: parseInt(quantity, 10),
      category,
      supplier,
      cost: parseFloat(cost),
      price: parseFloat(price),
      lastUpdated: new Date().toISOString(),
      history: [{ date: new Date().toISOString(), quantity: parseInt(quantity, 10) }]
    };

    addInventoryItem(newItem);

    toast({
      title: 'Product Added',
      description: `"${name}" has been added to the inventory.`,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-name" className="text-right">Name</Label>
            <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-sku" className="text-right">SKU</Label>
            <Input id="product-sku" value={sku} onChange={(e) => setSku(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-quantity" className="text-right">Quantity</Label>
            <Input id="product-quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-category" className="text-right">Category</Label>
            <Select onValueChange={(value) => setCategory(value as Category)} value={category}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-supplier" className="text-right">Supplier</Label>
            <Select onValueChange={setSupplier} value={supplier}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                    {suppliers.map(sup => <SelectItem key={sup} value={sup}>{sup}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-cost" className="text-right">Cost Price</Label>
            <Input id="product-cost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-price" className="text-right">Selling Price</Label>
            <Input id="product-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddItem}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
