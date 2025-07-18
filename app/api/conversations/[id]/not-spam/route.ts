import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
    // Update the conversation to remove spam flag
    const response = await apiClient.dbUpdate({
      table_name: 'conversations',
      key_name: 'conversation_id',
      key_value: conversationId,
      update_data: {
        spam: false,
        updated_at: new Date().toISOString()
      }
    });

    if (!response.success) {
      return NextResponse.json(
        { error: 'Failed to mark conversation as not spam' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as not spam:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 