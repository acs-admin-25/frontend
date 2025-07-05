import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

interface Message {
  receiver: string;
  sender: string;
  subject: string;
  associated_account: string;
  conversation_id: string;
  timestamp: string;
  response_id: string;
  is_first_email: string;
  s3_location: string;
  in_reply_to: string;
  body: string;
  type: string;
  ev_score?: string;
}

interface MessagesResponse {
  items: Message[];
  count: number;
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log('[get_all_threads] Request received:', {
      body: requestBody,
      hasUserId: 'userId' in requestBody,
      userId: requestBody.userId
    });

    const { userId } = requestBody;

    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    console.log('[get_all_threads] Session info:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Use session user ID if userId is not provided or doesn't match
    const actualUserId = userId || session.user.id;
    if (userId && userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID mismatch' },
        { status: 401 }
      );
    }

    // Get session_id from request cookies
    const cookies = request.headers.get('cookie');
    const sessionId = cookies?.split(';')
      .find(cookie => cookie.trim().startsWith('session_id='))
      ?.split('=')[1];

    console.log('[get_all_threads] Configuration:', {
      API_URL: config.API_URL,
      hasSessionId: !!sessionId,
      actualUserId
    });

    // If API_URL is not configured, return mock data for testing
    if (!config.API_URL) {
      console.warn('[get_all_threads] API_URL not configured, returning mock data');
      return NextResponse.json({
        success: true,
        data: [
          {
            thread: {
              conversation_id: 'mock-conversation-1',
              associated_account: actualUserId,
              name: 'Mock Conversation 1',
              flag_for_review: false,
              flag_review_override: false,
              read: true,
              busy: false,
              spam: false,
              lcp_enabled: true,
              lcp_flag_threshold: 70,
              ai_summary: 'This is a mock conversation for testing',
              source: 'mock',
              source_name: 'Mock Source',
              budget_range: '$500k-$750k',
              preferred_property_types: 'Single Family',
              timeline: '3-6 months',
              last_updated: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              flag: false,
              completed: false
            },
            messages: [
              {
                conversation_id: 'mock-conversation-1',
                sender: 'user@example.com',
                receiver: 'agent@example.com',
                subject: 'Mock Message',
                body: 'This is a mock message for testing purposes.',
                timestamp: new Date().toISOString(),
                type: 'email'
              }
            ]
          }
        ]
      });
    }

