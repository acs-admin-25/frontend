import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * POST /api/calendar/calendly/validate
 * Validate Calendly API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', status: 401 },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required', status: 400 },
        { status: 400 }
      );
    }

    // Validate Calendly API key by making a test request
    try {
      const testResponse = await fetch('https://api.calendly.com/user', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!testResponse.ok) {
        return NextResponse.json(
          { success: false, error: 'Invalid Calendly API key', status: 400 },
          { status: 400 }
        );
      }

      const userData = await testResponse.json();

      return NextResponse.json({
        success: true,
        data: {
          user: userData,
          message: 'Calendly API key validated successfully'
        },
        status: 200,
      });

    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to validate Calendly API key', status: 400 },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[Calendly Validate] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        status: 500 
      },
      { status: 500 }
    );
  }
} 