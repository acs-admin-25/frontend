import React, { useState } from 'react';
import { 
  BookOpen, 
  BarChart2, 
  Users, 
  MessageSquare, 
  Calendar,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import Link from 'next/link';

// Resource data combining both images (EXACT copy from ResourcesTab.tsx)
export const resourceItems = [
  {
    id: 1,
    title: "Getting Started Guide",
    description: "Essential setup and navigation tips for new users",
    readTime: "10 min",
    priority: "high",
    icon: <BookOpen className="h-6 w-6" />,
    color: "green",
    href: "/dashboard/resources?tab=getting-started"
  },
  {
    id: 2,
    title: "Lead Conversion Best Practices",
    description: "Proven strategies to improve your conversion rates",
    readTime: "15 min",
    priority: "high",
    icon: <Target className="h-6 w-6" />,
    color: "white",
    href: "/dashboard/resources?tab=best-practices"
  },
  {
    id: 3,
    title: "Advanced Features Guide",
    description: "Master advanced ACS features and automation",
    readTime: "25 min",
    priority: "medium",
    icon: <Zap className="h-6 w-6" />,
    color: "green",
    href: "/dashboard/resources?tab=advanced-features"
  },
  {
    id: 4,
    title: "Analytics Deep Dive",
    description: "Understanding your performance metrics and trends",
    readTime: "20 min",
    priority: "medium",
    icon: <BarChart2 className="h-6 w-6" />,
    color: "gray",
    href: "/dashboard/resources?tab=usage-analytics"
  },
  {
    id: 5,
    title: "Security Best Practices",
    description: "Keep your account and data secure",
    readTime: "10 min",
    priority: "high",
    icon: <Shield className="h-6 w-6" />,
    color: "green",
    href: "/dashboard/resources?tab=security"
  },
  {
    id: 6,
    title: "Calendar Integration",
    description: "Sync your schedule and manage appointments",
    readTime: "8 min",
    priority: "low",
    icon: <Calendar className="h-6 w-6" />,
    color: "gray",
    href: "/dashboard/resources?tab=core-features"
  },
  {
    id: 7,
    title: "Contact Management",
    description: "Organize and manage your client relationships",
    readTime: "12 min",
    priority: "medium",
    icon: <Users className="h-6 w-6" />,
    color: "white",
    href: "/dashboard/resources?tab=core-features"
  },
  {
    id: 8,
    title: "Email Management",
    description: "Manage, automate, and track your email communications",
    readTime: "10 min",
    priority: "medium",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "green",
    href: "/dashboard/resources?tab=core-features"
  },
  {
    id: 9,
    title: "Troubleshooting Guide",
    description: "Common issues and their solutions",
    readTime: "15 min",
    priority: "low",
    icon: <HelpCircle className="h-6 w-6" />,
    color: "gray",
    href: "/dashboard/resources?tab=troubleshooting"
  },
];

interface QuickResourcesProps {
  className?: string;
}

export function QuickResources({ className }: QuickResourcesProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Remove the old sorting logic, just use resourceItems as-is

  return (
    <div className={cn("bg-card p-6 rounded-xl shadow-sm border border-border", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-card-foreground flex items-center">
          <BookOpen className="h-5 w-5 mr-3 text-secondary" />
          Quick Resources
        </h2>
        <Link 
          href="/dashboard/resources" 
          className="text-sm text-secondary hover:text-secondary/80 transition-colors flex items-center"
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resourceItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer block",
              item.color === "green"
                ? "bg-green-600 text-white border-green-700"
                : item.color === "gray"
                ? "bg-gray-100 text-gray-900 border-gray-200"
                : "bg-white text-gray-900 border-gray-300",
              "hover:shadow-md hover:scale-[1.02]"
            )}
          >
            <div className={cn("p-2 rounded-lg", item.color === "green" ? "bg-white/20" : "bg-green-100")}>{item.icon}</div>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              item.priority === "high"
                ? "bg-orange-500 text-white"
                : item.priority === "medium"
                ? "bg-yellow-500 text-white"
                : item.priority === "low"
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            )}>
              {item.priority}
            </div>
            <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
            <p className={cn("text-xs mb-3 line-clamp-2", item.color === "green" ? "text-white/80" : "text-gray-600")}>{item.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className={item.color === "green" ? "text-white/80" : "text-gray-600"}>⏱️ {item.readTime} read</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Need help?</span>
          <Link 
            href="/dashboard/support" 
            className="text-secondary hover:text-secondary/80 transition-colors flex items-center"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}