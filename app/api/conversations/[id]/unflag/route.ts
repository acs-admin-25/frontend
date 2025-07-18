import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
    // Update the conversation to remove flags
    const response = await apiClient.dbUpdate({
      table_name: 'conversations',
      key_name: 'conversation_id',
      key_value: conversationId,
      update_data: {
        flag_for_review: false,
        flag: false,
        updated_at: new Date().toISOString()
      }
    });

    if (!response.success) {
      return NextResponse.json(
        { error: 'Failed to unflag conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unflagging conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 