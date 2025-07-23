import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';
import { DbBatchSelectParams } from '@/lib/types/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collection_name, document_ids, batch_queries, user_id, account_id } = body;

    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Validate required parameters for GCP BATCH-SELECT
    if (!collection_name) {
      console.error('[db/batch-select] Missing required parameter: collection_name');
      return NextResponse.json(
        { error: 'Missing required parameter: collection_name' },
        { status: 400 }
      );
    }

    // Validate that either document_ids or batch_queries is provided
    if (!document_ids && !batch_queries) {
      console.error('[db/batch-select] Missing required parameter: either document_ids or batch_queries');
      return NextResponse.json(
        { error: 'Missing required parameter: either document_ids or batch_queries' },
        { status: 400 }
      );
    }

    // Convert to GCP format
    const gcpRequest: DbBatchSelectParams = {
      collection_name,
      user_id: session.user.id,
      account_id: session.user.id
    };

    // Add document_ids or batch_queries based on what was provided
    if (document_ids) {
      gcpRequest.document_ids = document_ids;
    } else if (batch_queries) {
      gcpRequest.batch_queries = batch_queries;
    }

    // Construct the GCP Cloud Function URL
    const gcpFunctionUrl = `${config.API_URL}/db/batch-select`;

    console.log('[db/batch-select] Making GCP request:', {
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
      console.error('[db/batch-select] GCP response not ok:', {
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
          error: 'Database batch query failed',
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
      console.error('[db/batch-select] Failed to parse GCP response:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from GCP function' },
        { status: 500 }
      );
    }

    // Handle the GCP response format
    if (!data.success) {
      console.error('[db/batch-select] GCP function returned error:', data);
      return NextResponse.json(
        { error: data.error || 'GCP function error' },
        { status: 500 }
      );
    }

    // Return the data in the expected format
    return NextResponse.json({
      success: true,
      data: data.documents || data.query_results || [],
      type: data.type,
      requested_count: data.requested_count,
      found_count: data.found_count,
      query_count: data.query_count,
      total_results: data.total_results,
      execution_time_ms: data.execution_time_ms,
      rate_limit_info: data.rate_limit_info
    });

  } catch (error) {
    console.error('[db/batch-select] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error from db/batch-select route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 