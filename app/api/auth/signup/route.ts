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
 * @returns {Promise<NextResponse>} Response containing signup result or error
 */
export async function POST(request: Request) {
    try {
        console.log('🔍 SIGNUP API - Starting request...');
        
        // Parse the request body
        const signupData: SignupData = await request.json();
        console.log('📝 SIGNUP API - Request body:', { 
            email: signupData.email, 
            provider: signupData.provider,
            name: signupData.name ? 'provided' : 'missing'
        });

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
        
        // Use firstName and lastName from SignupData, or fallback to splitting name
        let first_name = signupData.firstName || '';
        let last_name = signupData.lastName || '';
        
        // If firstName/lastName not provided, try to split the name field
        if (!first_name && !last_name && signupData.name) {
            const nameParts = signupData.name.trim().split(' ');
            first_name = nameParts[0] || '';
            last_name = nameParts.slice(1).join(' ') || '';
        }
        
        // Validate that we have at least a first name
        if (!first_name) {
            return NextResponse.json(
                { error: 'First name is required for signup' },
                { status: 400 }
            );
        }
        
        // generate a uuid for the user
        const id = uuidv4();
        
        console.log('🚀 SIGNUP API - Calling Cloud Function:', config.SIGNUP_FUNCTION);
        console.log('📤 SIGNUP API - Request payload:', { 
            email: signupData.email,
            first_name,
            last_name,
            password: signupData.password ? '***' : 'missing',
            phone_number: signupData.phone_number || undefined,
            organization: signupData.organization || undefined
        });

        // Forward the request to Google Cloud Function
        // Backend expects: email, password, first_name, last_name, phone_number?, organization?
        const response = await fetch(config.SIGNUP_FUNCTION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: signupData.email,
                password: signupData.password,
                first_name,
                last_name,
                phone_number: signupData.phone_number || undefined,
                organization: signupData.organization || undefined
            }),
        });

        console.log('📥 SIGNUP API - Response status:', response.status);
        console.log('📥 SIGNUP API - Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('📥 SIGNUP API - Response text:', responseText.substring(0, 500));
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📥 SIGNUP API - Response data:', data);
        } catch (parseError) {
            console.error('❌ SIGNUP API - Failed to parse JSON response:', parseError);
            console.error('❌ SIGNUP API - Raw response:', responseText);
            return NextResponse.json({ 
                error: 'Invalid response from Cloud Function',
                details: 'Response was not valid JSON'
            }, { status: 500 });
        }

        if (!response.ok) {
            console.log('❌ SIGNUP API - Cloud Function returned error status:', response.status);
            console.log('❌ SIGNUP API - Error response:', data);
            return NextResponse.json(
                { 
                    error: data.message || 'Failed to sign up',
                    details: data?.error || 'Unknown error',
                    status: response.status
                },
                { status: response.status }
            );
        }

        // Create response with JWT token
        const nextResponse = NextResponse.json({
            success: true,
            data: {
                ...data,
                user: {
                    id: data.user?.user_id || data.user?.id || data.id || id,
                    email: data.user?.email || data.email,
                    name: `${first_name} ${last_name}`.trim(),
                    provider: signupData.provider,
                    authType: 'new'
                },
                token: data.token, // JWT token from Cloud Function
            }
        });

        // Set JWT token as httpOnly cookie
        if (data.token) {
            nextResponse.cookies.set('auth-token', data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 // 24 hours
            });
        }

        return nextResponse;
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}