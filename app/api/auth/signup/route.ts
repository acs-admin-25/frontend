import { NextResponse } from 'next/server';
import type { SignupData } from '@/lib/types/auth';
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
 * @param {string} request.body.idToken - Google OAuth ID token (required for Google signup)
 * @returns {Promise<NextResponse>} Response containing signup result or error
 */
export async function POST(request: Request) {
    try {
        const signupData: SignupData = await request.json();
        const { name, email, password, provider, captchaToken, idToken } = signupData;

        // Prepare request body - only include idToken for Google signups
        const requestBody: Partial<SignupData> = { name, email, password, provider, captchaToken };
        
        if (provider === 'google' && idToken) {
            requestBody.idToken = idToken;
        }

        console.log('Making request to backend:', {
            url: `${config.API_URL}/signup`,
            method: 'POST',
            body: requestBody
        });

        const response = await fetch(`${config.API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        console.log('Backend response received:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Backend returned non-JSON response:', {
                status: response.status,
                contentType,
                url: response.url
            });
            
            // Try to get the response text for debugging
            const responseText = await response.text();
            console.error('Response text:', responseText);
            
            return NextResponse.json({
                success: false,
                error: 'Backend returned invalid response format',
                status: response.status
            }, { status: 500 });
        }

        let backendData;
        try {
            backendData = await response.json();
            console.log('Backend data parsed:', {
                message: backendData.message,
                user_exists: backendData.user_exists,
                hasToken: !!backendData.token,
                dataKeys: Object.keys(backendData)
            });
        } catch (jsonError) {
            console.error('Failed to parse backend response as JSON:', jsonError);
            
            // Try to get the raw response text for debugging
            const responseText = await response.text();
            console.error('Raw response text:', responseText);
            
            return NextResponse.json({
                success: false,
                error: 'Backend returned invalid JSON response',
                status: response.status
            }, { status: 500 });
        }

        // Check if the backend request was successful
        if (response.ok && backendData.message) {
            // Format the response to match what auth-options.ts expects
            return NextResponse.json({
                success: true,
                data: {
                    message: backendData.message,
                    token: backendData.token,
                    user_exists: backendData.user_exists,
                    user: {
                        id: uuidv4(), // Generate a temporary ID - will be replaced by Firebase user ID
                        name: name,
                        email: email,
                        authType: backendData.user_exists === false ? 'new' : 'existing'
                    }
                },
                status: response.status
            });
        } else {
            // Handle error response
            return NextResponse.json({
                success: false,
                error: backendData.error || 'Signup failed',
                status: response.status
            }, { status: response.status });
        }
    } catch (error) {
        console.error('Signup API error:', error);
        
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json({
                success: false,
                error: 'Unable to connect to backend service. Please try again later.',
                status: 503
            }, { status: 503 });
        }
        
        // Check if it's a JSON parsing error
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            return NextResponse.json({
                success: false,
                error: 'Backend service returned invalid response. Please try again later.',
                status: 502
            }, { status: 502 });
        }
        
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}