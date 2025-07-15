import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table_name, index_name, key_name, key_value, update_data } = body;

    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions) as Session & { 
      user: { id: string; accessToken?: string };
      sessionId?: string;
    };
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Validate required parameters
    if (!table_name || !key_name || key_value === undefined || !update_data) {
      console.error('[db/update] Missing required parameters:', { table_name, key_name, key_value, update_data });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Convert to GCP Firestore format
    const gcpParams = {
      collection_name: table_name,
      key_name,
      key_value,
      update_data,
      account_id: session.user.id
    };

    // Make the request to the GCP API Gateway
    const response = await fetch(`${config.API_URL}/db/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken || session.sessionId}` // Use JWT token from session
      },
      body: JSON.stringify(gcpParams),
    });

    // Get the response text
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[db/update] Response not ok:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        url: `${config.API_URL}/db/update`,
        requestBody: {
          collection_name: table_name,
          key_name,
          key_value: typeof key_value === 'string' ? key_value.substring(0, 10) + '...' : key_value
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
          error: 'Database update failed',
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
      console.error('[db/update] Failed to parse response:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from database' },
        { status: 500 }
      );
    }

    // Handle the GCP response format
    if (!data.success) {
      console.error('[db/update] GCP API returned error:', data);
      return NextResponse.json(
        { error: data.error || 'Database update failed' },
        { status: 500 }
      );
    }

    // Return the update result from the GCP response
    return NextResponse.json({
      success: true,
      updated: data.data?.updated_count || 0
    });

  } catch (error) {
    console.error('[db/update] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error from db/update route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}