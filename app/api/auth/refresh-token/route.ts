import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import type { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    // Get current session to verify user
    const session = await getServerSession(authOptions) as Session & { 
      user: { 
        id: string; 
        email: string; 
        provider?: string; 
        accessToken?: string 
      } 
    };
    
    if (!session) {
      return NextResponse.json({ error: 'No active session found.' }, { status: 401 });
    }

    // Call GCP API Gateway for token refresh
    const response = await fetch(`${config.API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken || ''}`,
      },
      body: JSON.stringify({ 
        userId: session.user.id,
        provider: session.user.provider || 'form'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: data.error?.message || 'Token refresh failed.',
        details: data.error?.details
      }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true,
      data: {
        token: data.data?.token || data.token,
        expires_at: data.data?.expires_at || data.expires_at
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during token refresh.' 
    }, { status: 500 });
  }
} 