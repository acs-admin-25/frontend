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
    const signupData: SignupData = await request.json();
    const { name, email, password, provider, captchaToken, idToken } = signupData;

    // Prepare request body - only include idToken for Google signups
    const requestBody: Partial<SignupData> = { name, email, password, provider, captchaToken };
    
    if (provider === 'google' && idToken) {
        requestBody.idToken = idToken;
    }

    const response = await fetch(`${config.API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return NextResponse.json(data);
}