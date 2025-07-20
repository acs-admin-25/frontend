import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET /api/calendar/outlook/test
 * Test endpoint to verify Outlook Calendar integration setup
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      success: true,
      data: {
        session: session ? {
          user: session.user?.email,
          authenticated: true
        } : {
          authenticated: false
        },
        environment: {
          OUTLOOK_CLIENT_ID: process.env.OUTLOOK_CLIENT_ID ? 'Set' : 'Not set',
          OUTLOOK_CLIENT_SECRET: process.env.OUTLOOK_CLIENT_SECRET ? 'Set' : 'Not set',
          NEXTAUTH_URL_DEV: process.env.NEXTAUTH_URL_DEV || 'http://localhost:3000',
        },
        endpoints: {
          authUrl: '/api/calendar/outlook/auth-url',
          callback: '/api/calendar/outlook/callback',
          connection: '/api/calendar/outlook/connection',
          main: '/api/calendar/outlook',
        }
      },
      message: 'Outlook Calendar integration test endpoint',
      status: 200,
    });

  } catch (error) {
    console.error('[Outlook Calendar Test] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        status: 500 
      },
      { status: 500 }
    );
  }
} 