/**
 * File: app/page.tsx
 * Purpose: Serves as the root layout component that integrates Navbar, HomePage content, and Footer.
 * Author: Alejo Cagliolo
 * Date: 5/25/25
 * Version: 1.0.0
 */

import React from 'react';
import HomePage from './(marketing)/landing/page';
import Navbar from '@/components/common/Navigation/Navbar';
import Footer from './Footer';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';

/**
 * Home Component
 * Root layout component that manages the application's main structure
 * 
 * Features:
 * - Server-side session management
 * - Layout composition (Navbar, HomePage, Footer)
 * - Server-side rendering for better performance
 * - Automatic redirection to dashboard for authenticated users
 * 
 * @returns {JSX.Element} Complete application layout
 */
export default async function Home() {
    // Get session data server-side
    const session = await getServerSession(authOptions);

    // Handle redirection for authenticated users
    if (session) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen">
            <main>
                <Navbar/>
                <HomePage/>
                <Footer/>
            </main>
        </div>
    );
}

/**
 * Change Log:
 * 5/25/25 - Initial version
 * - Created root layout component
 * - Implemented server-side session management
 * - Added component composition
 * - Set up server-side rendering
 * - Added automatic redirection for authenticated users
 */





