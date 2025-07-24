import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table_name, attribute_name, attribute_value } = body;

    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions) as Session & { user: { id: string } };
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    // Validate required parameters for GCP DELETE
    if (!table_name || !attribute_name || attribute_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Convert to GCP delete request format
    const gcpRequest = {
      collection_name: table_name,
      key_name: attribute_name,
      key_value: attribute_value,
      user_id: session.user.id,
      account_id: session.user.id
    };

    // Construct the GCP Cloud Function URL
    const gcpFunctionUrl = `${config.API_URL}/db/delete`;

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
      return NextResponse.json(
        { error: 'Invalid JSON response from GCP function' },
        { status: 500 }
      );
    }

    // Handle the GCP response format
    if (!data.success) {
      return NextResponse.json(
        { error: data.error || 'GCP function error' },
        { status: 500 }
      );
    }

    // Return the data in the expected format
    return NextResponse.json({
      success: true,
      data: data.data || null,
      execution_time_ms: data.execution_time_ms,
      rate_limit_info: data.rate_limit_info
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Internal server error from db/delete route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
