
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
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Combobox } from './ui/combobox';

export function AddCompanyDialog() {
  const [open, setOpen] = React.useState(false);
  const [companyName, setCompanyName] = React.useState('');
  const [companyAddress, setCompanyAddress] = React.useState('');
  const [companyType, setCompanyType] = React.useState<'single' | 'group'>('single');
  const [groupValue, setGroupValue] = React.useState('');
  
  const [generatedId, setGeneratedId] = React.useState('');
  const { addCompany, companyGroups } = useUser();
  const { toast } = useToast();

  const generateCompanyId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedId(result);
  };
  
  const resetForm = () => {
    generateCompanyId();
    setCompanyName('');
    setCompanyAddress('');
    setCompanyType('single');
    setGroupValue('');
  };

  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const handleAddCompany = () => {
    if (!companyName.trim()) {
      toast({ title: 'Error', description: 'Company name cannot be empty.', variant: 'destructive' });
      return;
    }
    if (!companyAddress.trim()) {
      toast({ title: 'Error', description: 'Company address cannot be empty.', variant: 'destructive' });
      return;
    }
    if (companyType === 'group' && !groupValue.trim()) {
        toast({ title: 'Error', description: 'Group name cannot be empty for a grouped company.', variant: 'destructive' });
        return;
    }

    const groupNameToUse = companyType === 'group' ? groupValue : undefined;

    addCompany(
      {
        id: generatedId,
        name: companyName,
        address: companyAddress,
      },
      groupNameToUse
    );

    toast({
      title: 'Company Added',
      description: `"${companyName}" has been added with ID: ${generatedId}.`,
    });

    setOpen(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedId);
    toast({ title: 'Copied!', description: 'Company ID copied to clipboard.' });
  };
  
  const groupOptions = companyGroups.map(g => ({ value: g.name.toLowerCase(), label: g.name }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Create a new company profile and generate a unique ID.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company-name" className="text-right">Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Acme Inc."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company-address" className="text-right">Address</Label>
            <Textarea
              id="company-address"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="col-span-3"
              placeholder="123 Main St, Anytown, USA"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4 pt-2">
            <Label className="text-right pt-2">Type</Label>
            <RadioGroup value={companyType} onValueChange={(v) => setCompanyType(v as 'single' | 'group')} className="col-span-3 space-y-2">
                <div>
                    <RadioGroupItem value="single" id="single" className="peer sr-only" />
                    <Label htmlFor="single" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        Single Company
                    </Label>
                </div>
                 <div>
                    <RadioGroupItem value="group" id="group" className="peer sr-only" />
                    <Label htmlFor="group" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        Grouped Company
                    </Label>
                </div>
            </RadioGroup>
          </div>
          {companyType === 'group' && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-name" className="text-right">Group</Label>
                <div className="col-span-3">
                    <Combobox
                        options={groupOptions}
                        value={groupValue}
                        onValueChange={setGroupValue}
                        placeholder="Select or create group..."
                        searchPlaceholder="Search groups..."
                        notFoundMessage="No group found. You can create a new one."
                    />
                </div>
             </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company-id" className="text-right">Unique ID</Label>
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
