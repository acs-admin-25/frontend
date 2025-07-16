import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const { conversation_id } = await request.json();

    if (!conversation_id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions) as Session & { user: { id: string; accessToken?: string } };
    
    if (!session?.user?.id || !session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user or token found' },
        { status: 401 }
      );
    }

    // First, delete all conversations with the given conversation_id
    const url = `${config.API_URL}/api/db/delete`;
    const conversationsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({
        collection_name: 'Conversations',
        key_name: 'conversation_id',
        key_value: conversation_id,
        account_id: session.user.id
      })
    });

    if (!conversationsResponse.ok) {
      let errorText;
      try {
        const data = await conversationsResponse.json();
        errorText = data?.error?.message || data?.message || JSON.stringify(data);
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      console.error('[delete_thread] Failed to delete conversations:', {
        status: conversationsResponse.status,
        statusText: conversationsResponse.statusText,
        error: errorText,
        conversation_id
      });
      
      // If the backend returns 401, we should also return 401
      if (conversationsResponse.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      throw new Error(`Failed to delete conversations: ${conversationsResponse.statusText}`);
    }

    // Then, delete the thread with the given conversation_id
    const threadResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({
        collection_name: 'Threads',
        key_name: 'conversation_id',
        key_value: conversation_id,
        account_id: session.user.id
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
      console.error('[delete_thread] Failed to delete thread:', {
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
      
      throw new Error(`Failed to delete thread: ${threadResponse.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Thread and associated conversations deleted successfully'
    });

  } catch (error: any) {
    console.error('[delete_thread] Unexpected error:', {
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
