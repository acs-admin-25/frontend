import { NextResponse } from 'next/server';
import type { SignupData } from '@/types/auth';
import { config } from '@/lib/config/local-api-config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles user signup requests
 * @param {Request} request - The incoming request object
 * @param {Object} request.body - The request body containing signup data
 * @param {string} request.body.name - User's full name
 * @param {string} request.body.email - User's email address
 * @param {string} request.body.password - User's password (required for form-based signup)
 * @param {string} request.body.provider - Signup provider ('form' | 'google')
 * @param {string} request.body.captchaToken - reCAPTCHA verification token
 * @returns {Promise<NextResponse>} Response containing signup result or error
 */
export async function POST(request: Request) {
    try {
        // Parse the request body
        const signupData: SignupData = await request.json();

        // Check required fields are present
        if (!signupData.email || !signupData.provider) {
            return NextResponse.json(
                { error: 'Missing required fields (email, provider)' },
                { status: 400 }
            );
        }

        // For form-based signup, require name
        if (signupData.provider === 'form' && !signupData.name) {
            return NextResponse.json(
                { error: 'Name is required for form-based signup' },
                { status: 400 }
            );
        }

        // if provider is form and no password, return error
        if (signupData.provider === 'form' && !signupData.password) {
            return NextResponse.json(
                { error: 'Password is required for form-based signup' },
                { status: 400 }
            );
        }

        // Check for reCAPTCHA token for form-based
        if (signupData.provider === 'form' && !signupData.captchaToken) {
            return NextResponse.json(
                { error: 'reCAPTCHA token is required for signup' },
                { status: 400 }
            );
        }
        
        // Use name for the backend
        const name = signupData.name;

        // If name is not provided, return error
        if (!name) {
            return NextResponse.json(
                { error: 'Name is required for signup' },
                { status: 400 }
            );
        }
        
        // generate a uuid for the user
        const id = uuidv4();
        
        // Forward the request to AWS API Gateway
        const response = await fetch(config.API_URL + '/users/auth/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...signupData, name, id }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.message || 'Failed to sign up' },
                { status: response.status }
            );
        }

        // Handle the session_id cookie from the API response
        const setCookieHeader = response.headers.get('set-cookie');
        
        // Extract session_id from the cookie header
        let sessionId = null;
        if (setCookieHeader) {
            const sessionIdMatch = setCookieHeader.match(/session_id=([^;,\s]+)/);
            if (sessionIdMatch?.[1]) {
                sessionId = sessionIdMatch[1];
            }
        }
        
        // Create response with the session token
        const nextResponse = NextResponse.json({
            success: true,
            data: {
                ...data,
                session: {
                    user: {
                        id: data.id || data.user?.id || id, // Use backend ID if available, fallback to local ID
                        email: data.email,
                        name: name,
                        provider: signupData.provider,
                        authType: 'new'
                    }
                },
                sessionId, // Include session_id in response body
            }
        });

        // Forward all cookies if there are multiple
        setCookieHeader?.split(',').forEach(cookie => {
            let cookieToSet = cookie.trim();
            if (process.env.NODE_ENV !== 'production') {
                // Remove Secure attribute for local development
                cookieToSet = cookieToSet.replace(/; ?secure/gi, '');
            }
            nextResponse.headers.append('set-cookie', cookieToSet);
        });

        return nextResponse;
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}