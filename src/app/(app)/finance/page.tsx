'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const initialTransactions = [
    { id: 'TRN-001', date: '2024-05-28', description: 'Sale of 10 Wireless Mouses', amount: 299.90, type: 'Cash In' },
    { id: 'TRN-002', date: '2024-05-27', description: 'Purchase of T-Shirts from Fashion Hub', amount: -200.00, type: 'Cash Out' },
    { id: 'TRN-003', date: '2024-05-26', description: 'Sale of 5 Scented Candles', amount: 90.00, type: 'Cash In' },
    { id: 'TRN-004', date: '2024-05-25', description: 'Office Supplies', amount: -75.50, type: 'Cash Out' },
];

export default function FinancePage() {
  const [transactions, setTransactions] = React.useState(initialTransactions);
  const { toast } = useToast();

  const totalCashIn = transactions.filter(t => t.type === 'Cash In').reduce((acc, t) => acc + t.amount, 0);
  const totalCashOut = transactions.filter(t => t.type === 'Cash Out').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalCashIn + totalCashOut;
  
  const AddTransactionDialog = () => {
    const [open, setOpen] = React.useState(false);
    const [description, setDescription] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [type, setType] = React.useState<'Cash In' | 'Cash Out' | ''>('');

    const handleAddTransaction = () => {
      if(!description || !amount || !type) {
        toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
        return;
      }
      
      const newTransaction = {
        id: `TRN-00${transactions.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        description,
        amount: type === 'Cash In' ? parseFloat(amount) : -parseFloat(amount),
        type,
      };

      setTransactions(prev => [...prev, newTransaction]);
      toast({ title: 'Success', description: 'Transaction added successfully.'});
      setOpen(false);
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>Enter the details of the new transaction.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desc" className="text-right">Description</Label>
                        <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Amount</Label>
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select onValueChange={(v) => setType(v as any)} value={type}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash In">Cash In</SelectItem>
                                <SelectItem value="Cash Out">Cash Out</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddTransaction}>Add Transaction</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">
            Track cash flow and view your profit/loss.
          </p>
        </div>
        <AddTransactionDialog />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cash In</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-500"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalCashIn.toFixed(2)}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cash Out</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-destructive"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">${Math.abs(totalCashOut).toFixed(2)}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit / Loss</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {netProfit >= 0 ? `$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A log of your recent cash in and cash out transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === 'Cash In' ? 'secondary' : 'destructive'}>{t.type}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${t.type === 'Cash In' ? 'text-green-600' : 'text-destructive'}`}>
                        {t.amount > 0 ? `$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
