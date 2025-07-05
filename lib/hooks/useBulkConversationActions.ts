/**
 * File: hooks/useBulkConversationActions.ts
 * Purpose: Custom hook for bulk conversation actions with optimistic updates
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.0.0
 */

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { ProcessedConversation } from '@/lib/api/conversations';

export interface BulkActionsState {
  selectedIds: string[];
  isDeleting: boolean;
  isAddingNote: boolean;
  isUpdatingStatus: boolean;
  error: string | null;
}

export interface BulkActionsReturn extends BulkActionsState {
  selectConversation: (id: string) => void;
  selectAll: (conversations: ProcessedConversation[]) => void;
  clearSelection: () => void;
  deleteSelected: () => Promise<boolean>;
  addNoteToSelected: (note: string) => Promise<boolean>;
  markSelectedComplete: () => Promise<boolean>;
  updateSelectedStatus: (status: string) => Promise<boolean>;
  getSelectedCount: () => number;
}

export function useBulkConversationActions(
  conversations: ProcessedConversation[],
  onUpdate: (updatedConversations: ProcessedConversation[]) => void
): BulkActionsReturn {
  const [state, setState] = useState<BulkActionsState>({
    selectedIds: [],
    isDeleting: false,
    isAddingNote: false,
    isUpdatingStatus: false,
    error: null
  });

  const selectConversation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedIds, id],
      error: null
    }));
  }, []);

  const selectAll = useCallback((conversations: ProcessedConversation[]) => {
    const allIds = conversations.map(c => c.thread.conversation_id);
    setState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.length === allIds.length ? [] : allIds,
      error: null
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIds: [],
      error: null
    }));
  }, []);

  const getSelectedCount = useCallback(() => {
    return state.selectedIds.length;
  }, [state.selectedIds]);

  const deleteSelected = useCallback(async (): Promise<boolean> => {
    if (state.selectedIds.length === 0) return false;

    setState(prev => ({ ...prev, isDeleting: true, error: null }));

    try {
      // Optimistic update - remove selected conversations
      const updatedConversations = conversations.filter(
        c => !state.selectedIds.includes(c.thread.conversation_id)
      );
      onUpdate(updatedConversations);

      // Perform actual deletion
      const deletePromises = state.selectedIds.map(id => apiClient.deleteThread(id));
      const results = await Promise.allSettled(deletePromises);

      // Check for failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some deletions failed:', failures);
        // Could implement partial rollback here if needed
      }

      // Clear selection on success
      setState(prev => ({
        ...prev,
        selectedIds: [],
        isDeleting: false
      }));

      return failures.length === 0;
    } catch (error) {
      console.error('Bulk delete failed:', error);
      setState(prev => ({
        ...prev,
        isDeleting: false,
        error: 'Failed to delete selected conversations'
      }));
      return false;
    }
  }, [state.selectedIds, conversations, onUpdate]);

  const addNoteToSelected = useCallback(async (note: string): Promise<boolean> => {
    if (state.selectedIds.length === 0 || !note.trim()) return false;

    setState(prev => ({ ...prev, isAddingNote: true, error: null }));

    try {
      // Optimistic update - add note to selected conversations
      const updatedConversations = conversations.map(conversation => {
        if (state.selectedIds.includes(conversation.thread.conversation_id)) {
          return {
            ...conversation,
            thread: {
              ...conversation.thread,
              notes: note // Assuming notes field exists in thread
            }
          };
        }
        return conversation;
      });
      onUpdate(updatedConversations);

      // Perform actual note addition
      const updatePromises = state.selectedIds.map(id => 
        apiClient.dbUpdate({
          table_name: 'Threads',
          index_name: 'conversation_id-index',
          key_name: 'conversation_id',
          key_value: id,
          update_data: { notes: note }
        })
      );
      
      const results = await Promise.allSettled(updatePromises);
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        console.error('Some note additions failed:', failures);
      }

      setState(prev => ({
        ...prev,
        selectedIds: [],
        isAddingNote: false
      }));

      return failures.length === 0;
    } catch (error) {
      console.error('Bulk note addition failed:', error);
      setState(prev => ({
        ...prev,
        isAddingNote: false,
        error: 'Failed to add note to selected conversations'
      }));
      return false;
    }
  }, [state.selectedIds, conversations, onUpdate]);

  const markSelectedComplete = useCallback(async (): Promise<boolean> => {
    if (state.selectedIds.length === 0) return false;

    setState(prev => ({ ...prev, isUpdatingStatus: true, error: null }));

    try {
      // Optimistic update - mark selected conversations as completed
      const updatedConversations = conversations.map(conversation => {
        if (state.selectedIds.includes(conversation.thread.conversation_id)) {
          return {
            ...conversation,
            thread: {
              ...conversation.thread,
              completed: true
            },
            status: 'completed' as const
          };
        }
        return conversation;
      });
      onUpdate(updatedConversations);

      // Perform actual status update
      const updatePromises = state.selectedIds.map(id => 
        apiClient.dbUpdate({
          table_name: 'Threads',
          index_name: 'conversation_id-index',
          key_name: 'conversation_id',
          key_value: id,
          update_data: { completed: true }
        })
      );
      
      const results = await Promise.allSettled(updatePromises);
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        console.error('Some status updates failed:', failures);
      }

      setState(prev => ({
        ...prev,
        selectedIds: [],
        isUpdatingStatus: false
      }));

      return failures.length === 0;
    } catch (error) {
      console.error('Bulk status update failed:', error);
      setState(prev => ({
        ...prev,
        isUpdatingStatus: false,
        error: 'Failed to update status of selected conversations'
      }));
      return false;
    }
  }, [state.selectedIds, conversations, onUpdate]);

  const updateSelectedStatus = useCallback(async (status: string): Promise<boolean> => {
    if (state.selectedIds.length === 0) return false;

    setState(prev => ({ ...prev, isUpdatingStatus: true, error: null }));

    try {
      // Determine the update data based on status
      let updateData: any = {};
      switch (status) {
        case 'active':
          updateData = { completed: false, flag: false, flag_for_review: false, spam: false, busy: false };
          break;
        case 'pending':
          updateData = { busy: true, completed: false };
          break;
        case 'completed':
          updateData = { completed: true };
          break;
        case 'flagged':
          updateData = { flag: true, flag_for_review: true };
          break;
        case 'spam':
          updateData = { spam: true };
          break;
        default:
          throw new Error(`Unknown status: ${status}`);
      }

      // Optimistic update
      const updatedConversations = conversations.map(conversation => {
        if (state.selectedIds.includes(conversation.thread.conversation_id)) {
          return {
            ...conversation,
            thread: {
              ...conversation.thread,
              ...updateData
            },
            status: status as 'active' | 'pending' | 'completed' | 'flagged' | 'spam'
          };
        }
        return conversation;
      });
      onUpdate(updatedConversations);

      // Perform actual status updates
      const updatePromises = state.selectedIds.map(id => 
        apiClient.dbUpdate({
          table_name: 'Threads',
          index_name: 'conversation_id-index',
          key_name: 'conversation_id',
          key_value: id,
          update_data: updateData
        })
      );
      
      const results = await Promise.allSettled(updatePromises);
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        console.error('Some status updates failed:', failures);
      }

      setState(prev => ({
        ...prev,
        selectedIds: [],
        isUpdatingStatus: false
      }));

      return failures.length === 0;
    } catch (error) {
      console.error('Bulk status update failed:', error);
      setState(prev => ({
        ...prev,
        isUpdatingStatus: false,
        error: 'Failed to update status of selected conversations'
      }));
      return false;
    }
  }, [state.selectedIds, conversations, onUpdate]);

  return {
    ...state,
    selectConversation,
    selectAll,
    clearSelection,
    deleteSelected,
    addNoteToSelected,
    markSelectedComplete,
    updateSelectedStatus,
    getSelectedCount
  };
} 