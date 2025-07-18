"use client"

import React from "react"
import type { ReactElement } from "react"
import {
  BookOpen,
  Target,
  Shield,
  BarChart3,
  Calendar,
  Users,
  HelpCircle,
  Zap,
  ChevronRight,
  ChevronLeft,
  Filter,
  ChevronDown,
  Clock,
} from "lucide-react"
import { cn } from '@/lib/utils/utils'
import { resourceItems } from '../cards/QuickResources'
import Link from 'next/link'

// Resource data combining both images
const resources = resourceItems

// Resource Card Component
interface ResourceCardProps {
  resource: (typeof resources)[0]
}

function ResourceCard({ resource }: ResourceCardProps): ReactElement {
  const getCardBackground = () => {
    switch (resource.color) {
      case "green":
        return "bg-green-600 text-white"
      case "white":
        return "bg-white text-gray-900 border border-gray-300"
      case "gray":
        return "bg-gray-100 text-gray-900"
      default:
        return "bg-white text-gray-900 border border-gray-300"
    }
  }

  const getPriorityBadge = () => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    switch (resource.priority) {
      case "high":
        return `${baseClasses} bg-orange-500 text-white`
      case "medium":
        return `${baseClasses} bg-yellow-500 text-white`
      case "low":
        return `${baseClasses} bg-green-500 text-white`
      default:
        return `${baseClasses} bg-gray-500 text-white`
    }
  }

  const getIconColor = () => {
    return resource.color === "green" ? "text-white" : "text-green-600"
  }

  return (
    <Link href={resource.href} className="block h-full">
      <div
        className={cn(
          "rounded-lg p-6 h-48 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow",
          getCardBackground(),
        )}
      >
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className={cn("p-2 rounded-lg", resource.color === "green" ? "bg-white/20" : "bg-green-100")}>
              <div className={getIconColor()}>{resource.icon}</div>
            </div>
            <span
              className={cn("p-1 rounded-full", resource.color === "green" ? "hover:bg-white/20" : "hover:bg-gray-200")}
            >
              <ChevronRight className={cn("h-4 w-4", resource.color === "green" ? "text-white" : "text-gray-600")} />
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
          <p className={cn("text-sm", resource.color === "green" ? "text-white/80" : "text-gray-600")}>
            {resource.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={cn("h-4 w-4", resource.color === "green" ? "text-white/60" : "text-gray-500")} />
            <span className={cn("text-sm", resource.color === "green" ? "text-white/80" : "text-gray-600")}>
              {resource.readTime} read
            </span>
          </div>
          <span className={getPriorityBadge()}>{resource.priority}</span>
        </div>
      </div>
    </Link>
  )
}

export function ResourcesTab(): ReactElement {
  const [currentPage, setCurrentPage] = React.useState(0)
  const cardsPerPage = 6
  const totalPages = Math.ceil(resources.length / cardsPerPage)

  const getCurrentPageResources = () => {
    const startIndex = currentPage * cardsPerPage
    return resources.slice(startIndex, startIndex + cardsPerPage)
  }

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  return (
    <div className="p-6 bg-gray-50 h-full">
      <div className="w-full h-full">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
          <div className="mb-6">
            {/* Header removed - just keeping the spacing */}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevPage}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={totalPages <= 1}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === currentPage ? "bg-green-600" : "bg-gray-300",
                  )}
                />
              ))}
            </div>

            <button
              onClick={nextPage}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={totalPages <= 1}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentPageResources().map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {/* Additional Resources Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/resources" className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Documentation</h4>
                  <p className="text-sm text-gray-600">Complete API and feature documentation</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </Link>

              <Link href="/dashboard/support" className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Support Center</h4>
                  <p className="text-sm text-gray-600">Get help from our support team</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourcesTab