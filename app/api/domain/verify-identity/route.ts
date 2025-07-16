import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions) as Session & { user: { id: string; accessToken?: string } };
    if (!session?.user?.id || !session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user or token found' },
        { status: 401 }
      );
    }

    const res = await fetch(`${config.API_URL}/users/domain/verify-identity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();
    
    if (!res.ok) {
      // If the backend returns 401, we should also return 401
      if (res.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: responseText };
      }
      return NextResponse.json(errorData, { status: res.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { error: 'Invalid JSON response' };
    }
    
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in verify-identity route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 