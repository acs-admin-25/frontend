import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const { conversation_id, account_id, is_first_email } = await request.json();

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

    // Validate required parameters
    if (!conversation_id || !account_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Conversation ID and Account ID are required' 
        },
        { status: 400 }
      );
    }

    // Get session_id from request cookies
    const cookies = request.headers.get('cookie');
    const sessionId = cookies?.split(';')
      .find(cookie => cookie.trim().startsWith('session_id='))
      ?.split('=')[1];

    // Make request to the config API endpoint
    const response = await fetch(`${config.API_URL}/lcp/get-llm-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'Cookie': `session_id=${sessionId}` })
      },
      credentials: 'include',
      body: JSON.stringify({
        "conversation_id": conversation_id,
        "account_id": account_id,
        "is_first_email": Boolean(is_first_email),
        "session_id": sessionId
      }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      // If the backend returns 401, we should also return 401
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }
      
      console.error('[get_llm_response] Error from LLM API:', data);
      return NextResponse.json(
        { 
          success: false,
          error: data.message || 'Failed to get LLM response'
        },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON response from LLM API'
        },
        { status: 500 }
      );
    }

    // Check if the response is flagged for review first
    if (data.status === 'flagged_for_review') {
      return NextResponse.json({
        success: true,
        data,
        flagged: true
      });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('[get_llm_response] Unexpected error:', {
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
