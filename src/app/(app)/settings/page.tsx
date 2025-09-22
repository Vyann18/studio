
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user-context';
import type { User, Role } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Building, PlusCircle, KeyRound, Trash2, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import { AddCompanyDialog } from '@/components/add-company-dialog';


const roles: Role[] = ['admin', 'manager', 'head', 'employee'];

export default function SettingsPage() {
  const { currentUser, users, setUsers, updateUserPassword, removeUser, companies, companyGroups } = useUser();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleRoleChange = (userId: string, newRole: Role) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast({
        title: 'Role Updated',
        description: `User role has been successfully changed to ${newRole}.`,
    });
  };

  const handleRemoveUser = (userId: string) => {
    removeUser(userId);
    toast({
      title: 'User Removed',
      description: 'The user has been successfully removed.',
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    if (currentUser) {
        const success = updateUserPassword(currentUser.id, currentPassword, newPassword);
        if (success) {
            toast({
                title: 'Password Updated',
                description: 'Your password has been changed successfully.',
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            toast({
                title: 'Error',
                description: 'Incorrect current password.',
                variant: 'destructive',
            });
        }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Company ID copied to clipboard.',
    });
  };
  
  if (!currentUser) {
    return null;
  }

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'N/A';
    return companyGroups.find(g => g.id === groupId)?.name || 'Unknown Group';
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage users and company information.
        </p>
      </div>

      {currentUser.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield /> User Management</CardTitle>
            <CardDescription>
              Add new users and assign their roles in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="flex justify-end mb-4">
              <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add User
              </Button>
          </div>
          <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="w-[180px]">Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{companies.find(c => c.id === user.companyId)?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={user.role} 
                          onValueChange={(newRole: Role) => handleRoleChange(user.id, newRole)}
                          disabled={user.id === currentUser.id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(role => (
                              <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.id !== currentUser.id && (
                           <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 This action cannot be undone. This will permanently delete the user account.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-destructive hover:bg-destructive/90">
                                 Delete
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound /> Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                  <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                  <Button type="submit">Update Password</Button>
              </form>
          </CardContent>
      </Card>


      {currentUser.role === 'admin' && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building /> Company Management</CardTitle>
                <CardDescription>Manage company profiles and unique IDs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-end">
                    <AddCompanyDialog />
                </div>
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company Name</TableHead>
                                <TableHead>Unique ID</TableHead>
                                <TableHead>Company Group</TableHead>
                                <TableHead>Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">{company.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-mono">
                                            <span>{company.id}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyToClipboard(company.id)}>
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getGroupName(company.groupId)}</TableCell>
                                    <TableCell>{company.address}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
