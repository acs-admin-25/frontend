import { config } from '@/lib/config/local-api-config';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      console.error('Conversation ID is required');
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions) as Session & { user: { id: string; accessToken?: string } };
    if (!session?.user?.id || !session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user or token found' },
        { status: 401 }
      );
    }

    const url = `${config.API_URL}/api/lcp/get-thread-attrs`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({ conversationId }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Unable to read error response' };
      }
      console.error('Error:', errorData);
      console.error('Status:', response.status);
      return NextResponse.json(
        { error: errorData.message},
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in get_thread_attrs route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
