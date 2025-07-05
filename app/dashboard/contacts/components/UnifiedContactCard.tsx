"use client"

import { useState } from "react"
import { Edit, Trash2, MessageCircle, User2, Building2, Home, Link, Unlink, Plus, Calendar, Phone, Mail, MapPin } from "lucide-react"
import type { UnifiedContactData } from "@/types/contact"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/utils"

interface UnifiedContactCardProps {
  unifiedContact: UnifiedContactData
  onEdit: (contact: UnifiedContactData) => void
  onDelete: (contactId: string) => void
  onClick: (contact: UnifiedContactData) => void
  onCreateContact?: (conversationId: string) => void
  onLinkContact?: (contactId: string, conversationId: string) => void
}

export function UnifiedContactCard({ 
  unifiedContact, 
  onEdit, 
  onDelete, 
  onClick,
  onCreateContact,
  onLinkContact
}: UnifiedContactCardProps) {
  const [showActions, setShowActions] = useState(false)
  const { contact, conversations, totalMessages, lastActivity, relationshipStrength } = unifiedContact
  
  function formatLastActivity(dateString: string): string {
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
        return <Home className="h-4 w-4" />
      case "seller":
        return <Building2 className="h-4 w-4" />
      case "investor":
        return <User2 className="h-4 w-4" />
      default:
        return <User2 className="h-4 w-4" />
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
      conversation: { label: "From Chat", color: "bg-blue-100 text-blue-800 border-blue-200" },
      manual: { label: "Manual", color: "bg-purple-100 text-purple-800 border-purple-200" },
      merged: { label: "Linked", color: "bg-orange-100 text-orange-800 border-orange-200" }
    }
    
    const config = sourceConfig[source as keyof typeof sourceConfig]
    if (!config) return null
    
    return (
      <Badge className={cn("text-xs border", config.color)}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onClick(unifiedContact)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header with name and action buttons */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getTypeIcon(contact.type)}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate text-sm">{contact.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
          </div>
        </div>
        
        {/* Action buttons and relationship strength */}
        <div className={cn(
          "flex items-center gap-2 flex-shrink-0 transition-opacity",
          showActions ? "opacity-100" : "opacity-0"
        )}>
          {/* Relationship strength badge - always visible */}
          <Badge className={cn("text-xs border", getRelationshipStrengthColor(relationshipStrength))}>
            {relationshipStrength}
          </Badge>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(unifiedContact)
            }}
            className="p-1 bg-background/80 backdrop-blur-sm rounded hover:bg-background transition-colors"
            title="Edit contact"
          >
            <Edit className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(contact.id)
            }}
            className="p-1 bg-background/80 backdrop-blur-sm rounded hover:bg-background transition-colors"
            title="Delete contact"
          >
            <Trash2 className="w-3 h-3 text-status-error" />
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2 mb-3">
        {contact.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span className="truncate">{contact.phone}</span>
          </div>
        )}
        {contact.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{contact.location}</span>
          </div>
        )}
      </div>

      {/* Status and badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge className={cn(
          "text-xs border",
          contact.status === "client" 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-yellow-100 text-yellow-800 border-yellow-200"
        )}>
          {contact.status}
        </Badge>
        
        {getContactSourceBadge(contact.contactSource)}
      </div>

      {/* Conversation info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatLastActivity(lastActivity)}</span>
          </div>
        </div>
        
        {conversations.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {totalMessages} total messages
          </div>
        )}
      </div>

      {/* Action buttons for conversation linking */}
      {conversations.length > 0 && !contact.isManual && onCreateContact && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCreateContact(contact.primaryConversationId || conversations[0].thread.conversation_id)
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-xs font-medium"
          >
            <Plus className="w-3 h-3" />
            Save as Verified
          </button>
        </div>
      )}

      {contact.isManual && conversations.length === 0 && onLinkContact && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={(e) => {
              e.stopPropagation()
              // This would need to be implemented to show available conversations to link
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-xs font-medium"
          >
            <Link className="w-3 h-3" />
            Link Conversation
          </button>
        </div>
      )}
    </div>
  )
} 