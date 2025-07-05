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

interface ResourceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: 'getting-started' | 'best-practices' | 'analytics' | 'features' | 'security' | 'troubleshooting';
  tips?: string[];
  estimatedTime?: string;
  priority?: 'high' | 'medium' | 'low';
}

const resourceItems: ResourceItem[] = [
  {
    title: "Getting Started Guide",
    description: "Essential setup and navigation tips for new users",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/dashboard/resources/getting-started",
    category: "getting-started",
    tips: ["Complete email setup first", "Review dashboard metrics", "Explore conversation features"],
    estimatedTime: "10 min",
    priority: "high"
  },
  {
    title: "Lead Conversion Best Practices",
    description: "Proven strategies to improve your conversion rates",
    icon: <Target className="h-5 w-5" />,
    href: "/dashboard/resources/best-practices",
    category: "best-practices",
    tips: ["Respond within 5 minutes", "Personalize your messages", "Follow up consistently"],
    estimatedTime: "15 min",
    priority: "high"
  },
  {
    title: "Analytics Deep Dive",
    description: "Understanding your performance metrics and trends",
    icon: <BarChart2 className="h-5 w-5" />,
    href: "/dashboard/analytics",
    category: "analytics",
    tips: ["Monitor conversion rates", "Track lead sources", "Analyze response times"],
    estimatedTime: "20 min",
    priority: "medium"
  },
  {
    title: "Advanced Features Guide",
    description: "Master advanced ACS features and automation",
    icon: <TrendingUp className="h-5 w-5" />,
    href: "/dashboard/resources/advanced-features",
    category: "features",
    tips: ["Set up email templates", "Configure auto-responses", "Use AI insights"],
    estimatedTime: "25 min",
    priority: "medium"
  },
  {
    title: "Contact Management",
    description: "Organize and manage your client relationships",
    icon: <Users className="h-5 w-5" />,
    href: "/dashboard/contacts",
    category: "features",
    tips: ["Keep contact info updated", "Add notes to contacts", "Use tags for organization"],
    estimatedTime: "12 min",
    priority: "medium"
  },
  {
    title: "Calendar Integration",
    description: "Sync your schedule and manage appointments",
    icon: <Calendar className="h-5 w-5" />,
    href: "/dashboard/calendar",
    category: "features",
    tips: ["Connect your calendar", "Set up viewing reminders", "Block unavailable times"],
    estimatedTime: "8 min",
    priority: "low"
  },
  {
    title: "Security Best Practices",
    description: "Keep your account and data secure",
    icon: <Shield className="h-5 w-5" />,
    href: "/dashboard/resources/security",
    category: "security",
    tips: ["Use strong passwords", "Enable 2FA", "Review access logs"],
    estimatedTime: "10 min",
    priority: "high"
  },
  {
    title: "Troubleshooting Guide",
    description: "Common issues and their solutions",
    icon: <HelpCircle className="h-5 w-5" />,
    href: "/dashboard/resources/troubleshooting",
    category: "troubleshooting",
    tips: ["Check email settings", "Verify API connections", "Clear browser cache"],
    estimatedTime: "15 min",
    priority: "low"
  }
];

interface QuickResourcesProps {
  className?: string;
}

export function QuickResources({ className }: QuickResourcesProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getCategoryColor = (category: ResourceItem['category']) => {
    switch (category) {
      case 'getting-started':
        return 'text-status-info bg-status-info/10 border-status-info/20';
      case 'best-practices':
        return 'text-status-success bg-status-success/10 border-status-success/20';
      case 'analytics':
        return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'features':
        return 'text-status-warning bg-status-warning/10 border-status-warning/20';
      case 'security':
        return 'text-status-error bg-status-error/10 border-status-error/20';
      case 'troubleshooting':
        return 'text-muted-foreground bg-muted border-border';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getCategoryIcon = (category: ResourceItem['category']) => {
    switch (category) {
      case 'getting-started':
        return <BookOpen className="h-4 w-4" />;
      case 'best-practices':
        return <Target className="h-4 w-4" />;
      case 'analytics':
        return <BarChart2 className="h-4 w-4" />;
      case 'features':
        return <TrendingUp className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'troubleshooting':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: ResourceItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-status-error/10 text-status-error border-status-error/20';
      case 'medium':
        return 'bg-status-warning/10 text-status-warning border-status-warning/20';
      case 'low':
        return 'bg-status-success/10 text-status-success border-status-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Sort by priority and category
  const sortedResources = [...resourceItems].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low'];
    if (priorityDiff !== 0) return priorityDiff;
    return a.title.localeCompare(b.title);
  });

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
        {sortedResources.map((item) => (
          <div
            key={item.title}
            className={cn(
              "group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer",
              "hover:shadow-md hover:scale-[1.02]",
              getCategoryColor(item.category),
              hoveredItem === item.title && "ring-2 ring-secondary/20"
            )}
            onMouseEnter={() => setHoveredItem(item.title)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {item.icon}
                <h3 className="font-semibold text-sm">{item.title}</h3>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border",
                getPriorityColor(item.priority)
              )}>
                {item.priority}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>⏱️ {item.estimatedTime}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Tooltip with tips */}
            {hoveredItem === item.title && item.tips && (
              <div className="absolute left-full ml-2 top-0 w-64 bg-popover border border-border rounded-lg shadow-lg p-3 z-50">
                <h4 className="font-semibold text-sm text-popover-foreground mb-2">Quick Tips:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {item.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-status-success mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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