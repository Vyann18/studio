'use client';

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useInventory } from '@/contexts/inventory-context';

const chartConfig = {
  quantity: {
    label: 'Quantity',
    color: 'hsl(var(--primary))',
  },
};

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const { inventory } = useInventory();
  const item = inventory.find((i) => i.id === params.id);

  if (!item) {
    notFound();
  }

  const getStatusBadge = (quantity: number) => {
    if (quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (quantity <= 10) return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Low Stock</Badge>;
    return <Badge variant="secondary">In Stock</Badge>;
  };
  
  const chartData = item.history.map(h => ({
      date: format(new Date(h.date), 'MMM d'),
      quantity: h.quantity,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Inventory</span>
          </Link>
        </Button>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
            <p className="text-muted-foreground">Detailed view of inventory item.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <div className="text-sm text-muted-foreground">SKU</div>
                            <div className="font-medium">{item.sku}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Category</div>
                            <div className="font-medium">{item.category}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Supplier</div>
                            <div className="font-medium">{item.supplier}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Last Updated</div>
                            <div className="font-medium">{format(new Date(item.lastUpdated), 'PPP')}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Stock History</CardTitle>
                    <CardDescription>Changes in stock levels over time.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillQuantity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-quantity)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-quantity)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="quantity"
                            type="natural"
                            fill="url(#fillQuantity)"
                            stroke="var(--color-quantity)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Stock & Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Current Stock</span>
                        <span className="text-2xl font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        {getStatusBadge(item.quantity)}
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Cost Price</span>
                        <span className="font-medium">${item.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Selling Price</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Margin</span>
                        <span className="font-medium text-green-600">
                          {(((item.price - item.cost) / item.price) * 100).toFixed(1)}%
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
