import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const { conversation_id } = await request.json();

    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions) as Session & { user: { id: string; accessToken?: string } };
    if (!session?.user?.id || !session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user or token found' },
        { status: 401 }
      );
    }

    if (!conversation_id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // First, get the specific thread
    const threadResponse = await fetch(`${config.API_URL}/api/db/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({
        collection_name: 'Threads',
        key_name: 'conversation_id',
        key_value: conversation_id,
        account_id: session.user.id,
        filters: {},
        limit: 1,
        order_by: 'created_at',
        order_direction: 'desc'
      })
    });

    if (!threadResponse.ok) {
      let errorText;
      try {
        const data = await threadResponse.json();
        errorText = data?.error?.message || data?.message || JSON.stringify(data);
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      console.error('[getThreadById] Failed to fetch thread:', {
        status: threadResponse.status,
        statusText: threadResponse.statusText,
        error: errorText,
        conversation_id
      });
      
      // If the backend returns 401, we should also return 401
      if (threadResponse.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      throw new Error(`Failed to fetch thread: ${threadResponse.statusText}`);
    }

    const thread = await threadResponse.json();

    if (!thread || thread.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Fetch the associated messages for this thread
    const messagesResponse = await fetch(`${config.API_URL}/api/db/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({
        collection_name: 'Conversations',
        key_name: 'conversation_id',
        key_value: conversation_id,
        account_id: session.user.id,
        filters: {},
        limit: 1000,
        order_by: 'timestamp',
        order_direction: 'desc'
      })
    });

    if (!messagesResponse.ok) {
      let errorText;
      try {
        const data = await messagesResponse.json();
        errorText = data?.error?.message || data?.message || JSON.stringify(data);
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      console.error('[getThreadById] Failed to fetch messages:', {
        status: messagesResponse.status,
        statusText: messagesResponse.statusText,
        error: errorText,
        conversation_id
      });
      
      // If the backend returns 401, we should also return 401
      if (messagesResponse.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      throw new Error(`Failed to fetch messages for thread ${conversation_id}`);
    }

    const messages = await messagesResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        thread: thread[0], // Since we're getting a specific thread, we take the first result
        messages,
      },
    });

  } catch (error: any) {
    console.error('[getThreadById] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
