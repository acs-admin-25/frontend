import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/api/errorHandling';
import { v4 as uuidv4 } from 'uuid';
import type { ApiResponse } from '@/types/api';
import type { 
  Contact, 
  CreateContactData, 
  UpdateContactData, 
  UseContactOptions,
  ContactFormErrors
} from '@/types/contact';
import type { Conversation } from '@/types/conversation';
import { useContactsData } from '@/lib/hooks/useCentralizedDashboardData';

// Helper functions for contact processing
const determineContactType = (thread: any): "buyer" | "seller" | "investor" | "other" => {
  const summary = (thread.ai_summary || "").toLowerCase();
  const propertyTypes = (thread.preferred_property_types || "").toLowerCase();

  if (summary.includes("buy") || summary.includes("purchase") || propertyTypes.includes("residential")) {
    return "buyer";
  } else if (summary.includes("sell") || summary.includes("listing")) {
    return "seller";
  } else if (summary.includes("invest") || propertyTypes.includes("investment")) {
    return "investor";
  }
  return "other";
};

const determineContactStatus = (thread: any): "client" | "lead" => {
  if (thread.completed || thread.status === 'completed') {
    return "client";
  }
  return "lead";
};

const determineRelationshipStrength = (messageCount: number, lastActivity: number): "strong" | "medium" | "weak" => {
  const daysSinceLastActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
  
  if (messageCount > 10 && daysSinceLastActivity < 7) return "strong";
  if (messageCount > 5 && daysSinceLastActivity < 30) return "medium";
  return "weak";
};