    // Get all threads for the user
    const threadsResponse = await fetch(`${config.API_URL}/db/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session_id=${sessionId}`
      },
      body: JSON.stringify({
        table_name: 'Threads',
        index_name: 'associated_account-index',
        key_name: 'associated_account',
        key_value: actualUserId,
        account_id: actualUserId,
        session_id: sessionId
      })
    });

    console.log('[get_all_threads] Threads request details:', {
      url: `${config.API_URL}/db/select`,
      body: {
        table_name: 'Threads',
        index_name: 'associated_account-index',
        key_name: 'associated_account',
        key_value: actualUserId,
        account_id: actualUserId,
        session_id: sessionId
      }
    });

    if (!threadsResponse.ok) {
      let errorText: string;
      try {
        errorText = await threadsResponse.text();
      } catch (textError) {
        errorText = 'Unable to read error response';
      }
      
      console.error('[get_all_threads] Failed to fetch threads:', {
        status: threadsResponse.status,
        statusText: threadsResponse.statusText,
        error: errorText,
        requestUrl: `${config.API_URL}/db/select`,
        requestBody: {
          table_name: 'Threads',
          index_name: 'associated_account-index',
          key_name: 'associated_account',
          key_value: actualUserId,
          account_id: actualUserId,
          session_id: sessionId
        }
      });
      
      // If the backend returns 401, we should also return 401
      if (threadsResponse.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch threads', details: errorText },
        { status: 500 }
      );
    }

    let threads: any[];
    try {
      const threadsData = await threadsResponse.json();
      if (!Array.isArray(threadsData)) {
        console.error('[get_all_threads] Invalid response format from threads fetch:', threadsData);
        return NextResponse.json(
          { error: 'Invalid response format from threads fetch' },
          { status: 500 }
        );
      }
      threads = threadsData;
      
      console.log('[get_all_threads] Raw threads data from database:', {
        threadsCount: threads.length,
        sampleThread: threads[0],
        allThreads: threads.map(thread => ({
          conversation_id: thread.conversation_id,
          lead_name: thread.lead_name,
          client_email: thread.client_email,
          name: thread.name,
          email: thread.email,
          phone: thread.phone,
          location: thread.location,
          source_name: thread.source_name,
          createdAt: thread.createdAt,
          created_at: thread.created_at,
          updatedAt: thread.updatedAt,
          updated_at: thread.updated_at,
          lastMessageAt: thread.lastMessageAt,
          last_updated: thread.last_updated,
          allKeys: Object.keys(thread)
        }))
      });
    } catch (jsonError) {
      console.error('[get_all_threads] JSON parsing error for threads response:', {
        error: jsonError instanceof Error ? jsonError.message : String(jsonError),
        status: threadsResponse.status,
        statusText: threadsResponse.statusText
      });
      return NextResponse.json(
        { error: 'Invalid JSON response from threads fetch' },
        { status: 500 }
      );
    }

    // Get all conversation IDs from threads
    const conversationIds = threads.map(thread => thread.conversation_id);

    // Only fetch messages if there are conversation IDs
    if (conversationIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: threads.map(thread => ({
          thread,
          messages: []
        }))
      });
    }

    // Get all messages for these conversations
    const messagesResponse = await fetch(`${config.API_URL}/db/batch-select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session_id=${sessionId}`
      },
      body: JSON.stringify({
        table_name: 'Conversations',
        index_name: 'conversation_id-index',
        key_name: 'conversation_id',
        key_values: conversationIds,
        account_id: actualUserId,
        session_id: sessionId
      })
    });

    if (!messagesResponse.ok) {
      let errorText: string;
      try {
        errorText = await messagesResponse.text();
      } catch (textError) {
        errorText = 'Unable to read error response';
      }
      
      console.error('[get_all_threads] Failed to fetch messages:', {
        status: messagesResponse.status,
        statusText: messagesResponse.statusText,
        error: errorText,
        requestUrl: `${config.API_URL}/db/batch-select`,
        requestBody: {
          table_name: 'Conversations',
          index_name: 'conversation_id-index',
          key_name: 'conversation_id',
          key_values: conversationIds,
          account_id: actualUserId,
          session_id: sessionId
        }
      });
      
      // If the backend returns 401, we should also return 401
      if (messagesResponse.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch messages', details: errorText },
        { status: 500 }
      );
    }

    let messages: any;
    try {
      messages = await messagesResponse.json();
    } catch (jsonError) {
      console.error('[get_all_threads] JSON parsing error for messages response:', {
        error: jsonError instanceof Error ? jsonError.message : String(jsonError),
        status: messagesResponse.status,
        statusText: messagesResponse.statusText
      });
      return NextResponse.json(
        { error: 'Invalid JSON response from messages fetch' },
        { status: 500 }
      );
    }

    // Handle the case where messages response has { items: [...], count: ... } structure
    let messagesArray: any[];
    if (messages && typeof messages === 'object' && 'items' in messages) {
      messagesArray = messages.items;
    } else if (Array.isArray(messages)) {
      messagesArray = messages;
    } else {
      console.error('[get_all_threads] Invalid response format from messages fetch:', messages);
      return NextResponse.json(
        { error: 'Invalid response format from messages fetch' },
        { status: 500 }
      );
    }

    // Group messages by conversation_id
    const messagesByConversation = messagesArray.reduce((acc, message) => {
      const conversationId = message.conversation_id;
      if (!acc[conversationId]) {
        acc[conversationId] = [];
      }
      acc[conversationId].push(message);
      return acc;
    }, {} as Record<string, any[]>);

    // Combine threads with their messages
    const threadsWithMessages = threads.map(thread => ({
      thread,
      messages: messagesByConversation[thread.conversation_id] || []
    }));

    console.log('[get_all_threads] Final response data structure:', {
      totalConversations: threadsWithMessages.length,
      sampleConversation: threadsWithMessages[0] ? {
        thread: {
          conversation_id: threadsWithMessages[0].thread.conversation_id,
          source_name: threadsWithMessages[0].thread.source_name,
          source: threadsWithMessages[0].thread.source,
          createdAt: threadsWithMessages[0].thread.createdAt,
          created_at: threadsWithMessages[0].thread.created_at,
          updatedAt: threadsWithMessages[0].thread.updatedAt,
          updated_at: threadsWithMessages[0].thread.updated_at,
          lastMessageAt: threadsWithMessages[0].thread.lastMessageAt,
          last_updated: threadsWithMessages[0].thread.last_updated,
          allKeys: Object.keys(threadsWithMessages[0].thread)
        },
        messagesCount: threadsWithMessages[0].messages.length,
        sampleMessage: threadsWithMessages[0].messages[0] ? {
          timestamp: threadsWithMessages[0].messages[0].timestamp,
          allKeys: Object.keys(threadsWithMessages[0].messages[0])
        } : null
      } : null
    });

    return NextResponse.json({
      success: true,
      data: threadsWithMessages
    });

  } catch (error) {
    console.error('[get_all_threads] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error from get_all_threads route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
