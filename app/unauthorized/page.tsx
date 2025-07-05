'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ShieldX, LogOut, AlertTriangle } from 'lucide-react';
import { clearAuthData } from '@/lib/auth/auth-utils';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      clearAuthData();
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      });
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/');
    }
  };

  return (
    <PageLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-0">
                <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <ShieldX className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold">
                    Session Verification Failed
                </CardTitle>
                <div className="text-sm text-muted-foreground space-y-2">
                    <div>
                        Your session could not be verified. This may be due to:
                    </div>
                    <ul className="text-sm text-left space-y-1 mt-2">
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>Missing or invalid session cookie</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>Browser privacy settings blocking cookies</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>Session expiration or security violation</span>
                        </li>
                    </ul>
                </div>
                </CardHeader>
                <CardContent className="space-y-4">
                <Button 
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Clear Session & Log Out
                </Button>
                <p className="text-xs text-gray-500 text-center">
                    This will clear all session data and redirect you to the login page.
                </p>
                </CardContent>
            </Card>
        </div>
    </PageLayout>
  );
} 