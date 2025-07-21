// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';

export async function POST(request: Request) {
    const requestBody = await request.json();
    const { email, password, provider, idToken, name } = requestBody;

    const response = await fetch(`${config.API_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ 
            email, 
            password,
            provider: provider || 'email', // Use provided provider or default to 'email'
            idToken: idToken || '', // Use provided idToken or default to empty string
            ...(name && { name }) // Include name if provided
        }),
    });

    const data = await response.json();

    return NextResponse.json(data);
}