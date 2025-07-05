/**
 * File: hooks/useConversationBulkActions.ts
 * Purpose: Custom hook for bulk conversation actions with optimistic updates
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.1.0
 */

import { useState, useCallback } from 'react';
import { useOptimisticConversations } from './useOptimisticConversations';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-hot-toast';

export function useConversationBulkActions() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateConversationOptimistically, removeConversationOptimistically } = useOptimisticConversations();

  // Select individual conversation
  const selectConversation = useCallback((conversationId: string) => {
    setSelectedIds(prev => 
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  }, []);

  // Select all conversations
  const selectAll = useCallback((conversations: any[]) => {
    const allIds = conversations.map(conv => conv.thread.conversation_id);
    setSelectedIds(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Delete selected conversations
  const deleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Optimistic update
      selectedIds.forEach(id => {
        removeConversationOptimistically(id);
      });

      // Actual API call
      await Promise.all(
        selectedIds.map(id => 
          apiClient.deleteThread({ conversation_id: id })
        )
      );

      toast.success(`Successfully deleted ${selectedIds.length} conversation(s)`);
      clearSelection();
    } catch (error) {
      // Revert optimistic update on error
      toast.error(`Failed to delete conversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, removeConversationOptimistically, clearSelection]);

  // Mark selected conversations as complete
  const markSelectedComplete = useCallback(async () => {
    if (selectedIds.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Optimistic updates
      selectedIds.forEach(id => {
        updateConversationOptimistically(id, {
          thread: {
            completed: true,
            busy: false
          }
        });
      });

      // Actual API calls
      await Promise.all(
        selectedIds.map(id => 
          apiClient.dbUpdate({
            table_name: 'conversations',
            key_name: 'conversation_id',
            key_value: id,
            update_data: {
              completed: true,
              busy: false
            }
          })
        )
      );

      toast.success(`Successfully marked ${selectedIds.length} conversation(s) as complete`);
      clearSelection();
    } catch (error) {
      toast.error(`Failed to mark conversations as complete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, updateConversationOptimistically, clearSelection]);

  // Add note to selected conversations
  const addNoteToSelected = useCallback(async (note: string) => {
    if (selectedIds.length === 0 || !note.trim()) return;

    setIsProcessing(true);
    
    try {
      // Optimistic updates
      selectedIds.forEach(id => {
        updateConversationOptimistically(id, {
          thread: {
            notes: note
          }
        });
      });

      // Actual API calls
      await Promise.all(
        selectedIds.map(id => 
          apiClient.dbUpdate({
            table_name: 'conversations',
            key_name: 'conversation_id',
            key_value: id,
            update_data: {
              notes: note
            }
          })
        )
      );

      toast.success(`Successfully added note to ${selectedIds.length} conversation(s)`);
      clearSelection();
    } catch (error) {
      toast.error(`Failed to add note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, updateConversationOptimistically, clearSelection]);

  // Mark selected conversations as flagged
  const markSelectedFlagged = useCallback(async () => {
    if (selectedIds.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Optimistic updates
      selectedIds.forEach(id => {
        updateConversationOptimistically(id, {
          thread: {
            flag: true,
            flag_for_review: true
          }
        });
      });

      // Actual API calls
      await Promise.all(
        selectedIds.map(id => 
          apiClient.dbUpdate({
            table_name: 'conversations',
            key_name: 'conversation_id',
            key_value: id,
            update_data: {
              flag: true,
              flag_for_review: true
            }
          })
        )
      );

      toast.success(`Successfully flagged ${selectedIds.length} conversation(s)`);
      clearSelection();
    } catch (error) {
      toast.error(`Failed to flag conversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, updateConversationOptimistically, clearSelection]);

  // Mark selected conversations as spam
  const markSelectedSpam = useCallback(async () => {
    if (selectedIds.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Optimistic updates
      selectedIds.forEach(id => {
        updateConversationOptimistically(id, {
          thread: {
            spam: true
          }
        });
      });

      // Actual API calls
      await Promise.all(
        selectedIds.map(id => 
          apiClient.dbUpdate({
            table_name: 'conversations',
            key_name: 'conversation_id',
            key_value: id,
            update_data: {
              spam: true
            }
          })
        )
      );

      toast.success(`Successfully marked ${selectedIds.length} conversation(s) as spam`);
      clearSelection();
    } catch (error) {
      toast.error(`Failed to mark conversations as spam: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, updateConversationOptimistically, clearSelection]);

  return {
    selectedIds,
    isProcessing,
    selectConversation,
    selectAll,
    clearSelection,
    deleteSelected,
    markSelectedComplete,
    addNoteToSelected,
    markSelectedFlagged,
    markSelectedSpam
  };
} 