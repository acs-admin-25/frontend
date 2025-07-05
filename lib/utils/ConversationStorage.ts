/**
 * File: lib/storage/ConversationStorage.ts
 * Purpose: Centralized persistent storage and optimistic updates for conversations
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.0.0
 */

import type { Conversation, Message } from '@/types/conversation';

interface StorageMetadata {
  version: string;
  lastUpdated: string;
  userId: string;
  conversationCount: number;
}

interface StorageData {
  conversations: Conversation[];
  metadata: StorageMetadata;
}

export class ConversationStorage {
  private static instance: ConversationStorage;
  private storageKey = 'acs_conversations';
  private metadataKey = 'acs_conversations_metadata';
  private currentUserId: string | null = null;

  private constructor() {}

  static getInstance(): ConversationStorage {
    if (!ConversationStorage.instance) {
      ConversationStorage.instance = new ConversationStorage();
    }
    return ConversationStorage.instance;
  }

  /**
   * Initialize storage for a specific user
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Restore Date objects from stored data
   * This is necessary because JSON serialization converts Date objects to strings
   */
  private restoreDateObjects(conversations: any[]): Conversation[] {
    return conversations.map(conversation => ({
      ...conversation,
      messages: (conversation.messages || []).map((message: any) => ({
        ...message,
        localDate: message.localDate ? new Date(message.localDate) : new Date()
      }))
    }));
  }

  /**
   * Store conversations with metadata
   */
  storeConversations(conversations: Conversation[]): void {
    if (!this.currentUserId) {
      console.warn('[ConversationStorage] No user ID set, cannot store conversations');
      return;
    }

    try {
      const metadata: StorageMetadata = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        userId: this.currentUserId,
        conversationCount: conversations.length
      };

      const storageData: StorageData = {
        conversations,
        metadata
      };

      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
      console.log(`[ConversationStorage] Stored ${conversations.length} conversations for user ${this.currentUserId}`);
    } catch (error) {
      console.error('[ConversationStorage] Error storing conversations:', error);
    }
  }

  /**
   * Retrieve conversations from storage
   */
  getConversations(): Conversation[] | null {
    if (!this.currentUserId) {
      console.warn('[ConversationStorage] No user ID set, cannot retrieve conversations');
      return null;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;

      const data: StorageData = JSON.parse(stored);
      
      // Verify the data belongs to the current user
      if (data.metadata.userId !== this.currentUserId) {
        console.warn('[ConversationStorage] Stored data belongs to different user, clearing');
        this.clear();
        return null;
      }

      // Restore Date objects from stored data
      const restoredConversations = this.restoreDateObjects(data.conversations);
      
      console.log(`[ConversationStorage] Retrieved ${restoredConversations.length} conversations for user ${this.currentUserId}`);
      return restoredConversations;
    } catch (error) {
      console.error('[ConversationStorage] Error retrieving conversations:', error);
      return null;
    }
  }

  /**
   * Get storage metadata
   */
  getMetadata(): StorageMetadata | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;

      const data: StorageData = JSON.parse(stored);
      return data.metadata;
    } catch (error) {
      console.error('[ConversationStorage] Error retrieving metadata:', error);
      return null;
    }
  }

  /**
   * Optimistically update a single conversation
   */
  updateConversation(conversationId: string, updates: Partial<Conversation>): boolean {
    try {
      const conversations = this.getConversations();
      if (!conversations) return false;

      const index = conversations.findIndex(conv => conv.thread.conversation_id === conversationId);
      if (index === -1) return false;

      // Apply optimistic update
      conversations[index] = { ...conversations[index], ...updates };
      
      // Store updated conversations
      this.storeConversations(conversations);
      
      console.log(`[ConversationStorage] Optimistically updated conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('[ConversationStorage] Error updating conversation:', error);
      return false;
    }
  }

  /**
   * Optimistically update multiple conversations
   */
  updateConversations(updates: Array<{ conversationId: string; updates: Partial<Conversation> }>): boolean {
    try {
      const conversations = this.getConversations();
      if (!conversations) return false;

      let hasChanges = false;
      
      updates.forEach(({ conversationId, updates }) => {
        const index = conversations.findIndex(conv => conv.thread.conversation_id === conversationId);
        if (index !== -1) {
          conversations[index] = { ...conversations[index], ...updates };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        this.storeConversations(conversations);
        console.log(`[ConversationStorage] Optimistically updated ${updates.length} conversations`);
      }

      return hasChanges;
    } catch (error) {
      console.error('[ConversationStorage] Error updating conversations:', error);
      return false;
    }
  }

  /**
   * Add a new conversation
   */
  addConversation(conversation: Conversation): boolean {
    try {
      const conversations = this.getConversations() || [];
      
      // Check if conversation already exists
      const exists = conversations.some(conv => conv.thread.conversation_id === conversation.thread.conversation_id);
      if (exists) {
        console.warn(`[ConversationStorage] Conversation ${conversation.thread.conversation_id} already exists`);
        return false;
      }

      conversations.push(conversation);
      this.storeConversations(conversations);
      
      console.log(`[ConversationStorage] Added new conversation ${conversation.thread.conversation_id}`);
      return true;
    } catch (error) {
      console.error('[ConversationStorage] Error adding conversation:', error);
      return false;
    }
  }

  /**
   * Remove a conversation
   */
  removeConversation(conversationId: string): boolean {
    try {
      const conversations = this.getConversations();
      if (!conversations) return false;

      const filtered = conversations.filter(conv => conv.thread.conversation_id !== conversationId);
      
      if (filtered.length === conversations.length) {
        console.warn(`[ConversationStorage] Conversation ${conversationId} not found for removal`);
        return false;
      }

      this.storeConversations(filtered);
      console.log(`[ConversationStorage] Removed conversation ${conversationId}`);
      return true;
    } catch (error) {
      console.error('[ConversationStorage] Error removing conversation:', error);
      return false;
    }
  }

  /**
   * Get a specific conversation by ID
   */
  getConversation(conversationId: string): Conversation | null {
    try {
      const conversations = this.getConversations();
      if (!conversations) return null;

      return conversations.find(conv => conv.thread.conversation_id === conversationId) || null;
    } catch (error) {
      console.error('[ConversationStorage] Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Check if storage has data for current user
   */
  hasData(): boolean {
    if (!this.currentUserId) return false;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return false;

      const data: StorageData = JSON.parse(stored);
      return data.metadata.userId === this.currentUserId;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if stored data is stale (older than specified minutes)
   */
  isStale(maxAgeMinutes: number = 30): boolean {
    try {
      const metadata = this.getMetadata();
      if (!metadata) return true;

      const lastUpdated = new Date(metadata.lastUpdated);
      const now = new Date();
      const ageInMinutes = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);

      return ageInMinutes > maxAgeMinutes;
    } catch (error) {
      return true;
    }
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.metadataKey);
      console.log('[ConversationStorage] Cleared all stored data');
    } catch (error) {
      console.error('[ConversationStorage] Error clearing data:', error);
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): { hasData: boolean; isStale: boolean; conversationCount: number; lastUpdated: string | null } {
    const metadata = this.getMetadata();
    return {
      hasData: this.hasData(),
      isStale: this.isStale(),
      conversationCount: metadata?.conversationCount || 0,
      lastUpdated: metadata?.lastUpdated || null
    };
  }
}

// Export singleton instance
export const conversationStorage = ConversationStorage.getInstance(); 