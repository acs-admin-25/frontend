"use client"

import { useState, useEffect, useMemo } from "react"
import { X, Save, Trash2, Phone, Mail, MapPin, User2, Building2, Home, MessageCircle, Link, Plus, BadgeCheck, Target, Sparkles, Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { Contact, CreateContactData } from "@/types/contact"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useContact } from "@/lib/hooks/useContact"
import { useContactForm } from "@/lib/hooks/useContact"
import { useLocation } from "@/lib/hooks/useLocation"
import { toast } from 'react-hot-toast'
import { cn } from "@/lib/utils/utils"

interface ContactEditProfileCardProps {
  contact?: Contact
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateContactData) => Promise<void>
  onDelete?: (contactId: string) => Promise<void>
}

export function ContactEditProfileCard({ 
  contact, 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete 
}: ContactEditProfileCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  
  // Get unified contact data for this contact
  const { unifiedContacts, createContactFromConversation, linkContactWithConversation, createContact } = useContact()
  
  // Find the unified contact data for this contact
  const unifiedContact = useMemo(() => {
    if (!contact) return null
    return unifiedContacts.find(uc => uc.contact.id === contact.id || uc.contact.email === contact.email)
  }, [unifiedContacts, contact])

  // Use location autocomplete hook
  const {
    isDropdownOpen: isLocationDropdownOpen,
    suggestions: locationSuggestions,
    isLoading: isLocationLoading,
    handleLocationChange,
    selectLocation,
    closeDropdown: closeLocationDropdown
  } = useLocation()

  // Use enhanced contact form hook
  const { 
    formData, 
    errors, 
    isSubmitting: formSubmitting,
    updateField, 
    validateForm, 
    validateField,
    resetForm, 
    setSubmitting,
  } = useContactForm()

  // Pre-fill form when editing
  useEffect(() => {
    if (contact && isOpen) {
      // Pre-fill the form with contact data
      Object.keys(formData).forEach((key) => {
        const fieldKey = key as keyof typeof formData
        if (contact[fieldKey] !== undefined) {
          updateField(fieldKey, contact[fieldKey] as string)
        }
      })
    } else if (!contact && isOpen) {
      // Reset form for new contact
      resetForm()
    }
  }, [contact, isOpen, updateField, resetForm])

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
      conversation: { label: "From Chat", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <User2 className="h-3 w-3" /> },
      manual: { label: "Verified", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
      merged: { label: "Linked", color: "bg-orange-100 text-orange-800 border-orange-200", icon: <Link className="h-3 w-3" /> }
    }
    
    const config = sourceConfig[source as keyof typeof sourceConfig]
    if (!config) return null
    
    return (
      <Badge className={cn("text-xs border flex items-center gap-1", config.color)}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        duration: 3000,
        position: 'top-right',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      toast.success(contact ? 'Contact updated successfully!' : 'Contact created successfully!', {
        duration: 3000,
        position: 'top-right',
      })
      onClose()
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error('Failed to save contact. Please try again.', {
        duration: 4000,
        position: 'top-right',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!contact || !onDelete) return
    
    setIsSubmitting(true)
    try {
      await onDelete(contact.id)
      toast.success('Contact deleted successfully!', {
        duration: 3000,
        position: 'top-right',
      })
      onClose()
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast.error('Failed to delete contact. Please try again.', {
        duration: 4000,
        position: 'top-right',
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Handle creating contact from conversation
  const handleCreateContactFromConversation = async (conversationId: string) => {
    if (!unifiedContact) return
    
    const conversation = unifiedContact.conversations.find((conv: any) => conv.thread.conversation_id === conversationId)
    if (conversation) {
      // Create a contact object from the conversation data
      const contactData = {
        name: conversation.thread.lead_name || "Unknown Contact",
        email: conversation.thread.client_email,
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
      
      const result = await createContact(contactData)
      if (result.success) {
        toast.success(`Contact saved as verified!`, {
          duration: 3000,
          position: 'top-right',
        })
        onClose() // Close the modal after successful creation
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
    if (!contact) return
    
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              {contact ? 'Edit Contact' : 'New Contact'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {contact ? 'Update contact information' : 'Add a new contact to your database'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Unified contact information (if editing) */}
          {contact && unifiedContact && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                {getContactSourceBadge(contact.contactSource)}
                <Badge className={cn("text-xs border", getRelationshipStrengthColor(unifiedContact.relationshipStrength))}>
                  {unifiedContact.relationshipStrength}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Conversations:</span>
                  <span className="ml-2 text-card-foreground">{unifiedContact.conversations.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Contact:</span>
                  <span className="ml-2 text-card-foreground">
                    {unifiedContact.conversations.length > 0 
                      ? formatLastContact(unifiedContact.conversations[0].thread.lastMessageAt)
                      : formatLastContact(contact.lastContact)
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    onBlur={() => validateField('name')}
                    className={cn(
                      "w-full",
                      errors.name && "border-status-error focus:border-status-error"
                    )}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="text-xs text-status-error mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => validateField('email')}
                    className={cn(
                      "w-full",
                      errors.email && "border-status-error focus:border-status-error"
                    )}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-xs text-status-error mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      updateField('location', e.target.value)
                      handleLocationChange(e.target.value)
                    }}
                    className="w-full"
                    placeholder="Enter city, state, or country"
                  />
                  
                  {/* Location suggestions dropdown */}
                  {isLocationDropdownOpen && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            selectLocation(suggestion)
                            updateField('location', suggestion.display_name)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm"
                        >
                          <div className="font-medium text-card-foreground">
                            {suggestion.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {suggestion.display_name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {isLocationLoading && (
                    <div className="absolute right-3 top-8">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
                Contact Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-midnight-700 focus:border-midnight-700 text-card-foreground bg-background"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="investor">Investor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-midnight-700 focus:border-midnight-700 text-card-foreground bg-background"
                  >
                    <option value="lead">Lead</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Budget Range
                  </label>
                  <Input
                    type="text"
                    value={formData.budgetRange}
                    onChange={(e) => updateField('budgetRange', e.target.value)}
                    className="w-full"
                    placeholder="e.g., $200k - $500k"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Property Types
                  </label>
                  <Input
                    type="text"
                    value={formData.propertyTypes}
                    onChange={(e) => updateField('propertyTypes', e.target.value)}
                    className="w-full"
                    placeholder="e.g., Single-family, Condo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full min-h-[100px]"
                  placeholder="Add any additional notes about this contact..."
                />
              </div>
            </div>

            {/* Unified contact information (if editing) */}
            {contact && unifiedContact && unifiedContact.conversations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
                  Linked Conversations
                </h3>
                
                <div className="space-y-3">
                  {unifiedContact.conversations.map((conversation, index) => (
                    <div key={conversation.thread.conversation_id} className="bg-muted/30 rounded-lg p-3">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {contact && onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-status-error border-status-error hover:bg-status-error/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || formSubmitting}
                className="flex-1"
              >
                {isSubmitting || formSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {contact ? 'Update Contact' : 'Create Contact'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-card rounded-xl border border-border shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-status-error/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-status-error" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Delete Contact</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-background-muted rounded-lg">
                <p className="text-card-foreground font-medium">{contact?.name}</p>
                <p className="text-sm text-muted-foreground">{contact?.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-card-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-status-error text-white rounded-lg hover:bg-status-error/90 transition-colors font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Delete Contact'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 