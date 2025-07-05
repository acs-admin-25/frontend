import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table_name, attribute_name, attribute_value, is_primary_key } = body;

    // Get session_id from request cookies
    const cookies = request.headers.get('cookie');
    const sessionId = cookies?.split(';')
      .find(cookie => cookie.trim().startsWith('session_id='))
      ?.split('=')[1];

    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    
    // Debug session information
    console.log('[db/delete] Session debug:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : []
    });
    
    if (!session?.user?.id) {
      console.error('[db/delete] No user ID in session:', {
        session: session ? 'exists' : 'null',
        user: session?.user ? 'exists' : 'null',
        userId: session?.user?.id || 'undefined'
      });
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Validate required parameters
    if (!table_name || !attribute_name || attribute_value === undefined || is_primary_key === undefined) {
      console.error('[db/delete] Missing required parameters:', { table_name, attribute_name, attribute_value, is_primary_key });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Construct the API URL with parameters
    const apiUrl = `${config.API_URL}/db/delete`;
    
    // Prepare request body with debugging - use key_name/key_value pattern
    const requestBody = {
      table_name,
      key_name: attribute_name,           // Convert attribute_name to key_name
      key_value: attribute_value,         // Convert attribute_value to key_value
      index_name: `${attribute_name}-index`, // Add index_name based on the key
      account_id: session.user.id,
      session_id: sessionId
    };
    
    console.log('[db/delete] Request body being sent to backend:', {
      ...requestBody,
      key_value: typeof attribute_value === 'string' ? attribute_value.substring(0, 10) + '...' : attribute_value
    });
    
    // Make the request to the API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'Cookie': `session_id=${sessionId}` })
      },
      body: JSON.stringify(requestBody),
      credentials: 'include',
    });

    // Get the response text
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[db/delete] Response not ok:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        url: apiUrl,
        requestBody: {
          table_name,
          key_name: attribute_name,
          key_value: typeof attribute_value === 'string' ? attribute_value.substring(0, 10) + '...' : attribute_value,
          index_name: `${attribute_name}-index`,
          account_id: session.user.id,
          session_id: sessionId
        }
      });
      
      // If the backend returns 401, we should also return 401
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'Unauthorized - Session expired or invalid',
            details: responseText,
            status: response.status
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Database delete failed',
          details: responseText,
          status: response.status
        },
        { status: response.status }
      );
    }

    // Parse the response text
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[db/delete] Failed to parse response:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('[db/delete] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error from db/delete route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
