// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {email, password, name, provider} = body;

        if (provider === 'form' && !password) {
            return NextResponse.json({ error: 'Password is required for form-based login.' }, { status: 400 });
        }
        
        // if provider is google, there needs to be a name field in the body
        if (provider === 'google' && (!name || name.trim() === '')) {
            return NextResponse.json({ error: 'Name is required for google login.' }, { status: 400 });
        }
        
        // Call GCP API Gateway
        const apiUrl = `${config.API_URL}/api/auth/login`;
        console.log('Login API - Calling URL:', apiUrl);
        console.log('Login API - Config API_URL:', config.API_URL);
        
        // Prepare headers - try multiple authentication methods
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Try to get any available API key or service account token
        const apiKey = process.env.GCP_API_KEY || 
                      process.env.API_GATEWAY_KEY || 
                      process.env.FRONTEND_API_KEY ||
                      'dev-api-key'; // Fallback for development
        
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
            console.log('Login API - Using API key authentication');
        } else {
            console.log('Login API - No API key found, attempting unauthenticated request');
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ email, password, provider, name }),
        });

        console.log('Login API - Response status:', response.status);
        console.log('Login API - Response headers:', Object.fromEntries(response.headers.entries()));

        // Handle different response types
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();

            if (!response.ok) {
                console.error('Login API - Error response:', data);
                return NextResponse.json({ 
                    error: data.error?.message || data.message || 'Login failed.',
                    details: data.error?.details || data.details
                }, { status: response.status });
            }

            // Compose user fields for the frontend
            const user = {
                id: data.data?.user?.id,
                email: email,
                name: data.data?.user?.name || name,
                authType: 'existing',
                provider: provider || 'form',
                rate_limit_per_minute: data.data?.user?.rate_limit_per_minute || 60
            };
            
            const nextResponse = NextResponse.json({
                success: true,
                message: 'Login successful!',
                user,
                session: data.data?.session,
            }, { status: 200 });

            return nextResponse;
        } else {
            const text = await response.text();
            console.error('Login API - Non-JSON response:', text);
            console.error('Login API - Response status:', response.status);
            console.error('Login API - Response headers:', Object.fromEntries(response.headers.entries()));
            
            // Return a more specific error for authentication issues
            if (response.status === 403) {
                return NextResponse.json({ 
                    error: 'Authentication required for API Gateway access.',
                    details: 'The API Gateway requires authentication even for login endpoints. Please check the backend configuration.',
                    solution: 'Set GCP_API_KEY, API_GATEWAY_KEY, or FRONTEND_API_KEY environment variable.'
                }, { status: 403 });
            }
            
            return NextResponse.json({ 
                error: 'Unexpected response format from API Gateway.',
                details: text.substring(0, 200) // Include first 200 chars of response
            }, { status: response.status });
        }

    } catch (error: any) {
        // Keep error logging for debugging purposes
        console.error("Login API - Error:", error);
        return NextResponse.json({ 
            error: 'An unexpected error occurred during login.',
            details: error.message
        }, { status: 500 });
    }
}