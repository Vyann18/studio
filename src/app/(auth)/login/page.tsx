'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
    const router = useRouter();
    const { login, signInWithGoogle, currentUser } = useUser();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            router.push('/dashboard');
        }
    }, [currentUser, router]);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        const loggedInUser = await login(email.trim(), password);
        setIsLoading(false);

        if (loggedInUser) {
            toast({
                title: "Login Successful",
                description: `Welcome back, ${loggedInUser.name}!`,
            });
        } else {
            toast({
                title: "Login Failed",
                description: "Invalid email or password. Please try again.",
                variant: "destructive",
            });
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        const user = await signInWithGoogle();
        setIsGoogleLoading(false);
        if (user) {
            toast({
                title: "Login Successful",
                description: `Welcome, ${user.name}!`,
            });
        } else {
            toast({
                title: "Google Sign-In Failed",
                description: "Could not sign in with Google. Please try again.",
                variant: "destructive",
            });
        }
    }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
            <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                </Link>
                </div>
                <div className="relative">
                    <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
            </Button>
            </div>
        </form>
        <div className="relative my-4">
            <Separator />
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12.5C5.03 8.75 8.36 5.73 12.19 5.73C14.03 5.73 15.6 6.33 16.85 7.45L19.09 5.21C17.21 3.49 14.86 2.5 12.19 2.5C6.92 2.5 2.5 6.91 2.5 12.5C2.5 18.09 6.92 22.5 12.19 22.5C17.6 22.5 21.5 18.33 21.5 12.75C21.5 12.17 21.45 11.63 21.35 11.1Z" />
                </svg>
            )}
            Google
        </Button>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
