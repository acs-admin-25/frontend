import React from 'react';
import { PageLayout } from '@/components/common/Layout/PageLayout';
import Navbar from '@/components/common/Navigation/Navbar';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Sticky Navbar at top */}
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>
            
            {/* PageLayout with content and footer */}
            <PageLayout maxWidth="full" showNavbar={false} showFooter={true} customFooter={true} padding="none">
                {children}
            </PageLayout>
        </>
    );
} 