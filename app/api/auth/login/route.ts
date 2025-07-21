// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';

export async function POST(request: Request) {
    try {
        const requestBody = await request.json();
        const { email, password, provider, idToken, name } = requestBody;

        const response = await fetch(`${config.API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                password,
                provider: provider || 'email', // Use provided provider or default to 'email'
                idToken: idToken || '', // Use provided idToken or default to empty string
                ...(name && { name }) // Include name if provided
            }),
        });

        const backendData = await response.json();

        // Check if the backend request was successful
        if (response.ok && backendData.message) {
            // Format the response to match what auth-options.ts expects
            return NextResponse.json({
                success: true,
                data: {
                    message: backendData.message,
                    token: 'session-based', // Backend uses session cookies, not tokens
                    user: {
                        id: backendData.id,
                        name: backendData.name,
                        email: email,
                        authType: backendData.authType || backendData.authtype || 'existing'
                    }
                },
                status: response.status
            });
        } else {
            // Handle error response
            return NextResponse.json({
                success: false,
                error: backendData.message || 'Login failed',
                status: response.status
            }, { status: response.status });
        }
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            status: 500
        }, { status: 500 });
    }
}