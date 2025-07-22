'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getAuthRedirectPath, validateSession, getAuthType } from '@/lib/auth/auth-utils';
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

                    // Check if backend JWT token is available
                    if (!(session as any).backendToken) {
                        console.warn('No backend JWT token found in session');
                        router.push('/login?error=no_backend_token');
                        return;
                    }

                    console.log('Backend JWT token available, processing authentication');

                    // Determine redirect based on auth type
                    const user = (session.user as any);
                    const authType = user?.authType || getAuthType();
                    const redirectPath = getAuthRedirectPath(authType);
                    router.push(redirectPath);
                } catch (error) {
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
