import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from '@/components/providers/AppProvider';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import React from 'react';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'ACS - AI-Powered Real Estate Platform',
    description: 'Transform your real estate business with AI-powered insights and automation.',
    icons: {
        icon: [
            { url: '/new-logo.ico', sizes: 'any', type: 'image/x-icon' },
            { url: '/new-logo-2.png', sizes: '192x192', type: 'image/png' }
        ],
        apple: [
            { url: '/new-logo-2.png', sizes: '180x180', type: 'image/png' }
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full">
            <head />
            <body className="h-full" suppressHydrationWarning>
                <React.StrictMode>
                    <AppProvider>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </AppProvider>
                </React.StrictMode>
            </body>
        </html>
    );
}
