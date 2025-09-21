'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

export function CompanyIdGate() {
  const [companyId, setCompanyId] = useState('');
  const { verifyCompanyId, currentUser, logout } = useUser();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCompanyId(companyId.toUpperCase())) {
      toast({
        title: 'Company Verified',
        description: `Welcome to your company's dashboard, ${currentUser?.name}!`,
      });
    } else {
      toast({
        title: 'Verification Failed',
        description: 'The Company ID is incorrect or does not match your user profile.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border bg-background">
                <Package className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Enter Company ID</CardTitle>
            <CardDescription>
              Please enter your unique 6-character company ID to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company-id">Company ID</Label>
              <Input
                id="company-id"
                type="text"
                placeholder="Insert your Company ID here"
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                maxLength={6}
                className="text-center tracking-[0.3em] font-mono text-lg"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Access Dashboard
            </Button>
            <Button variant="link" size="sm" onClick={logout}>
                Not your account? Logout
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
