import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { accessToken, title, description, start, end, location } = await request.json();

  const res = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subject: title,
      body: { contentType: 'HTML', content: description },
      start: { dateTime: start, timeZone: 'UTC' },
      end: { dateTime: end, timeZone: 'UTC' },
      location: { displayName: location }
    })
  });

  const data = await res.json();
  return NextResponse.json({ success: res.ok, event: data });
} 