
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
import { PlusCircle, Copy } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';

export function AddCompanyDialog() {
  const [open, setOpen] = React.useState(false);
  const [companyName, setCompanyName] = React.useState('');
  const [generatedId, setGeneratedId] = React.useState('');
  const { addCompany } = useUser();
  const { toast } = useToast();

  const generateCompanyId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedId(result);
  };

  React.useEffect(() => {
    if (open) {
      generateCompanyId();
      setCompanyName('');
    }
  }, [open]);

  const handleAddCompany = () => {
    if (!companyName.trim()) {
      toast({
        title: 'Error',
        description: 'Company name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    addCompany({
      id: generatedId,
      name: companyName,
    });

    toast({
      title: 'Company Added',
      description: `"${companyName}" has been added with ID: ${generatedId}.`,
    });

    setOpen(false);
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedId);
    toast({
      title: 'Copied!',
      description: 'Company ID copied to clipboard.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Create a new company profile and generate a unique ID for them to access the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company-name" className="text-right">
              Company Name
            </Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Acme Inc."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company-id" className="text-right">
              Unique ID
            </Label>
            <div className="col-span-3 flex items-center gap-2">
                <Input id="company-id" value={generatedId} readOnly className="font-mono tracking-widest" />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddCompany}>Add Company</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
