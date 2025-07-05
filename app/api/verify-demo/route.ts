/**
 * File: app/api/verify-demo/route.ts
 * Purpose: API route to verify demo access codes
 * Author: Assistant
 * Date: 12/19/24
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/config';

/**
 * POST handler for demo code verification
 * Validates the provided demo code against the configured demo code
 * 
 * @param {NextRequest} request - The incoming request containing the demo code
 * @returns {NextResponse} JSON response with success/error status
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { demoCode } = body;

    // Validate input
    if (!demoCode || typeof demoCode !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demo code is required' 
        },
        { status: 400 }
      );
    }

    // Check if demo is enabled
    if (!config.DEMO.ENABLED) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demo access is currently disabled' 
        },
        { status: 403 }
      );
    }

    // Verify the demo code
    const isValidCode = demoCode.trim() === config.DEMO.CODE;

    if (isValidCode) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Demo code verified successfully' 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid demo code' 
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Demo verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 