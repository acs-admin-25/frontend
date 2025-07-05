'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';

const VerifyEmailPage = () => {
    const router = useRouter();
    const { status, data: session } = useSession();

    React.useEffect(() => {
        if (status === 'authenticated') {
            const isNewUser = (session && 'user' in session && (session.user as any)?.isNewUser) || false;
            if (isNewUser) {
                router.push('/new-user');
            } else {
                router.push('/dashboard');
            }
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, session, router]);

    return (
        <PageLayout>
            <LoadingSpinner text="Verifying your session..." size="lg" />
        </PageLayout>
    );
};

export default VerifyEmailPage; 