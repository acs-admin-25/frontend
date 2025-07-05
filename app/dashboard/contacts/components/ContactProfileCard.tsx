"use client"

import { Edit, Trash2, MessageCircle, User2, CheckCircle, Link } from "lucide-react"
import { useMemo } from "react"
import type { Contact } from "@/types/contact"
import { useContact } from "@/lib/hooks/useContact"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/utils"

interface ContactProfileCardProps {
  contact: Contact
  onEdit: (contact: Contact) => void
  onDelete: (contactId: string) => void
  onClick: (contact: Contact) => void
}

export function ContactProfileCard({ 
  contact, 
  onEdit, 
  onDelete, 
  onClick 
}: ContactProfileCardProps) {
  
  // Get unified contact data for this contact
  const { unifiedContacts } = useContact()
  
  // Find the unified contact data for this contact
  const unifiedContact = useMemo(() => {
    return unifiedContacts.find(uc => uc.contact.id === contact.id || uc.contact.email === contact.email)
  }, [unifiedContacts, contact])

  // Use the most up-to-date contact data from unified contacts if available
  const currentContact = useMemo(() => {
    return unifiedContact?.contact || contact
  }, [unifiedContact, contact])
  
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

  // Get the most accurate last contact time
  const lastContactTime = useMemo(() => {
    if (unifiedContact && unifiedContact.conversations.length > 0) {
      // Use the most recent conversation's last message time
      const mostRecentConversation = unifiedContact.conversations.reduce((latest: any, current: any) => {
        const latestTime = new Date(latest.thread.lastMessageAt).getTime()
        const currentTime = new Date(current.thread.lastMessageAt).getTime()
        return currentTime > latestTime ? current : latest
      })
      return formatLastContact(mostRecentConversation.thread.lastMessageAt)
    }
    // Fall back to contact's lastContact
    return formatLastContact(currentContact.lastContact)
  }, [unifiedContact, currentContact.lastContact])

  // Get contact source icon
  const getContactSourceIcon = () => {
    if (!currentContact.contactSource) return null
    
    // Debug: Log contact source changes
    console.log(`[ContactProfileCard] Contact ${currentContact.name} (${currentContact.email}) has source: ${currentContact.contactSource}`)
    
    const sourceConfig = {
      conversation: { 
        icon: <MessageCircle className="h-3 w-3 text-blue-600" />,
        title: "From Chat"
      },
      manual: { 
        icon: <CheckCircle className="h-3 w-3 text-green-600" />,
        title: "Verified Contact"
      },
      merged: { 
        icon: <Link className="h-3 w-3 text-orange-600" />,
        title: "Linked Contact"
      }
    }
    
    const config = sourceConfig[currentContact.contactSource as keyof typeof sourceConfig]
    if (!config) return null
    
    return (
      <div title={config.title} className="flex-shrink-0">
        {config.icon}
      </div>
    )
  }

  // Get relationship strength indicator
  const getRelationshipStrengthIndicator = () => {
    if (!unifiedContact) return null
    
    const strength = unifiedContact.relationshipStrength
    const strengthConfig = {
      strong: { color: "bg-green-500", label: "Strong" },
      medium: { color: "bg-yellow-500", label: "Medium" },
      weak: { color: "bg-gray-400", label: "Weak" }
    }
    
    const config = strengthConfig[strength as keyof typeof strengthConfig]
    if (!config) return null
    
    return (
      <div className="flex items-center gap-1">
        <div className={cn("w-2 h-2 rounded-full", config.color)} title={config.label} />
        <span className="text-xs text-muted-foreground">{unifiedContact.conversations.length} conv</span>
      </div>
    )
  }

  return (
    <div
      className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(contact)}
    >
      {/* Name, contact source icon, and action buttons on one line */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-sm">{currentContact.name}</h3>
          {getContactSourceIcon()}
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Action buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(contact)
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

      {/* Simplified contact info */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground truncate">{currentContact.email}</p>
        {currentContact.phone && (
          <p className="text-xs text-muted-foreground truncate">{currentContact.phone}</p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {lastContactTime}
          </p>
          {getRelationshipStrengthIndicator()}
        </div>
      </div>
    </div>
  )
} 