import { NextResponse } from 'next/server';
import { config } from '@/lib/config/local-api-config';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { format } from 'date-fns';
import type { Session } from 'next-auth';

interface Invocation {
  input_tokens?: number;
  output_tokens?: number;
  timestamp?: number;
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1y';
    
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }


    // Fetch all invocations for the user using new GCP format
    const response = await fetch(`${config.API_URL}/db/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      },
      body: JSON.stringify({
        collection_name: 'Invocations',
        filters: [{
          field: 'associated_account',
          op: '==',
          value: userId
        }],
        user_id: userId,
        account_id: userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[usage/stats] Failed to fetch invocations:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // If the backend returns 401, we should also return 401
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      
      throw new Error(`Failed to fetch invocations: ${response.statusText}`);
    }

    // Parse the new response format
    const data = await response.json();
    const invocations = Array.isArray(data.items) ? data.items : [];

    if (!Array.isArray(invocations)) {
      throw new Error('Invalid response format from invocations fetch');
    }

    // Calculate total stats
    const totalInvocations = invocations.length;
    const totalInputTokens = invocations.reduce((sum, inv) => sum + (inv.input_tokens || 0), 0);
    const totalOutputTokens = invocations.reduce((sum, inv) => sum + (inv.output_tokens || 0), 0);

    // Determine the lower bound timestamp for the selected range
    const now = Date.now();
    let fromEpoch = 0;
    switch (timeRange) {
      case '24h':
        fromEpoch = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        fromEpoch = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        fromEpoch = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '1y':
      default:
        fromEpoch = now - 365 * 24 * 60 * 60 * 1000;
        break;
    }

    // Filter invocations based on time range
    const filteredInvocations = invocations.filter(inv => {
      const timestamp = inv.timestamp || 0;
      return timestamp >= fromEpoch;
    });

    // Calculate time range specific stats
    const rangeInvocations = filteredInvocations.length;
    const rangeInputTokens = filteredInvocations.reduce((sum, inv) => sum + (inv.input_tokens || 0), 0);
    const rangeOutputTokens = filteredInvocations.reduce((sum, inv) => sum + (inv.output_tokens || 0), 0);

    // Format dates for display
    const fromDate = format(new Date(fromEpoch), 'MMM d, yyyy');
    const toDate = format(new Date(now), 'MMM d, yyyy');

    // Helper function to get time key based on range (all in ms)
    const getTimeKey = (timestamp: number | undefined): string => {
      const ts = timestamp || 0;
      const date = new Date(ts);
      switch (timeRange) {
        case '1d':
          return format(date, 'HH:mm');
        case '1w':
          return format(date, 'EEE');
        case '1m':
          return format(date, 'MMM d');
        case '1y':
        default:
          return format(date, 'MMM');
      }
    };

    // Group by thread for thread stats
    const conversationsByThread = filteredInvocations.reduce((acc, inv) => {
      const threadId = inv.conversation_id;
      if (!acc[threadId]) {
        acc[threadId] = {
          threadId,
          threadName: inv.conversation_id || 'Unnamed Thread',
          invocations: 0,
          inputTokens: 0,
          outputTokens: 0,
          conversationUrl: threadId ? `/dashboard/conversations/${threadId}` : null,
          timestamp: inv.timestamp,
          isSelected: false // Add selection state
        };
      }
      acc[threadId].invocations++;
      acc[threadId].inputTokens += inv.input_tokens || 0;
      acc[threadId].outputTokens += inv.output_tokens || 0;
      return acc;
    }, {});

    // Convert to array format and sort by invocations
    const threadStats = Object.values(conversationsByThread)
      .sort((a, b) => (b as { invocations: number }).invocations - (a as { invocations: number }).invocations)
      .slice(0, 5); // Only take top 5 by default

    // Group invocations by time period
    const timeStats = filteredInvocations.reduce((acc: { [key: string]: any }, inv) => {
      const timeKey = getTimeKey(inv.timestamp);
      if (!acc[timeKey]) {
        acc[timeKey] = {
          invocations: 0,
          inputTokens: 0,
          outputTokens: 0,
          conversations: new Set<string>()
        };
      }
      acc[timeKey].invocations++;
      acc[timeKey].inputTokens += inv.input_tokens || 0;
      acc[timeKey].outputTokens += inv.output_tokens || 0;
      if (inv.conversation_id) {
        acc[timeKey].conversations.add(inv.conversation_id);
      }
      return acc;
    }, {});

    return NextResponse.json({
      total: {
        invocations: totalInvocations,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
      range: {
        from: fromDate,
        to: toDate,
        invocations: rangeInvocations,
        inputTokens: rangeInputTokens,
        outputTokens: rangeOutputTokens
      },
      conversationsByThread: threadStats,
      timeStats: Object.entries(timeStats).map(([key, value]) => ({
        time: key,
        invocations: value.invocations,
        inputTokens: value.inputTokens,
        outputTokens: value.outputTokens,
        conversations: Array.from(value.conversations).length
      })).sort((a, b) => {
        const aTime = new Date((a as { time: string }).time).getTime();
        const bTime = new Date((b as { time: string }).time).getTime();
        return aTime - bTime;
      })
    });

  } catch (error) {
    console.error('[usage/stats] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error from usage/stats route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    const body = await request.json();
    const timeRange = body.timeRange || '1y';

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No authenticated user found' },
        { status: 401 }
      );
    }

    if (!config.API_URL) {
      console.error('[usage/stats] API_URL not configured');
      return NextResponse.json(
        { error: 'API_URL not configured' },
        { status: 500 }
      );
    }

    // Fetch all invocations for the user using new GCP format
    const response = await fetch(`${config.API_URL}/db/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      },
      body: JSON.stringify({
        collection_name: 'Invocations',
        filters: [{
          field: 'associated_account',
          op: '==',
          value: userId
        }],
        user_id: userId,
        account_id: userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[usage/stats] Failed to fetch invocations:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
      throw new Error(`Failed to fetch invocations: ${response.statusText}`);
    }

    // Parse the new response format
    const data = await response.json();
    const invocations = Array.isArray(data.items) ? data.items : [];

    if (!Array.isArray(invocations)) {
      throw new Error('Invalid response format from invocations fetch');
    }

    // Calculate total stats
    const totalInvocations = invocations.length;
    const totalInputTokens = invocations.reduce((sum, inv) => sum + (inv.input_tokens || 0), 0);
    const totalOutputTokens = invocations.reduce((sum, inv) => sum + (inv.output_tokens || 0), 0);

    // Determine the lower bound timestamp for the selected range
    const now = Date.now();
    let fromEpoch = 0;
    switch (timeRange) {
      case '24h':
        fromEpoch = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        fromEpoch = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        fromEpoch = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '1y':
      default:
        fromEpoch = now - 365 * 24 * 60 * 60 * 1000;
        break;
    }

    // Filter invocations based on time range
    const filteredInvocations = invocations.filter(inv => {
      const timestamp = inv.timestamp || 0;
      return timestamp >= fromEpoch;
    });

    // Calculate time range specific stats
    const rangeInvocations = filteredInvocations.length;
    const rangeInputTokens = filteredInvocations.reduce((sum, inv) => sum + (inv.input_tokens || 0), 0);
    const rangeOutputTokens = filteredInvocations.reduce((sum, inv) => sum + (inv.output_tokens || 0), 0);

    // Format dates for display
    const fromDate = format(new Date(fromEpoch), 'MMM d, yyyy');
    const toDate = format(new Date(now), 'MMM d, yyyy');

    // Helper function to get time key based on range (all in ms)
    const getTimeKey = (timestamp: number | undefined): string => {
      const ts = timestamp || 0;
      const date = new Date(ts);
      switch (timeRange) {
        case '1d':
          return format(date, 'HH:mm');
        case '1w':
          return format(date, 'EEE');
        case '1m':
          return format(date, 'MMM d');
        case '1y':
        default:
          return format(date, 'MMM');
      }
    };

    // Group by thread for thread stats
    const conversationsByThread = filteredInvocations.reduce((acc, inv) => {
      const threadId = inv.conversation_id;
      if (!acc[threadId]) {
        acc[threadId] = {
          threadId,
          threadName: inv.conversation_id || 'Unnamed Thread',
          invocations: 0,
          inputTokens: 0,
          outputTokens: 0,
          conversationUrl: threadId ? `/dashboard/conversations/${threadId}` : null,
          timestamp: inv.timestamp,
          isSelected: false // Add selection state
        };
      }
      acc[threadId].invocations++;
      acc[threadId].inputTokens += inv.input_tokens || 0;
      acc[threadId].outputTokens += inv.output_tokens || 0;
      return acc;
    }, {});

    // Convert to array format and sort by invocations
    const threadStats = Object.values(conversationsByThread)
      .sort((a, b) => (b as { invocations: number }).invocations - (a as { invocations: number }).invocations)
      .slice(0, 5); // Only take top 5 by default

    // Group invocations by time period
    const timeStats = filteredInvocations.reduce((acc: { [key: string]: any }, inv) => {
      const timeKey = getTimeKey(inv.timestamp);
      if (!acc[timeKey]) {
        acc[timeKey] = {
          invocations: 0,
          inputTokens: 0,
          outputTokens: 0,
          conversations: new Set<string>()
        };
      }
      acc[timeKey].invocations++;
      acc[timeKey].inputTokens += inv.input_tokens || 0;
      acc[timeKey].outputTokens += inv.output_tokens || 0;
      if (inv.conversation_id) {
        acc[timeKey].conversations.add(inv.conversation_id);
      }
      return acc;
    }, {});

    return NextResponse.json({
      total: {
        invocations: totalInvocations,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
      range: {
        from: fromDate,
        to: toDate,
        invocations: rangeInvocations,
        inputTokens: rangeInputTokens,
        outputTokens: rangeOutputTokens
      },
      conversationsByThread: threadStats,
      timeStats: Object.entries(timeStats).map(([key, value]) => ({
        time: key,
        invocations: value.invocations,
        inputTokens: value.inputTokens,
        outputTokens: value.outputTokens,
        conversations: Array.from(value.conversations).length
      })).sort((a, b) => {
        const aTime = new Date((a as { time: string }).time).getTime();
        const bTime = new Date((b as { time: string }).time).getTime();
        return aTime - bTime;
      })
    });

  } catch (error) {
    console.error('[usage/stats] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error from usage/stats route',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 