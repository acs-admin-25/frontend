import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';
import { DbSelectParams } from '@/lib/types/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table_name, index_name, key_name, key_value, filters, order_by, limit, start_after } = body;

    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Validate required parameters for GCP SELECT
    if (!table_name) {
      console.error('[db/select] Missing required parameter: table_name');
      return NextResponse.json(
        { error: 'Missing required parameter: table_name' },
        { status: 400 }
      );
    }

    // Convert old AWS format to new GCP format
    const gcpRequest: DbSelectParams = {
      collection_name: table_name,
      filters: [],
      order_by: order_by,
      limit: limit || 100,
      start_after: start_after,
      user_id: session.user.id,
      account_id: session.user.id
    };

    // Convert old index/key format to GCP filters format
    if (index_name && key_name && key_value !== undefined) {
      gcpRequest.filters!.push({
        field: key_name,
        op: '==',
        value: key_value
      });
    }

    // Add any additional filters
    if (filters && Array.isArray(filters)) {
      gcpRequest.filters!.push(...filters);
    }

    // Construct the GCP Cloud Function URL
    const gcpFunctionUrl = `${config.API_URL}/db/select`;

    console.log('[db/select] Making GCP request:', {
      url: gcpFunctionUrl,
      requestBody: {
        ...gcpRequest,
        // Don't log sensitive data
        user_id: gcpRequest.user_id ? '***' : undefined,
        account_id: gcpRequest.account_id ? '***' : undefined
      }
    });

    // Make the request to the GCP Cloud Function
    const response = await fetch(gcpFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.id}` // Use user ID as auth token
      },
      body: JSON.stringify(gcpRequest)
    });

    // Get the response text
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('[db/select] GCP response not ok:', {
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
          error: 'Database query failed',
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
      console.error('[db/select] Failed to parse GCP response:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from GCP function' },
        { status: 500 }
      );
    }

    // Handle the GCP response format
    if (!data.success) {
      console.error('[db/select] GCP function returned error:', data);
      return NextResponse.json(
        { error: data.error || 'GCP function error' },
        { status: 500 }
      );
    }

    // Return the data in the expected format
    return NextResponse.json({
      success: true,
      items: data.data || [],
      total: data.total_count || 0,
      has_more: data.has_more || false,
      next_cursor: data.next_cursor,
      execution_time_ms: data.execution_time_ms,
      query_complexity: data.query_complexity,
      rate_limit_info: data.rate_limit_info
    });

  } catch (error) {
    console.error('[db/select] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error from db/select route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
