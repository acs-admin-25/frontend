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
        

        const response = await fetch(config.API_URL + `/users/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, provider, name }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: 'Login failed.' }, { status: response.status });
        }

        // Get the session cookie from the API response
        const setCookieHeader = response.headers.get('set-cookie');

        // Extract session_id from the cookie header
        let sessionId = null;
        if (setCookieHeader) {
            const sessionIdMatch = setCookieHeader.match(/session_id=([^;,\s]+)/);
            if (sessionIdMatch?.[1]) {
                sessionId = sessionIdMatch[1];
            }
        }

        // Compose user fields for the frontend
        const user = {
            id: data.id || data._id,
            email: email,
            name: data.name || data.user?.name || name,
            authType: data.authType || data.authType || data.authtype || 'existing',
            provider: provider || 'form',
        };
        
        const nextResponse = NextResponse.json({
            success: true,
            message: 'Login successful!',
            user,
            sessionId, // Include session_id in response body
        }, { status: 200 });

        // Handle the session_id cookie from the API response
        if (setCookieHeader) {
            // Forward all cookies if there are multiple
            setCookieHeader.split(',').forEach(cookie => {
                let cookieToSet = cookie.trim();
                if (process.env.NODE_ENV !== 'production') {
                    // Remove Secure attribute for local development
                    cookieToSet = cookieToSet.replace(/; ?secure/gi, '');
                }
                nextResponse.headers.append('set-cookie', cookieToSet);
            });
        }

        return nextResponse;

    } catch (error: any) {
        // Keep error logging for debugging purposes
        console.error("Login API - Error:", error);
        return NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 });
    }
}