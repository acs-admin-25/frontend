import { config } from '@/lib/config/local-api-config';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      console.error('Conversation ID is required');
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    const url = `${config.API_URL}/lcp/get-thread-attrs`;
    
    // Get session_id from request cookies
    const cookies = request.headers.get('cookie');
    const sessionId = cookies?.split(';')
      .find(cookie => cookie.trim().startsWith('session_id='))
      ?.split('=')[1];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'Cookie': `session_id=${sessionId}` })
      },
      credentials: 'include',
      body: JSON.stringify({ conversationId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error:', errorData);
      console.error('Status:', response.status);
      return NextResponse.json(
        { error: errorData.message},
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in get_thread_attrs route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
