import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { accessToken } = await request.json();

  const res = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const data = await res.json();
  return NextResponse.json({ success: res.ok, events: data.value });
} 