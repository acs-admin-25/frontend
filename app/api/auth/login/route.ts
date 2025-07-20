// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';

export async function POST(request: Request) {
    try {
        console.log('🔍 LOGIN API - Starting request...');
        
        const body = await request.json();
        const {email, password, name, provider} = body;
        
        console.log('📝 LOGIN API - Request body:', { email, provider, name: name ? 'provided' : 'missing' });

        if (provider === 'form' && !password) {
            console.log('❌ LOGIN API - Missing password for form login');
            return NextResponse.json({ error: 'Password is required for form-based login.' }, { status: 400 });
        }
        
        // if provider is google, there needs to be a name field in the body
        if (provider === 'google' && (!name || name.trim() === '')) {
            console.log('❌ LOGIN API - Missing name for google login');
            return NextResponse.json({ error: 'Name is required for google login.' }, { status: 400 });
        }
        
        console.log('🚀 LOGIN API - Calling Cloud Function:', config.LOGIN_FUNCTION);
        console.log('📤 LOGIN API - Request payload:', { email, password: '***', provider, name });

        // Call Google Cloud Function directly
        // Backend expects only email and password
        const response = await fetch(config.LOGIN_FUNCTION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        console.log('📥 LOGIN API - Response status:', response.status);
        console.log('📥 LOGIN API - Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('📥 LOGIN API - Response text:', responseText.substring(0, 500));
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📥 LOGIN API - Response data:', data);
        } catch (parseError) {
            console.error('❌ LOGIN API - Failed to parse JSON response:', parseError);
            console.error('❌ LOGIN API - Raw response:', responseText);
            return NextResponse.json({ 
                error: 'Invalid response from Cloud Function',
                details: 'Response was not valid JSON'
            }, { status: 500 });
        }

        if (!response.ok) {
            console.log('❌ LOGIN API - Cloud Function returned error status:', response.status);
            console.log('❌ LOGIN API - Error response:', data);
            return NextResponse.json({ 
                error: 'Login failed.',
                details: data?.error || 'Unknown error',
                status: response.status
            }, { status: response.status });
        }

        console.log('✅ LOGIN API - Cloud Function returned success!');
        
        // Cloud Functions return JWT token in response body
        const user = {
            id: data.user?.user_id || data.user?.id || data.id,
            email: email,
            name: data.user?.name || data.name || name,
            authType: data.user?.authType || data.authType || 'existing',
            provider: provider || 'form',
        };
        
        console.log('👤 LOGIN API - Processed user data:', { 
            id: user.id, 
            email: user.email, 
            name: user.name,
            authType: user.authType,
            provider: user.provider 
        });
        
        const nextResponse = NextResponse.json({
            success: true,
            message: 'Login successful!',
            user,
            token: data.token, // JWT token from Cloud Function
        }, { status: 200 });

        // Set JWT token as httpOnly cookie
        if (data.token) {
            console.log('🍪 LOGIN API - Setting JWT token cookie');
            nextResponse.cookies.set('auth-token', data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 // 24 hours
            });
        } else {
            console.log('⚠️ LOGIN API - No JWT token in response');
        }

        console.log('✅ LOGIN API - Returning success response');
        return nextResponse;

    } catch (error: any) {
        // Keep error logging for debugging purposes
        console.error("💥 LOGIN API - Unexpected error:", error);
        console.error("💥 LOGIN API - Error stack:", error.stack);
        console.error("💥 LOGIN API - Error message:", error.message);
        return NextResponse.json({ 
            error: 'An unexpected error occurred during login.',
            details: error.message
        }, { status: 500 });
    }
}