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

    // Extract session_id from request body
    const requestBody = await request.json();
    const session_id = requestBody.session_id;

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    // Call GCP API Gateway for token refresh
    const response = await fetch(`${config.API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        session_id: session_id,
        user_id: session.user.id,
        ttl_hours: requestBody.ttl_hours
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
        token: data.tokens?.access_token || data.access_token,
        expires_at: data.session?.expires_at || data.expires_at
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during token refresh.' 
    }, { status: 500 });
  }
} 