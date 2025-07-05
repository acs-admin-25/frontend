"use client"

import { useState, useMemo } from "react"
import { X, Edit, Phone, Mail, MapPin, Calendar, User2, Building2, Home, MessageCircle, Link, Plus, BadgeCheck, Target, Sparkles, Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { Contact } from "@/types/contact"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/utils"
import { useContact } from "@/lib/hooks/useContact"
import { toast } from 'react-hot-toast'

interface ContactDetailProfileCardProps {
  contact: Contact
  onClose: () => void
  onEdit: (contact: Contact) => void
}

export function ContactDetailProfileCard({ contact, onClose, onEdit }: ContactDetailProfileCardProps) {
  const [isLinking, setIsLinking] = useState(false)
  
  // Get unified contact data for this contact
  const { unifiedContacts, contacts, createContactFromConversation, linkContactWithConversation, createContact, updateContact, fetchContacts, refetchConversations } = useContact()
  
  // Find the unified contact data for this contact
  const unifiedContact = useMemo(() => {
    return unifiedContacts.find(uc => uc.contact.id === contact.id || uc.contact.email === contact.email)
  }, [unifiedContacts, contact])

  function formatLastContact(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24)
      return `${days} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "buyer":
        return <Home className="h-5 w-5" />
      case "seller":
        return <Building2 className="h-5 w-5" />
      case "investor":
        return <User2 className="h-5 w-5" />
      default:
        return <User2 className="h-5 w-5" />
    }
  }

  function getRelationshipStrengthColor(strength: string) {
    switch (strength) {
      case "strong":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "weak":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  function getContactSourceBadge(source?: string) {
    if (!source) return null
    
    const sourceConfig = {
      conversation: { 
        label: "Chat", 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: <MessageCircle className="h-3 w-3" />,
        title: "From Chat"
      },
      manual: { 
        label: "Verified", 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: <CheckCircle className="h-3 w-3" />,
        title: "Verified Contact"
      },
      merged: { 
        label: "Linked", 
        color: "bg-orange-100 text-orange-800 border-orange-200", 
        icon: <Link className="h-3 w-3" />,
        title: "Linked Contact"
      }
    }
    
    const config = sourceConfig[source as keyof typeof sourceConfig]
    if (!config) return null
    
    return (
      <Badge 
        className={cn("text-sm border flex items-center gap-1", config.color)}
        title={config.title}
      >
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  // Handle creating contact from conversation
  const handleCreateContactFromConversation = async (conversationId: string) => {
    if (!unifiedContact) return
    
    const conversation = unifiedContact.conversations.find((conv: any) => conv.thread.conversation_id === conversationId)
    if (conversation) {
      console.log('🔄 Starting save as verified process from detail modal for:', conversation.thread.lead_name, conversation.thread.client_email)
      
      // Check if there's already a manual contact with the same email
      const existingManualContact = contacts.find(c => 
        c.email.toLowerCase() === conversation.thread.client_email.toLowerCase() && 
        c.contactSource === 'manual'
      )

      let result
      
      if (existingManualContact) {
        console.log('📝 Found existing manual contact, merging...')
        // Merge conversation data with existing manual contact
        const mergedContactData = {
          id: existingManualContact.id,
          name: conversation.thread.lead_name !== "Unknown Contact" ? conversation.thread.lead_name : existingManualContact.name,
          notes: existingManualContact.notes 
            ? `${existingManualContact.notes}\n\n--- From Conversation ---\n${conversation.thread.ai_summary || ''}`
            : conversation.thread.ai_summary || undefined,
          linkedConversationIds: [
            ...(existingManualContact.linkedConversationIds || []),
            conversation.thread.conversation_id
          ],
          contactSource: "merged" as const,
          lastConversationDate: conversation.thread.lastMessageAt,
          totalConversationMessages: (existingManualContact.totalConversationMessages || 0) + conversation.messages.length,
        }

        result = await updateContact(mergedContactData)
        console.log('✅ Contact merged successfully!')
      } else {
        console.log('🆕 Creating new verified contact...')
        // Create a contact object from the conversation data
        const contactData = {
          name: conversation.thread.lead_name || "Unknown Contact",
          email: conversation.thread.client_email || '',
          phone: conversation.thread.phone || '',
          location: conversation.thread.location || '',
          type: 'other' as const, // Will be determined by the save function
          status: 'client' as const, // Save as verified client
          notes: conversation.thread.ai_summary || '',
          budgetRange: conversation.thread.budget_range || '',
          propertyTypes: conversation.thread.preferred_property_types || '',
          linkedConversationIds: [conversation.thread.conversation_id],
          primaryConversationId: conversation.thread.conversation_id,
          contactSource: "manual" as const, // Mark as manual/verified
        }
        
        result = await createContact(contactData)
        console.log('✅ New contact created successfully!')
      }
      
      if (result.success) {
        // Refresh both contacts and conversations to ensure UI updates
        await Promise.all([
          fetchContacts(),
          refetchConversations()
        ])
        
        toast.success(`Contact saved as verified!`, {
          duration: 3000,
          position: 'top-right',
        })
        // Close the modal after successful creation to refresh the view
        onClose()
      } else {
        toast.error('Failed to save contact as verified', {
          duration: 4000,
          position: 'top-right',
        })
      }
    }
  }

  // Handle linking contact with conversation
  const handleLinkContactWithConversation = async (conversationId: string) => {
    setIsLinking(true)
    try {
      const result = await linkContactWithConversation(contact.id, conversationId, "secondary")
      if (result) {
        toast.success('Contact linked with conversation!', {
          duration: 3000,
          position: 'top-right',
        })
      } else {
        toast.error('Failed to link contact with conversation', {
          duration: 4000,
          position: 'top-right',
        })
      }
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {getTypeIcon(contact.type)}
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">{contact.name}</h2>
              <p className="text-sm text-muted-foreground">{contact.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={cn(
              "text-sm border flex items-center gap-1",
              contact.status === "client" 
                ? "bg-blue-100 text-blue-800 border-blue-200" 
                : "bg-yellow-100 text-yellow-800 border-yellow-200"
            )}>
              {contact.status === "client" ? (
                <>
                  <User2 className="h-3 w-3" />
                  CLIENT
                </>
              ) : (
                <>
                  <Target className="h-3 w-3" />
                  LEAD
                </>
              )}
            </Badge>
            
            {getContactSourceBadge(contact.contactSource)}
            
            {unifiedContact && (
              <Badge className={cn("text-sm border", getRelationshipStrengthColor(unifiedContact.relationshipStrength))}>
                {unifiedContact.relationshipStrength}
              </Badge>
            )}
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-card-foreground">{contact.phone}</span>
              </div>
            )}
            
            {contact.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-card-foreground">{contact.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-card-foreground">
                Last contact: {unifiedContact && unifiedContact.conversations.length > 0 
                  ? formatLastContact(unifiedContact.conversations[0].thread.lastMessageAt)
                  : formatLastContact(contact.lastContact)
                }
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-card-foreground">
                {unifiedContact ? unifiedContact.conversations.length : contact.conversationCount} conversation{(unifiedContact ? unifiedContact.conversations.length : contact.conversationCount) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Additional details */}
          {(contact.budgetRange || contact.propertyTypes) && (
            <div className="space-y-3">
              {contact.budgetRange && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Budget Range</h4>
                  <p className="text-card-foreground">{contact.budgetRange}</p>
                </div>
              )}
              
              {contact.propertyTypes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Property Types</h4>
                  <p className="text-card-foreground">{contact.propertyTypes}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
              <p className="text-card-foreground text-sm leading-relaxed">{contact.notes}</p>
            </div>
          )}

          {/* Unified contact information */}
          {unifiedContact && (
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Conversation History</h4>
              
              {unifiedContact.conversations.length > 0 ? (
                <div className="space-y-3">
                  {unifiedContact.conversations.map((conversation: any, index: number) => (
                    <div key={conversation.thread.conversation_id} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-card-foreground">
                          Conversation {index + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {conversation.messages.length} messages
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {conversation.thread.ai_summary || "No summary available"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Last: {formatLastContact(conversation.thread.lastMessageAt)}
                        </span>
                        {!contact.isManual && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCreateContactFromConversation(conversation.thread.conversation_id)}
                            className="h-6 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Save as Verified
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found for this contact</p>
                  {contact.isManual && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* TODO: Show conversation linking modal */}}
                      className="mt-2"
                      disabled={isLinking}
                    >
                      {isLinking ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Link className="h-3 w-3 mr-1" />
                      )}
                      Link Conversation
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={() => onEdit(contact)}
              className="flex-1"
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 