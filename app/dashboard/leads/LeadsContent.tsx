"use client"
import { Search, Filter, Plus, Phone, Mail, Calendar } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LeadsContent() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const leads = [
    {
      id: 1,
      name: "Michael Rodriguez",
      email: "michael.rodriguez@email.com",
      phone: "(555) 123-4567",
      source: "Website Form",
      status: "hot",
      budget: "$450K-500K",
      propertyType: "Condo",
      location: "Downtown",
      lastContact: "2 hours ago",
      aiScore: 85,
    },
    {
      id: 2,
      name: "Jennifer Chen",
      email: "jennifer.chen@email.com",
      phone: "(555) 234-5678",
      source: "Social Media",
      status: "warm",
      budget: "Under $300K",
      propertyType: "Condo",
      location: "Suburbs",
      lastContact: "4 hours ago",
      aiScore: 72,
    },
    {
      id: 3,
      name: "David Thompson",
      email: "david.thompson@email.com",
      phone: "(555) 345-6789",
      source: "Referral",
      status: "hot",
      budget: "$600K",
      propertyType: "Single Family",
      location: "Downtown",
      lastContact: "6 hours ago",
      aiScore: 91,
    },
    {
      id: 4,
      name: "Lisa Park",
      email: "lisa.park@email.com",
      phone: "(555) 456-7890",
      source: "Open House",
      status: "cold",
      budget: "$400K-500K",
      propertyType: "Single Family",
      location: "Suburbs",
      lastContact: "1 day ago",
      aiScore: 58,
    },
    {
      id: 5,
      name: "Robert Wilson",
      email: "robert.wilson@email.com",
      phone: "(555) 567-8901",
      source: "Website Form",
      status: "warm",
      budget: "$300K-400K",
      propertyType: "Investment",
      location: "Various",
      lastContact: "1 day ago",
      aiScore: 79,
    },
  ]

  // Filter leads based on search term and status
  const filteredLeads = leads.filter(
    (lead) =>
      (lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || lead.status === statusFilter),
  )

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      <div className="flex-shrink-0 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Leads</h1>
        <p className="text-gray-600">Manage and track potential clients with search, filtering, and AI scoring.</p>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-0">
        {/* Header section with navigation and add lead button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#0e6537]">Lead Management</h2>
          </div>
          <button className="px-4 py-2 bg-[#0e6537] text-white rounded-lg hover:bg-white/90 transition-all duration-200 shadow-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Lead
          </button>
        </div>

        {/* Lead statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-[#0e6537]/20 shadow-sm">
            <p className="text-2xl font-bold text-[#0e6537]">24</p>
            <p className="text-sm text-gray-600">Hot Leads</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#0e6537]/20 shadow-sm">
            <p className="text-2xl font-bold text-[#0e6537]">18</p>
            <p className="text-sm text-gray-600">Warm Leads</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#0e6537]/20 shadow-sm">
            <p className="text-2xl font-bold text-[#0e6537]">12</p>
            <p className="text-sm text-gray-600">Cold Leads</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-[#0e6537]/20 shadow-sm">
            <p className="text-2xl font-bold text-[#0e6537]">54</p>
            <p className="text-sm text-gray-600">Total Leads</p>
          </div>
        </div>

        {/* Search and filter controls */}
        <div className="bg-white p-4 rounded-lg border border-[#0e6537]/20 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input with icon */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#0e6537]/20 rounded-lg focus:outline-none focus:ring-[#0e6537]/20 text-gray-900 placeholder-gray-400"
              />
            </div>
            {/* Status filter and additional filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-[#0e6537]/20 rounded-lg focus:outline-none focus:ring-[#0e6537]/20 text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
              <button className="px-4 py-2 border border-[#0e6537]/20 rounded-lg hover:bg-[#0e6537]/5 flex items-center gap-2 text-gray-900">
                <Filter className="h-4 w-4" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leads table with responsive design */}
        <div className="bg-white rounded-lg border border-[#0e6537]/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-[#0e6537]/20">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Lead</th>
                  <th className="text-left p-4 font-medium text-gray-600">Contact</th>
                  <th className="text-left p-4 font-medium text-gray-600">Source</th>
                  <th className="text-left p-4 font-medium text-gray-600">Budget</th>
                  <th className="text-left p-4 font-medium text-gray-600">Property Type</th>
                  <th className="text-left p-4 font-medium text-gray-600">AI Score</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#0e6537]/20 hover:bg-gray-50">
                    {/* Lead information cell */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0e6537]/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-[#0e6537]">
                            {lead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.location}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact information cell */}
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{lead.email}</p>
                        <p className="text-gray-500">{lead.phone}</p>
                      </div>
                    </td>
                    {/* Source badge */}
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{lead.source}</span>
                    </td>
                    {/* Budget and property type cells */}
                    <td className="p-4">
                      <span className="text-sm text-gray-900">{lead.budget}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-900">{lead.propertyType}</span>
                    </td>
                    {/* AI score with conditional styling */}
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.aiScore >= 80
                            ? "bg-[#e6f5ec] text-[#002417]"
                            : lead.aiScore >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {lead.aiScore}
                      </span>
                    </td>
                    {/* Status badge with conditional styling */}
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === "hot"
                            ? "bg-red-100 text-red-800"
                            : lead.status === "warm"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-[#0e6537]/10 text-[#0e6537]"
                        }`}
                      >
                        {lead.status.toUpperCase()}
                      </span>
                    </td>
                    {/* Quick action buttons */}
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-[#0e6537]/10 transition-all duration-200 rounded">
                          <Phone className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-[#0e6537]/10 transition-all duration-200 rounded">
                          <Mail className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-[#0e6537]/10 transition-all duration-200 rounded">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 