export function useContact(options: UseContactOptions = {}) {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get conversations for unified contact processing
  const { conversations, loading: conversationsLoading, error: conversationsError, refetch: refetchConversations } = useContactsData({
    autoRefresh: options.autoRefresh || false,
    refreshInterval: options.refreshInterval || 30000,
  });

  // Create unified contact data by merging conversations and manual contacts
  const unifiedContacts = useMemo(() => {
    if (!conversations || !contacts) return [];

    const contactMap = new Map<string, any>();
    
    // First, process manual contacts
    contacts.forEach(contact => {
      const linkedConversations = conversations.filter(conv => 
        contact.linkedConversationIds?.includes(conv.thread.conversation_id) ||
        conv.thread.client_email === contact.email
      );
      
      const totalMessages = linkedConversations.reduce((sum, conv) => sum + conv.messages.length, 0);
      const lastActivity = linkedConversations.length > 0 
        ? Math.max(...linkedConversations.map(conv => new Date(conv.thread.lastMessageAt).getTime()))
        : new Date(contact.lastContact).getTime();
      
      contactMap.set(contact.email, {
        contact: {
          ...contact,
          linkedConversationIds: linkedConversations.map(conv => conv.thread.conversation_id),
          primaryConversationId: contact.primaryConversationId || linkedConversations[0]?.thread.conversation_id,
          lastConversationDate: linkedConversations.length > 0 
            ? new Date(Math.max(...linkedConversations.map(conv => new Date(conv.thread.lastMessageAt).getTime()))).toISOString()
            : contact.lastContact,
          totalConversationMessages: totalMessages,
        },
        conversations: linkedConversations,
        totalMessages,
        lastActivity: new Date(lastActivity).toISOString(),
        relationshipStrength: determineRelationshipStrength(totalMessages, lastActivity),
      });
    });

    // Then, process conversations that don't have manual contacts
    conversations.forEach(conversation => {
      const email = conversation.thread.client_email;
      if (!email || contactMap.has(email)) return;

      // Create a contact from conversation data
      const contactFromConversation: Contact = {
        id: conversation.thread.conversation_id,
        name: conversation.thread.lead_name || "Unknown Contact",
        email: email,
        phone: conversation.thread.phone || '',
        location: conversation.thread.location || '',
        type: determineContactType(conversation.thread),
        status: determineContactStatus(conversation.thread),
        lastContact: conversation.thread.lastMessageAt,
        notes: conversation.thread.ai_summary || '',
        conversationCount: 1,
        budgetRange: conversation.thread.budget_range || '',
        propertyTypes: conversation.thread.preferred_property_types || '',
        createdAt: conversation.thread.createdAt,
        updatedAt: conversation.thread.updatedAt,
        userId: session?.user?.email || '',
        isManual: false,
        linkedConversationIds: [conversation.thread.conversation_id],
        primaryConversationId: conversation.thread.conversation_id,
        contactSource: "conversation",
        lastConversationDate: conversation.thread.lastMessageAt,
        totalConversationMessages: conversation.messages.length,
      };

      contactMap.set(email, {
        contact: contactFromConversation,
        conversations: [conversation],
        totalMessages: conversation.messages.length,
        lastActivity: conversation.thread.lastMessageAt,
        relationshipStrength: determineRelationshipStrength(conversation.messages.length, new Date(conversation.thread.lastMessageAt).getTime()),
      });
    });

    return Array.from(contactMap.values()).sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }, [conversations, contacts, session?.user?.email]);

  // Fetch contacts from database
  const fetchContacts = useCallback(async (): Promise<ApiResponse<Contact[]>> => {
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'No user session',
        status: 401
      };
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useContact] Fetching contacts for user:', session.user.email);

      const response = await apiClient.dbSelect({
        table_name: 'ManualContacts',
        index_name: 'associated_account-index',
        key_name: 'associated_account',
        key_value: (session.user as any).id
      });

      console.log('[useContact] Query with associated_account-index:', response);

      if (response.success && response.data) {
        const rawContacts = response.data.items || response.data;
        console.log('[useContact] Raw contacts from database:', rawContacts);

        // Debug: Log the contents of the ManualContacts table
        console.log('[useContact] === MANUAL CONTACTS TABLE CONTENTS ===');
        console.log('[useContact] Total contacts found:', Array.isArray(rawContacts) ? rawContacts.length : 0);
        if (Array.isArray(rawContacts)) {
          rawContacts.forEach((contact: any, index: number) => {
            console.log(`[useContact] Contact ${index + 1}:`, contact);
          });
        }
        console.log('[useContact] === END MANUAL CONTACTS TABLE CONTENTS ===');

        // Transform the raw data to match our Contact interface
        const transformedContacts: Contact[] = (Array.isArray(rawContacts) ? rawContacts : []).map((item: any) => ({
          id: item.id,
          name: item.name || 'Unknown',
          email: item.email || '',
          phone: item.phone || '',
          location: item.location || '',
          type: item.type || 'other',
          status: item.status || 'lead',
          lastContact: item.lastContact || new Date().toISOString(),
          notes: item.notes || '',
          conversationCount: item.conversationCount || 0,
          budgetRange: item.budgetRange || '',
          propertyTypes: item.propertyTypes || '',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          userId: item.userId || (session.user as any).id,
          isManual: true,
          // Add conversation linking fields
          linkedConversationIds: item.linkedConversationIds || [],
          primaryConversationId: item.primaryConversationId || '',
          contactSource: item.contactSource || 'manual',
          lastConversationDate: item.lastConversationDate || '',
          totalConversationMessages: item.totalConversationMessages || 0,
        }));

        console.log('[useContact] Transformed contacts:', transformedContacts);

        setContacts(transformedContacts);
        return {
          success: true,
          data: transformedContacts,
          status: 200
        };
      } else {
        console.error('[useContact] Failed to fetch contacts:', response);
        setError(response.error || 'Failed to fetch contacts');
        return {
          success: false,
          error: response.error || 'Failed to fetch contacts',
          status: response.status || 500
        };
      }
    } catch (error) {
      console.error('[useContact] Error fetching contacts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        status: 500
      };
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Create a new contact
  const createContact = useCallback(async (contactData: CreateContactData): Promise<ApiResponse<Contact>> => {
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'No user session',
        status: 401
      };
    }
    
    const newContact: Contact = {
      id: uuidv4(),
      ...contactData,
      status: contactData.status || 'lead',
      lastContact: new Date().toISOString(),
      conversationCount: 0,
      userId: (session.user as any).id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Initialize conversation linking fields
      linkedConversationIds: contactData.linkedConversationIds || [],
      primaryConversationId: contactData.primaryConversationId || '',
      contactSource: contactData.contactSource || 'manual',
      lastConversationDate: contactData.linkedConversationIds?.length ? new Date().toISOString() : '',
      totalConversationMessages: 0,
    };
    
    try {
      console.log('[useContact] Creating contact with data:', newContact);
      
      const response = await apiClient.dbUpdate({
        table_name: 'ManualContacts',
        index_name: 'id-index',
        key_name: 'id',
        key_value: newContact.id,
        update_data: {
          id: newContact.id,
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone || '',
          location: newContact.location || '',
          type: newContact.type,
          status: newContact.status,
          lastContact: newContact.lastContact,
          notes: newContact.notes || '',
          conversationCount: newContact.conversationCount,
          budgetRange: newContact.budgetRange || '',
          propertyTypes: newContact.propertyTypes || '',
          createdAt: newContact.createdAt,
          updatedAt: newContact.updatedAt,
          // Add new conversation linking fields
          linkedConversationIds: newContact.linkedConversationIds,
          primaryConversationId: newContact.primaryConversationId,
          contactSource: newContact.contactSource,
          lastConversationDate: newContact.lastConversationDate,
          totalConversationMessages: newContact.totalConversationMessages,
        }
      });
      
      console.log('[useContact] Update response:', response);
      
      if (response.success) {
        // Add the new contact to the local state immediately
        setContacts(prev => [...prev, newContact]);
        
        // Force a re-computation of unified contacts by triggering a re-render
        // This ensures the UI updates immediately with the new contact
        setTimeout(() => {
          setContacts(prev => [...prev]); // Trigger re-render
        }, 100);
        
        return {
          success: true,
          data: newContact,
          status: 200
        };
      } else {
        console.error('[useContact] Update failed:', response);
        return {
          success: false,
          error: response.error || 'Failed to create contact',
          status: response.status || 500
        };
      }
    } catch (error) {
      console.error('[useContact] Error creating contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }, [session?.user?.email]);

  // Update an existing contact
  const updateContact = useCallback(async (contactData: UpdateContactData): Promise<ApiResponse<Contact>> => {
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'No user session',
        status: 401
      };
    }
    
    // Find the existing contact to merge with updates
    const existingContact = contacts.find(c => c.id === contactData.id);
    if (!existingContact) {
      return {
        success: false,
        error: 'Contact not found',
        status: 404
      };
    }
    
    const updatedContact: Contact = {
      ...existingContact,
      ...contactData,
      updatedAt: new Date().toISOString(),
      // Preserve conversation linking fields if not provided
      linkedConversationIds: contactData.linkedConversationIds || existingContact.linkedConversationIds,
      primaryConversationId: contactData.primaryConversationId || existingContact.primaryConversationId,
      contactSource: contactData.contactSource || existingContact.contactSource,
      lastConversationDate: contactData.lastConversationDate || existingContact.lastConversationDate,
      totalConversationMessages: contactData.totalConversationMessages || existingContact.totalConversationMessages,
    };
    
    try {
      console.log('[useContact] Updating contact with data:', updatedContact);
      
      const response = await apiClient.dbUpdate({
        table_name: 'ManualContacts',
        index_name: 'id-index',
        key_name: 'id',
        key_value: contactData.id,
        update_data: {
          id: updatedContact.id,
          name: updatedContact.name,
          email: updatedContact.email,
          phone: updatedContact.phone || '',
          location: updatedContact.location || '',
          type: updatedContact.type,
          status: updatedContact.status,
          lastContact: updatedContact.lastContact,
          notes: updatedContact.notes || '',
          conversationCount: updatedContact.conversationCount,
          budgetRange: updatedContact.budgetRange || '',
          propertyTypes: updatedContact.propertyTypes || '',
          createdAt: updatedContact.createdAt,
          updatedAt: updatedContact.updatedAt,
          // Update conversation linking fields
          linkedConversationIds: updatedContact.linkedConversationIds,
          primaryConversationId: updatedContact.primaryConversationId,
          contactSource: updatedContact.contactSource,
          lastConversationDate: updatedContact.lastConversationDate,
          totalConversationMessages: updatedContact.totalConversationMessages,
        }
      });
      
      console.log('[useContact] Update response:', response);
      
      if (response.success) {
        setContacts(prev => prev.map(contact => 
          contact.id === contactData.id ? updatedContact : contact
        ));
        return {
          success: true,
          data: updatedContact,
          status: 200
        };
      } else {
        console.error('[useContact] Update failed:', response);
        return {
          success: false,
          error: response.error || 'Failed to update contact',
          status: response.status || 500
        };
      }
    } catch (error) {
      console.error('[useContact] Error updating contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      };
    }
  }, [session?.user?.email, contacts]);

  // Delete a contact
  const deleteContact = useCallback(async (contactId: string): Promise<ApiResponse<boolean>> => {
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'No user session',
        status: 401
      };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useContact] Deleting contact:', contactId);
      
      const response = await apiClient.dbDelete({
        table_name: 'ManualContacts',
        attribute_name: 'id',
        attribute_value: contactId,
        is_primary_key: true
      });
      
      console.log('[useContact] Delete response:', response);
      
      if (response.success) {
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
        return {
          success: true,
          data: true,
          status: 200
        };
      } else {
        console.error('[useContact] Delete failed:', response);
        return {
          success: false,
          error: response.error || 'Failed to delete contact',
          status: response.status || 500
        };
      }
    } catch (error) {
      console.error('[useContact] Error deleting contact:', error);
      const appError = handleApiError(error);
      setError(appError.message);
      return {
        success: false,
        error: appError.message,
        status: 500
      };
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  // Create a manual contact from a conversation
  const createContactFromConversation = useCallback(async (conversation: Conversation): Promise<Contact | null> => {
    if (!session?.user?.email) return null;

    try {
      setLoading(true);
      setError(null);

      const contactData: CreateContactData = {
        name: conversation.thread.lead_name || "Unknown Contact",
        email: conversation.thread.client_email || '',
        phone: conversation.thread.phone || '',
        location: conversation.thread.location || '',
        type: determineContactType(conversation.thread),
        status: "lead",
        notes: conversation.thread.ai_summary || '',
        budgetRange: conversation.thread.budget_range || '',
        propertyTypes: conversation.thread.preferred_property_types || '',
        linkedConversationIds: [conversation.thread.conversation_id],
        primaryConversationId: conversation.thread.conversation_id,
        contactSource: "conversation",
      };

      const result = await createContact(contactData);
      
      if (result.success && result.data) {
        // Refresh contacts to get the updated list
        await fetchContacts();
        return result.data;
      } else {
        setError(result.error || 'Failed to create contact from conversation');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, createContact, fetchContacts]);

  // Save contact from conversation as verified contact with merging
  const saveContactFromConversation = useCallback(async (conversationContact: Contact): Promise<Contact | null> => {
    if (!session?.user?.email) return null;

    try {
      setLoading(true);
      setError(null);

      // Check if there's already a manual contact with the same email
      const existingManualContact = contacts.find(c => 
        c.email.toLowerCase() === conversationContact.email.toLowerCase() && 
        c.contactSource === 'manual'
      );

      if (existingManualContact) {
        // Merge conversation data with existing manual contact
        const mergedContactData: UpdateContactData = {
          id: existingManualContact.id,
          name: conversationContact.name !== "Unknown Contact" ? conversationContact.name : existingManualContact.name,
          notes: existingManualContact.notes 
            ? `${existingManualContact.notes}\n\n--- From Conversation ---\n${conversationContact.notes || ''}`
            : conversationContact.notes || undefined,
          linkedConversationIds: [
            ...(existingManualContact.linkedConversationIds || []),
            ...(conversationContact.linkedConversationIds || [])
          ],
          contactSource: "merged" as const,
          lastConversationDate: conversationContact.lastConversationDate || conversationContact.lastContact,
          totalConversationMessages: (existingManualContact.totalConversationMessages || 0) + 
                                   (conversationContact.totalConversationMessages || 0),
        };

        const result = await updateContact(mergedContactData);
        
        if (result.success && result.data) {
          await fetchContacts();
          return result.data;
        } else {
          setError(result.error || 'Failed to merge contact with conversation');
          return null;
        }
      } else {
        // Create new verified contact from conversation
        const contactData: CreateContactData = {
          name: conversationContact.name,
          email: conversationContact.email,
          type: conversationContact.type,
          status: "client" as const,
          linkedConversationIds: conversationContact.linkedConversationIds || [],
          contactSource: "manual" as const,
        };

        const result = await createContact(contactData);
        
        if (result.success && result.data) {
          await fetchContacts();
          return result.data;
        } else {
          setError(result.error || 'Failed to create verified contact from conversation');
          return null;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, contacts, createContact, updateContact, fetchContacts]);

  // Link an existing manual contact with a conversation
  const linkContactWithConversation = useCallback(async (
    contactId: string, 
    conversationId: string, 
    linkType: "primary" | "secondary" = "secondary"
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const contact = contacts.find(c => c.id === contactId);
      if (!contact) {
        setError('Contact not found');
        return false;
      }

      const conversation = conversations?.find(c => c.thread.conversation_id === conversationId);
      if (!conversation) {
        setError('Conversation not found');
        return false;
      }

      // Update the contact with the new conversation link
      const updatedLinkedIds = [...(contact.linkedConversationIds || []), conversationId];
      const updatedContact: Contact = {
        ...contact,
        linkedConversationIds: updatedLinkedIds,
        primaryConversationId: linkType === "primary" ? conversationId : contact.primaryConversationId,
        contactSource: contact.contactSource === "manual" ? "merged" : contact.contactSource,
        lastConversationDate: conversation.thread.lastMessageAt,
        totalConversationMessages: (contact.totalConversationMessages || 0) + conversation.messages.length,
      };

      const result = await updateContact(updatedContact);
      
      if (result.success) {
        // Refresh contacts to get the updated list
        await fetchContacts();
        return true;
      } else {
        setError(result.error || 'Failed to link contact with conversation');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [contacts, conversations, updateContact, fetchContacts]);

  // Get all conversations for a specific contact
  const getContactConversations = useCallback((contactEmail: string): Conversation[] => {
    return conversations?.filter(conv => conv.thread.client_email === contactEmail) || [];
  }, [conversations]);

  // Search contacts (unified search across conversations and manual contacts)
  const searchContacts = useCallback((searchTerm: string) => {
    if (!searchTerm) return unifiedContacts;
    
    const term = searchTerm.toLowerCase();
    return unifiedContacts.filter(uc => 
      uc.contact.name.toLowerCase().includes(term) ||
      uc.contact.email.toLowerCase().includes(term) ||
      (uc.contact.phone && uc.contact.phone.includes(term)) ||
      (uc.contact.location && uc.contact.location.toLowerCase().includes(term)) ||
      uc.conversations.some((conv: any) => 
        conv.thread.lead_name?.toLowerCase().includes(term) ||
        conv.messages.some((msg: any) => msg.body.toLowerCase().includes(term))
      )
    );
  }, [unifiedContacts]);

  // Load contacts on mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    // State
    contacts,
    unifiedContacts,
    loading: loading || conversationsLoading,
    error: error || conversationsError,
    
    // Actions
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    createContactFromConversation,
    linkContactWithConversation,
    getContactConversations,
    searchContacts,
    refetchConversations,
    
    // Raw data access
    conversations,
  };
}

// Hook for managing a single contact
export function useSingleContact(contactId: string) {
  const { contacts, updateContact, deleteContact } = useContact();
  const contact = contacts.find(c => c.id === contactId);

  const update = useCallback(async (data: Omit<UpdateContactData, 'id'>) => {
    return await updateContact({ ...data, id: contactId });
  }, [updateContact, contactId]);

  const remove = useCallback(async () => {
    return await deleteContact(contactId);
  }, [deleteContact, contactId]);

  return {
    contact,
    update,
    remove,
  };
}

// Enhanced hook for contact form management
export function useContactForm() {
  const [formData, setFormData] = useState<CreateContactData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    type: 'other',
    status: 'lead',
    notes: '',
    budgetRange: '',
    propertyTypes: '',
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced validation function with flexible budget validation
  const validateForm = useCallback((): boolean => {
    const newErrors: ContactFormErrors = {};

    // Name validation - more specific rules
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods';
    }

    // Email validation - more comprehensive
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g., john@example.com)';
    }

    // Phone validation - enhanced formatting
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid phone number (e.g., (123) 456-7890)';
      }
    }

    // Budget range validation - much more flexible
    if (formData.budgetRange && formData.budgetRange.trim()) {
      const budgetValue = formData.budgetRange.trim();
      
      // Allow various formats: 300k-400k, 300000, 3M, 300,000, $300k, etc.
      const budgetRegex = /^[\$]?[\d,]+[KMB]?\s*[-–—]?\s*[\$]?[\d,]*[KMB]?$/i;
      
      if (!budgetRegex.test(budgetValue)) {
        newErrors.budgetRange = 'Please enter a valid budget (e.g., 300k-400k, 300000, 3M, $300k)';
      } else {
        // Additional check to ensure it's not just text
        const hasNumbers = /\d/.test(budgetValue);
        if (!hasNumbers) {
          newErrors.budgetRange = 'Budget must contain numbers';
        }
      }
    }

    // Property types validation
    if (formData.propertyTypes && formData.propertyTypes.trim()) {
      const propertyRegex = /^[a-zA-Z\s,]+$/;
      if (!propertyRegex.test(formData.propertyTypes.trim())) {
        newErrors.propertyTypes = 'Please use only letters, spaces, and commas';
      }
    }

    // Notes validation - character limit
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Enhanced field update with budget formatting
  const updateField = useCallback((field: keyof CreateContactData, value: string) => {
    let processedValue = value;
    
    // Phone number formatting
    if (field === 'phone' && value) {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      
      // Format as (XXX) XXX-XXXX
      if (digits.length <= 3) {
        processedValue = `(${digits}`;
      } else if (digits.length <= 6) {
        processedValue = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        processedValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
    }
    
    // Email to lowercase
    if (field === 'email') {
      processedValue = value.toLowerCase();
    }
    
    // Property types - only allow letters, spaces, and commas
    if (field === 'propertyTypes') {
      processedValue = value.replace(/[^a-zA-Z\s,]/g, '');
    }
    
    // Budget range - allow flexible input but clean it up
    if (field === 'budgetRange') {
      // Remove any characters that aren't numbers, letters, commas, dashes, or dollar signs
      processedValue = value.replace(/[^\d\w\s,\-\$]/gi, '');
      
      // Convert common abbreviations to uppercase for consistency
      processedValue = processedValue.replace(/\b(k|m|b)\b/gi, (match) => match.toUpperCase());
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Validate single field on blur with flexible budget validation
  const validateField = useCallback((field: keyof CreateContactData) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(formData.name.trim())) {
          newErrors.name = 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
          newErrors.email = 'Please enter a valid email address (e.g., john@example.com)';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'phone':
        if (formData.phone && formData.phone.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
          if (!phoneRegex.test(cleanPhone)) {
            newErrors.phone = 'Please enter a valid phone number (e.g., (123) 456-7890)';
          } else {
            delete newErrors.phone;
          }
        } else {
          delete newErrors.phone;
        }
        break;
        
      case 'budgetRange':
        if (formData.budgetRange && formData.budgetRange.trim()) {
          const budgetValue = formData.budgetRange.trim();
          
          // Flexible budget regex
          const budgetRegex = /^[\$]?[\d,]+[KMB]?\s*[-–—]?\s*[\$]?[\d,]*[KMB]?$/i;
          
          if (!budgetRegex.test(budgetValue)) {
            newErrors.budgetRange = 'Please enter a valid budget (e.g., 300k-400k, 300000, 3M, $300k)';
          } else {
            // Additional check to ensure it's not just text
            const hasNumbers = /\d/.test(budgetValue);
            if (!hasNumbers) {
              newErrors.budgetRange = 'Budget must contain numbers';
            } else {
              delete newErrors.budgetRange;
            }
          }
        } else {
          delete newErrors.budgetRange;
        }
        break;
        
      case 'propertyTypes':
        if (formData.propertyTypes && formData.propertyTypes.trim()) {
          const propertyRegex = /^[a-zA-Z\s,]+$/;
          if (!propertyRegex.test(formData.propertyTypes.trim())) {
            newErrors.propertyTypes = 'Please use only letters, spaces, and commas';
          } else {
            delete newErrors.propertyTypes;
          }
        } else {
          delete newErrors.propertyTypes;
        }
        break;
        
      case 'notes':
        if (formData.notes && formData.notes.length > 500) {
          newErrors.notes = 'Notes cannot exceed 500 characters';
        } else {
          delete newErrors.notes;
        }
        break;
    }
    
    setErrors(newErrors);
  }, [formData, errors]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      type: 'other',
      status: 'lead',
      notes: '',
      budgetRange: '',
      propertyTypes: '',
    });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateForm,
    validateField,
    resetForm,
    setSubmitting,
  };
} 