import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const { conversation_id, response_body } = await request.json();

    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Validate required parameters
    if (!conversation_id || !response_body) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Conversation ID and Response Body are required' 
        },
        { status: 400 }
      );
    }

    // Get session_id from request cookies
    const cookies = request.headers.get('cookie');
    const sessionId = cookies?.split(';')
      .find(cookie => cookie.trim().startsWith('session_id='))
      ?.split('=')[1];

    // one thing we have to do is update the thread to set 'busy' to true 
    const url = `${config.API_URL}/db/update`;
    const updateResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'Cookie': `session_id=${sessionId}` })
      },
      body: JSON.stringify({ 
        table_name: 'Threads',
        key_name: 'conversation_id',
        key_value: conversation_id,
        index_name: 'conversation_id-index',
        update_data: { busy: true },
        account_id: session.user.id
      }),
      credentials: 'include'
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('[send_email] Failed to update thread:', {
        status: updateResponse.status,
        error: errorText
      });
      
      // If the backend returns 401, we should also return 401
      if (updateResponse.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update thread' 
        },
        { status: updateResponse.status }
      );
    }


    // Make request to the config API endpoint
    const response = await fetch(`${config.API_URL}/lcp/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'Cookie': `session_id=${sessionId}` })
      },
      credentials: 'include',
      body: JSON.stringify({
        conversation_id,
        response_body,
        account_id: session.user.id,
        session_id: sessionId
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
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }
      
      console.error('[send_email] Error from Send Email API:', errorData);
      return NextResponse.json(
        { 
          success: false,
          error: errorData.message || 'Failed to send email'
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
          error: 'Invalid JSON response from Send Email API'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error('[send_email] Unexpected error:', {
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
