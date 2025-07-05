/**
 * Contact-related TypeScript interfaces and types
 * Used for contact management throughout the application
 */

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  type: "buyer" | "seller" | "investor" | "other";
  status: "client" | "lead";
  lastContact: string;
  notes?: string;
  conversationCount: number;
  budgetRange?: string;
  propertyTypes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isManual?: boolean; // Flag to distinguish manual contacts
  
  // New fields for conversation linking
  linkedConversationIds?: string[]; // Array of conversation IDs linked to this contact
  primaryConversationId?: string; // The main conversation ID for this contact
  contactSource?: "conversation" | "manual" | "merged"; // How this contact was created
  lastConversationDate?: string; // Date of the most recent conversation
  totalConversationMessages?: number; // Total messages across all conversations
}

export interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  type: "buyer" | "seller" | "investor" | "other";
  status?: "client" | "lead";
  notes?: string;
  budgetRange?: string;
  propertyTypes?: string;
  
  // New fields for conversation linking
  linkedConversationIds?: string[];
  primaryConversationId?: string;
  contactSource?: "conversation" | "manual" | "merged";
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string;
  lastConversationDate?: string;
  totalConversationMessages?: number;
}

export interface UseContactOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface ContactFormData extends CreateContactData {
  // Additional form-specific fields if needed
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  type?: string;
  status?: string;
  notes?: string;
  budgetRange?: string;
  propertyTypes?: string;
  linkedConversationIds?: string;
  primaryConversationId?: string;
  contactSource?: string;
}

// New interfaces for contact-conversation relationships
export interface ContactConversationLink {
  contactId: string;
  conversationId: string;
  linkedAt: string;
  linkType: "primary" | "secondary";
}

export interface UnifiedContactData {
  contact: Contact;
  conversations: any[]; // Array of conversation objects
  totalMessages: number;
  lastActivity: string;
  relationshipStrength: "strong" | "medium" | "weak"; // Based on interaction frequency
} 