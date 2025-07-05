'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { handleSessionCookie, getAuthRedirectPath, validateSession } from '@/lib/auth/auth-utils';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';

export default function ProcessGoogle() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        const processAuth = async () => {
            if (status === 'authenticated') {
                try {
                    
                    // Validate session
                    if (!validateSession(session)) {
                        throw new Error('Invalid session data');
                    }

                    // Handle session cookie - extract session_id from NextAuth session
                    if ((session as any).sessionId) {
                        const secure = process.env.NODE_ENV === 'production' ? '; secure' : '';
                        const cookieString = `session_id=${(session as any).sessionId}; path=/; samesite=lax${secure}`;
                        document.cookie = cookieString;
                        console.log('Set session_id cookie from NextAuth session:', (session as any).sessionId);
                    } else {
                        console.warn('No session_id found in NextAuth session');
                    }

                    // Determine redirect based on auth type
                    const user = (session.user as any);
                    if (user && user.authType) {
                        const redirectPath = getAuthRedirectPath(user.authType);
                        router.push(redirectPath);
                    }
                    else {
                        router.push('/login?error=auth_processing_failed');
                    }
                } catch (error) {
                    // Keep error logging for debugging purposes
                    console.error('Error processing authentication:', error);
                    router.push('/login?error=auth_processing_failed');
                }
            } else if (status === 'unauthenticated') {
                router.push('/login?error=not_authenticated');
            }
        };

        processAuth();
    }, [status, session, router]);

    return (
        <PageLayout>
            <LoadingSpinner text="Processing your login..." size="lg" />
        </PageLayout>
    );
}
