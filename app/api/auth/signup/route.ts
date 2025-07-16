import { NextResponse } from 'next/server';
import type { SignupData } from '@/lib/types/auth';
import { config } from '@/lib/config/local-api-config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handles user signup requests for GCP backend
 * @param {Request} request - The incoming request object
 * @param {Object} request.body - The request body containing signup data
 * @param {string} request.body.name - User's full name
 * @param {string} request.body.email - User's email address
 * @param {string} request.body.password - User's password (required for form-based signup)
 * @param {string} request.body.provider - Signup provider ('form' | 'google')
 * @param {string} request.body.captchaToken - reCAPTCHA verification token
 * @returns {Promise<NextResponse>} Response containing signup result with JWT token or error
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
        
        // Forward the request to GCP API Gateway
        const apiUrl = `${config.API_URL}/api/auth/signup`;
        console.log('Signup API - Calling URL:', apiUrl);
        console.log('Signup API - Config API_URL:', config.API_URL);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name,
                email: signupData.email,
                password: signupData.password,
                provider: signupData.provider,
                captchaToken: signupData.captchaToken
            }),
        });

        console.log('Signup API - Response status:', response.status);
        console.log('Signup API - Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { 
                    error: data.error?.message || data.message || 'Failed to sign up',
                    details: data.error?.details
                },
                { status: response.status }
            );
        }

        // Return JWT token response for GCP
        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: data.data?.user?.id || data.user?.id || id,
                    email: signupData.email,
                    name: name,
                    provider: signupData.provider,
                    authType: 'new'
                },
                session: {
                    token: data.data?.session?.token || data.session?.token,
                    expires_at: data.data?.session?.expires_at || data.session?.expires_at
                }
            }
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}