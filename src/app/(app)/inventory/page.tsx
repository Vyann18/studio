'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Search } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { inventoryItems } from '@/lib/data';
import type { InventoryItem } from '@/lib/types';


export default function InventoryPage() {
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [products, setProducts] = React.useState<InventoryItem[]>(inventoryItems);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  if (!currentUser) return null;

  const canManageStock = currentUser.role === 'admin' || currentUser.role === 'manager';

  const handleStockAdjustment = (productId: string, adjustment: number) => {
    setProducts(products.map(p => p.id === productId ? {...p, quantity: Math.max(0, p.quantity + adjustment)} : p));
    toast({ title: "Stock Adjusted", description: `Stock for product ID ${productId} has been updated.`});
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getStatusBadge = (quantity: number) => {
    if (quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (quantity <= 10) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Low Stock</Badge>;
    return <Badge variant="secondary">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            View and manage your product catalog and stock levels.
          </p>
        </div>
        <div className="flex-shrink-0">
          {canManageStock && (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>
                <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-full md:w-1/3"
                    />
                </div>
            </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Stock Quantity</TableHead>
                  {canManageStock && <TableHead className="text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <Link href={`/inventory/${product.id}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(product.quantity)}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      {canManageStock && (
                        <TableCell className="text-center space-x-2">
                           <Button size="sm" variant="outline" onClick={() => handleStockAdjustment(product.id, 1)}>+</Button>
                           <Button size="sm" variant="outline" onClick={() => handleStockAdjustment(product.id, -1)}>-</Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={canManageStock ? 5 : 4} className="h-24 text-center">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
