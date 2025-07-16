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
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, provider, name }),
        });

        console.log('Login API - Response status:', response.status);
        console.log('Login API - Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ 
                error: data.error?.message || 'Login failed.',
                details: data.error?.details
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

    } catch (error: any) {
        // Keep error logging for debugging purposes
        console.error("Login API - Error:", error);
        return NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 });
    }
}