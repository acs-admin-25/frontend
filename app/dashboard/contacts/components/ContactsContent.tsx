"use client"

import { Search, Calendar, Plus, Phone, Mail, User2, Building2, Home, X, Edit, Trash2, AlertTriangle, Save, CheckCircle, Info, MapPin, Loader2, Sparkles, BadgeCheck, Target } from "lucide-react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useContact } from "@/lib/hooks/useContact"
import { useContactForm } from "@/lib/hooks/useContact"
import { useLocation } from "@/lib/hooks/useLocation"
import type { Contact, CreateContactData, UnifiedContactData } from "@/types/contact"
import type { LocationSuggestion } from "@/types/location"
import { LoadingSpinner } from "@/components/common/Feedback/LoadingSpinner"
import { ErrorBoundary } from "@/components/common/Feedback/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/utils"
import { toast } from 'react-hot-toast'
import { ContactProfileCard } from "@/app/dashboard/contacts/components/ContactProfileCard"
import { ContactDetailProfileCard } from "@/app/dashboard/contacts/components/ContactDetailProfileCard"
import { ContactEditProfileCard } from "@/app/dashboard/contacts/components/ContactEditProfileCard"

export default function ContactsContent() {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const [showNewContactModal, setShowNewContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false)
  const [savedContactName, setSavedContactName] = useState('')
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  // Use enhanced contact hook with unified functionality
  const { 
    contacts,
    unifiedContacts,
    loading,
    error,
    createContactFromConversation,
    linkContactWithConversation,
    getContactConversations,
    searchContacts,
    createContact,
    updateContact,
    deleteContact,
    fetchContacts,
    refetchConversations,
  } = useContact({
    autoRefresh: true,
    refreshInterval: 30000,
  })

  // Force refresh mechanism for UI updates
  const [refreshKey, setRefreshKey] = useState(0)
  const forceRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

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
    isSubmitting,
    updateField, 
    validateForm, 
    validateField,
    resetForm, 
    setSubmitting,
  } = useContactForm()

  // Filter contacts based on search term and filters (using unified contacts for the grid)
  const filteredContacts = useMemo(() => {
    return unifiedContacts.filter((unifiedContact) => {
      const contact = unifiedContact.contact;
      
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.phone && contact.phone.includes(searchTerm)) ||
        (contact.location && contact.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'all' || contact.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;

      // Filter by time - use the most recent activity from conversations or contact
      const lastActivity = unifiedContact.lastActivity;
      const contactDate = new Date(lastActivity);
      const now = new Date();
      const matchesTime = (() => {
        switch (timeFilter) {
          case 'day':
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            return contactDate >= oneDayAgo;
          case 'week':
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return contactDate >= oneWeekAgo;
          case 'month':
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return contactDate >= oneMonthAgo;
          case 'year':
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return contactDate >= oneYearAgo;
          default:
            return true;
        }
      })();

      return matchesSearch && matchesType && matchesStatus && matchesTime;
    });
  }, [unifiedContacts, searchTerm, typeFilter, statusFilter, timeFilter, refreshKey]);

  // Clear all filters
  const clearFilters = () => {
    setTypeFilter("all")
    setStatusFilter("all")
    setTimeFilter("all")
  }

  // Check if any filters are active
  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || timeFilter !== "all"

  // Handle edit contact
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setShowNewContactModal(true)
  }

  // Handle delete contact
  const handleDeleteContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId)
    if (contact) {
      setContactToDelete(contact)
      setShowDeleteModal(true)
    }
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (contactToDelete) {
      const result = await deleteContact(contactToDelete.id)
      if (result.success) {
        console.log('✅ Contact deleted successfully!')
        toast.success(`Contact "${contactToDelete.name}" deleted successfully!`, {
          duration: 3000,
          position: 'top-right',
        });
        setShowDeleteModal(false)
        setContactToDelete(null)
      } else {
        console.error('❌ Failed to delete contact:', result.error)
        toast.error(`Failed to delete contact: ${result.error}`, {
          duration: 4000,
          position: 'top-right',
        });
      }
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false)
    setContactToDelete(null)
  }

  // Update the handleSaveAsContact function to properly merge contacts
  const handleSaveAsContact = async (contact: Contact) => {
    try {
      console.log('🔄 Starting save as verified process for:', contact.name, contact.email)
      
      // Check if there's already a manual contact with the same email
      const existingManualContact = contacts.find(c => 
        c.email.toLowerCase() === contact.email.toLowerCase() && 
        c.contactSource === 'manual'
      )

      let result
      
      if (existingManualContact) {
        console.log('📝 Found existing manual contact, merging...')
        // Merge conversation data with existing manual contact
        const mergedContactData = {
          id: existingManualContact.id,
          name: contact.name !== "Unknown Contact" ? contact.name : existingManualContact.name,
          notes: existingManualContact.notes 
            ? `${existingManualContact.notes}\n\n--- From Conversation ---\n${contact.notes || ''}`
            : contact.notes || undefined,
          linkedConversationIds: [
            ...(existingManualContact.linkedConversationIds || []),
            ...(contact.linkedConversationIds || [])
          ],
          contactSource: "merged" as const,
          lastConversationDate: contact.lastConversationDate || contact.lastContact,
          totalConversationMessages: (existingManualContact.totalConversationMessages || 0) + 
                                   (contact.totalConversationMessages || 0),
        }

        result = await updateContact(mergedContactData)
        console.log('✅ Contact merged successfully!')
      } else {
        console.log('🆕 Creating new verified contact...')
        // Create new verified contact from conversation
        const contactData = {
          name: contact.name,
          email: contact.email,
          phone: contact.phone || '',
          location: contact.location || '',
          type: contact.type,
          status: 'client' as const, // Save as verified client
          notes: contact.notes || '',
          budgetRange: contact.budgetRange || '',
          propertyTypes: contact.propertyTypes || '',
          linkedConversationIds: contact.linkedConversationIds || [],
          primaryConversationId: contact.primaryConversationId || '',
          contactSource: 'manual' as const, // Mark as manual/verified
        }

        result = await createContact(contactData)
        console.log('✅ New contact created successfully!')
      }
      
      if (result.success) {
        console.log('✅ Contact saved as verified successfully!')
        
        // Force refresh both contacts and conversations to update unified contacts
        await Promise.all([
          fetchContacts(),
          refetchConversations()
        ])
        
        // Close the info modal to refresh the view
        setShowInfoModal(false)
        setSelectedContact(undefined)
        
        // Show success popup
        setSavedContactName(contact.name)
        setShowSaveSuccessModal(true)
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setShowSaveSuccessModal(false)
          setSavedContactName('')
        }, 3000)
      } else {
        console.error('❌ Failed to save contact as verified:', result.error)
        toast.error(`Failed to save contact as verified: ${result.error}`, {
          duration: 4000,
          position: 'top-right',
        })
      }
    } catch (error) {
      console.error('❌ Error saving contact:', error)
      toast.error('An error occurred while saving the contact', {
        duration: 4000,
        position: 'top-right',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-muted">
        <LoadingSpinner size="lg" text="Loading contacts..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-background-muted">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-status-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Contacts</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full overflow-hidden bg-background-muted">
        <div className="flex-shrink-0 p-6 pb-4">
          <h1 className="text-4xl font-extrabold text-card-foreground mb-2 tracking-tight">Contacts</h1>
          <p className="text-lg text-muted-foreground">
            Manage and view client information extracted from conversations.
            {unifiedContacts.length > 0 && ` Found ${unifiedContacts.length} unique contacts.`}
          </p>
          {/* Debug information */}
          <div className="text-sm text-muted-foreground mt-2">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-xs underline hover:text-foreground transition-colors"
            >
              {showDebugInfo ? 'Hide' : 'Show'} contact breakdown
            </button>
            {showDebugInfo && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg text-xs">
                <p>Manual contacts: {contacts.length} | Unified contacts: {unifiedContacts.length}</p>
                <p>Contacts from conversations: {unifiedContacts.filter(uc => uc.contact.contactSource === 'conversation').length}</p>
                <p>Manual contacts: {unifiedContacts.filter(uc => uc.contact.contactSource === 'manual').length}</p>
                <p>Linked contacts: {unifiedContacts.filter(uc => uc.contact.contactSource === 'merged').length}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {/* Search and filter controls */}
          <div className="bg-card p-5 rounded-xl border border-border shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
            {/* Search input with icon */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-light" />
              <input
                type="text"
                placeholder="Search contacts by name, email, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-midnight-700 focus:border-midnight-700 text-card-foreground bg-background placeholder-text-muted-light"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-midnight-700 focus:border-midnight-700 text-card-foreground bg-background"
              >
                <option value="all">All Types</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="investor">Investors</option>
                <option value="other">Other</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-midnight-700 focus:border-midnight-700 text-card-foreground bg-background"
              >
                <option value="all">All Status</option>
                <option value="client">Clients</option>
                <option value="lead">Leads</option>
              </select>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-midnight-700 focus:border-midnight-700 text-card-foreground bg-background"
              >
                <option value="all">All Time</option>
                <option value="day">Last Day</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>

              <button 
                onClick={() => {
                  setEditingContact(undefined)
                  resetForm()
                  setShowNewContactModal(true)
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-midnight-700 to-midnight-600 text-white rounded-lg shadow-md hover:from-midnight-600 hover:to-midnight-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap font-medium"
              >
                <Plus className="h-5 w-5" />
                New Contact
              </button>
            </div>
          </div>

          {/* Contacts grid with responsive layout */}
          <div className="space-y-4">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border shadow-sm">
              <p className="text-muted-foreground text-xl font-medium mb-2">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "No contacts match your filters"
                  : "No contacts found"}
              </p>
              <p className="text-muted-light text-base">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Contacts will appear here as you receive conversations or create manual contacts"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredContacts.map((unifiedContact) => (
                  <ContactProfileCard
                  key={unifiedContact.contact.id}
                    contact={unifiedContact.contact}
                    onEdit={handleEditContact}
                    onDelete={handleDeleteContact}
                    onClick={(c) => {
                      setSelectedContact(c);
                      setShowInfoModal(true);
                    }}
                  />
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Enhanced New/Edit Contact Modal */}
        <ContactEditProfileCard
          contact={editingContact}
          isOpen={showNewContactModal}
          onClose={() => {
                      setShowNewContactModal(false)
            setEditingContact(undefined)
                      resetForm()
                      closeLocationDropdown()
                    }}
          onSubmit={async (contactData) => {
            if (editingContact) {
              await updateContact({ id: editingContact.id, ...contactData });
            } else {
              await createContact(contactData);
            }
            await fetchContacts();
          }}
          onDelete={async (contactId) => {
            const result = await deleteContact(contactId);
            if (result.success) {
              toast.success('Contact deleted successfully!', {
                duration: 3000,
                position: 'top-right',
              });
              await fetchContacts();
            } else {
              throw new Error(result.error);
            }
          }}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && contactToDelete && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                  <p className="text-card-foreground font-medium">{contactToDelete.name}</p>
                  <p className="text-sm text-muted-foreground">{contactToDelete.email}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2.5 border border-border rounded-lg text-card-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-status-error text-white rounded-lg hover:bg-status-error/90 transition-colors font-medium"
                  >
                    Delete Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Success Modal */}
        {showSaveSuccessModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-xl border border-border shadow-lg max-w-md w-full">
              <div className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-status-success/10 rounded-full">
                    <Save className="h-8 w-8 text-status-success" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  Contact Saved!
                </h3>
                
                <p className="text-muted-foreground mb-3">
                  "{savedContactName}" has been added to your contacts.
                </p>
                
                {/* Verified Contacts indicator */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-midnight-50 border border-midnight-200 rounded-full text-sm font-medium text-midnight-700">
                  <User2 className="h-4 w-4" />
                  Verified Contacts*
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowSaveSuccessModal(false)
                      setSavedContactName('')
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-midnight-700 to-midnight-600 text-white rounded-lg hover:from-midnight-600 hover:to-midnight-700 transition-all duration-200 font-medium"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close tooltip */}
        {showVerifiedTooltip && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setShowVerifiedTooltip(false)}
          />
        )}

        {/* Contact Info Modal */}
        {selectedContact && (
          <ContactDetailProfileCard
            contact={selectedContact}
            onClose={() => {
                      setShowInfoModal(false);
              setSelectedContact(undefined);
            }}
            onEdit={(contact) => {
                      setShowInfoModal(false);
              setSelectedContact(undefined);
              handleEditContact(contact);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

