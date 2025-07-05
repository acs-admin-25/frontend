/**
 * =================================================================
 * SINGLE SOURCE OF TRUTH FOR CONVERSATION-RELATED TYPES
 * =================================================================
 * All frontend components and hooks should rely on these types.
 * The `processThreadsResponse` function in `lib/utils/api.ts` is
 * responsible for transforming raw API data into these shapes.
 */

/**
 * Represents a single message within a conversation.
 * Contains all possible fields for a message object.
 */
export interface Message {
  // Core Identifiers
  id: string;
  conversation_id: string;
  response_id?: string;
  
  // Sender/Recipient
  sender_name: string;
  sender_email: string;
  sender?: string;
  recipient?: string;
  receiver?: string;

  // Content
  body: string;
  content?: string;
  subject?: string;
  
  // Metadata
  timestamp: string;
  localDate: Date; // Processed local time date object
  type: "inbound-email" | "outbound-email";
  read: boolean;

  // AI & Analysis
  ev_score?: number;

  // Additional fields
  associated_account?: string;
  in_reply_to?: string | null;
  is_first_email?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Extended message type for UI components that need additional display properties
 */
export interface ExtendedMessage extends Message {
  // UI-specific properties
  isSelected?: boolean;
  isEditing?: boolean;
  showActions?: boolean;
  // Add any other UI-specific properties here
}

/**
 * Represents the thread of a conversation.
 * Contains all possible fields for a thread object.
 */
export interface Thread {
  // Core Identifiers
  id: string;
  conversation_id: string;
  associated_account: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;

  // Contact Details
  lead_name?: string;
  client_email?: string;
  phone?: string;
  location?: string;
  source_name?: string;

  // AI & LCP
  ai_summary?: string;
  lcp_enabled: boolean;
  lcp_flag_threshold?: number;

  // Status Flags
  flag: boolean;
  flag_for_review: boolean;
  flag_review_override: boolean;
  spam: boolean;
  busy: boolean;
  read: boolean;
  completed: boolean;
  
  // Extracted Information
  budget_range?: string;
  timeline?: string;
  preferred_property_types?: string;
  priority?: string;
  subject?: string;

  // Calculated UI fields
  aiScore: number | null;
}

/**
 * Alias for Thread to maintain backward compatibility
 * @deprecated Use Thread instead
 */
export type ConversationThread = Thread;

/**
 * The canonical representation of a conversation on the frontend.
 * This is the primary type that should be passed between components.
 */
export interface Conversation {
  thread: Thread;
  messages: Message[];
} 