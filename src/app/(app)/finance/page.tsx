'use client';

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

const transactions = [
    { id: 'TRN-001', date: '2024-05-28', description: 'Sale of 10 Wireless Mouses', amount: 299.90, type: 'Cash In' },
    { id: 'TRN-002', date: '2024-05-27', description: 'Purchase of T-Shirts from Fashion Hub', amount: -200.00, type: 'Cash Out' },
    { id: 'TRN-003', date: '2024-05-26', description: 'Sale of 5 Scented Candles', amount: 90.00, type: 'Cash In' },
    { id: 'TRN-004', date: '2024-05-25', description: 'Office Supplies', amount: -75.50, type: 'Cash Out' },
];

const totalCashIn = transactions.filter(t => t.type === 'Cash In').reduce((acc, t) => acc + t.amount, 0);
const totalCashOut = transactions.filter(t => t.type === 'Cash Out').reduce((acc, t) => acc + t.amount, 0);
const netProfit = totalCashIn + totalCashOut;


export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">
            Track cash flow and view your profit/loss.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
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
