import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table_name, key_value, update_data, upsert = true } = body;

    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Validate required parameters for GCP UPDATE
    if (!table_name || !key_value || !update_data) {
      return NextResponse.json(
        { error: 'Missing required parameters: table_name, key_value, update_data' },
        { status: 400 }
      );
    }

    // Convert to GCP update format
    const gcpRequest = {
      collection_name: table_name,
      document_id: key_value,
      data: update_data,
      user_id: session.user.id,
      account_id: session.user.id,
      upsert: upsert
    };

    // Construct the GCP Cloud Function URL
    const gcpFunctionUrl = `${config.API_URL}/db/update`;

    // Make the request to the GCP Cloud Function
    const response = await fetch(gcpFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.id}`
      },
      body: JSON.stringify(gcpRequest)
    });

    // Get the response text
    const responseText = await response.text();

    if (!response.ok) {
      console.error('[db/update] GCP response not ok:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        url: gcpFunctionUrl
      });

      // Handle rate limiting
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            details: responseText,
            status: response.status
          },
          { status: 429 }
        );
      }

      // Handle authentication errors
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
      console.error('[db/update] Failed to parse GCP response:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from GCP function' },
        { status: 500 }
      );
    }

    // Handle the GCP response format
    if (!data.success) {
      console.error('[db/update] GCP function returned error:', data);
      return NextResponse.json(
        { error: data.error || 'GCP function error' },
        { status: 500 }
      );
    }

    // Return the data in the expected format
    return NextResponse.json({
      success: true,
      operation: data.operation,
      document_id: data.document_id,
      data: data.data,
      execution_time_ms: data.execution_time_ms,
      rate_limit_info: data.rate_limit_info
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