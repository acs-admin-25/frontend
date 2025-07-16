import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collection_name, key_name, key_values, filters, limit, order_by, order_direction } = body;

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
    if (!collection_name || !key_values || !Array.isArray(key_values)) {
      console.error('[db/batch-select] Missing required parameters:', { collection_name, key_values });
      return NextResponse.json(
        { error: 'Missing required parameters: collection_name and key_values array' },
        { status: 400 }
      );
    }

    // Convert to GCP batch select format
    const queries = key_values.map(key_value => ({
      collection_name,
      key_name,
      key_value,
      account_id: session.user.id,
      filters: filters || {},
      limit: limit || 100,
      order_by: order_by || 'created_at',
      order_direction: order_direction || 'desc'
    }));

    const gcpParams = {
      queries,
      account_id: session.user.id,
      max_parallel: 10
    };

    // Make the request to the GCP API Gateway
    const response = await fetch(`${config.API_URL}/api/db/batch-select`, {
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
      console.error('[db/batch-select] Response not ok:', {
        status: response.status,
        statusText: response.statusText,
        error: responseText,
        url: `${config.API_URL}/api/db/batch-select`,
        requestBody: {
          queries: queries.length,
          account_id: session.user.id
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
          error: 'Batch database query failed',
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
      console.error('[db/batch-select] Failed to parse response:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON response from database' },
        { status: 500 }
      );
    }

    // Handle the GCP response format
    if (!data.success) {
      console.error('[db/batch-select] GCP API returned error:', data);
      return NextResponse.json(
        { error: data.error || 'Batch database query failed' },
        { status: 500 }
      );
    }

    // Flatten results from all queries into a single array
    const allItems = data.data?.results?.flatMap((result: any) => 
      result.success ? result.data : []
    ) || [];

    // Return the items from the GCP response
    return NextResponse.json({
      success: true,
      items: allItems,
      total_count: allItems.length,
      batch_stats: {
        total_queries: data.data?.total_queries || 0,
        successful_queries: data.data?.successful_queries || 0,
        failed_queries: data.data?.failed_queries || 0
      }
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