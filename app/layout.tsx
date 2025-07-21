import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from '@/components/providers/AppProvider';
import { ErrorBoundary } from '@/components/common/Feedback/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
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
                    <Toaster 
                        position="top-center"
                        toastOptions={{
                            duration: 5000,
                            style: {
                                background: '#ffffff',
                                color: '#000000',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                zIndex: 9999,
                            },
                            error: {
                                style: {
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                },
                            },
                        }}
                    />
                </React.StrictMode>
            </body>
        </html>
    );
}
