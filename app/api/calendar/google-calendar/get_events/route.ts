import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { accessToken } = await request.json();

  // Fetch events from Google Calendar API - Next 7 days only
  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0); // Start of today

  const endTime = new Date();
  endTime.setDate(endTime.getDate() + 7); // Get events up to 7 days in the future
  endTime.setHours(23, 59, 59, 999); // End of 7th day

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${startTime.toISOString()}&timeMax=${endTime.toISOString()}&singleEvents=true&orderBy=startTime`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await res.json();
  return NextResponse.json({ success: res.ok, events: data.items || [] });
} 