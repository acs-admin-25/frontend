import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const { conversation_id, message_id, account_id } = await request.json();

    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Verify that the account_id matches the session user id
    if (account_id && account_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Account ID mismatch' },
        { status: 401 }
      );
    }

    // Get session_id from request cookies
    const cookies = request.headers.get('cookie');
    const sessionId = cookies?.split(';')
      .find(cookie => cookie.trim().startsWith('session_id='))
      ?.split('=')[1];

    if (!conversation_id || !message_id || !account_id) {
        return NextResponse.json(
        { error: 'Conversation ID, Response ID, and Account ID are required' },
        { status: 400 }
      );
    }

    // Update both Threads and Conversations tables
    const updatePromises = [
      // Update Threads table
      fetch(`${config.API_URL}/db/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'Cookie': `session_id=${sessionId}` })
        },
        body: JSON.stringify({
          table_name: 'Threads',
          index_name: 'conversation_id-index',
          key_name: 'conversation_id',
          key_value: conversation_id,
          update_data: {
            spam: 'false',
            ttl: Math.floor(Date.now() / 1000) + (1000 * 365 * 24 * 60 * 60) // 1000 years from now in Unix timestamp
          },
          account_id: account_id
        }),
        credentials: 'include',
      }),
      // Update Conversations table
      fetch(`${config.API_URL}/db/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'Cookie': `session_id=${sessionId}` })
        },
        body: JSON.stringify({
          table_name: 'Conversations',
          index_name: 'conversation_id-index',
          key_name: 'conversation_id',
          key_value: conversation_id,
          update_data: {
            spam: 'false',
            ttl: Math.floor(Date.now() / 1000) + (1000 * 365 * 24 * 60 * 60) // 1000 years from now in Unix timestamp
          },
          account_id: account_id
        }),
        credentials: 'include',
      })
    ];

    // Wait for both updates to complete
    const [threadsResponse, conversationsResponse] = await Promise.all(updatePromises);

    // Check if either update failed
    if (!threadsResponse.ok || !conversationsResponse.ok) {
      const errors = [];
      if (!threadsResponse.ok) {
        const errorText = await threadsResponse.text();
        console.error('[mark_not_spam] Threads update failed:', {
          status: threadsResponse.status,
          error: errorText
        });
        
        // If the backend returns 401, we should also return 401
        if (threadsResponse.status === 401) {
          return NextResponse.json(
            { error: 'Unauthorized - Session expired or invalid' },
            { status: 401 }
          );
        }
        
        errors.push(`Threads update failed: ${errorText}`);
      }
      if (!conversationsResponse.ok) {
        const errorText = await conversationsResponse.text();
        console.error('[mark_not_spam] Conversations update failed:', {
          status: conversationsResponse.status,
          error: errorText
        });
        
        // If the backend returns 401, we should also return 401
        if (conversationsResponse.status === 401) {
          return NextResponse.json(
            { error: 'Unauthorized - Session expired or invalid' },
            { status: 401 }
          );
        }
        
        errors.push(`Conversations update failed: ${errorText}`);
      }
      console.error('[mark_not_spam] Update spam status failed:', errors);
      throw new Error(`Failed to update spam status: ${errors.join(', ')}`);
    }

    // Generate EV for the thread
    try {
      const evResponse = await fetch(`${config.API_URL}/lcp/generate-ev`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'Cookie': `session_id=${sessionId}` })
        },
        body: JSON.stringify({
          conversation_id,
          response_id: message_id,
          account_id
        }),
        credentials: 'include',
      });   

      if (!evResponse.ok) {
        const errorData = await evResponse.json();
        console.warn('[mark_not_spam] EV generation failed, but spam status was updated successfully:', {
          status: evResponse.status,
          error: errorData
        });
      }
    } catch (evError) {
      console.warn('[mark_not_spam] EV generation failed, but spam status was updated successfully:', evError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email marked as not spam successfully in both Threads and Conversations'
    });

  } catch (error: any) {
    console.error('[mark_not_spam] Unexpected error:', {
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