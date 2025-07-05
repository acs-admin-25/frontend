import { Home, Mail, Users, MessageSquare, BarChart3, Settings, Phone, Calendar, Trash2, CreditCard, FileText, Clock, Grid, UserCheck, MessageCircle, PieChart, Cog } from "lucide-react";

export interface NavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  description: string;
}

export interface NavigationGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
}

// Navigation data with logical groupings
export const navigationGroups: NavigationGroup[] = [
  {
    title: "Main",
    icon: Grid,
    items: [
      {
        title: "Dashboard",
        icon: Home,
        url: "/dashboard",
        description: "Overview & Analytics"
      },
      {
        title: "Conversations",
        icon: MessageSquare,
        url: "/dashboard/conversations",
        description: "Chat & Messages"
      }
    ]
  },
  {
    title: "Client Management",
    icon: UserCheck,
    items: [
      {
        title: "Leads",
        icon: Users,
        url: "/dashboard/leads",
        description: "Potential Clients"
      },
      {
        title: "Contacts",
        icon: Phone,
        url: "/dashboard/contacts",
        description: "Client Database"
      }
    ]
  },
  {
    title: "Communication",
    icon: MessageCircle,
    items: [
      {
        title: "Email",
        icon: Mail,
        url: "/dashboard/email",
        description: "Email Management"
      },
      {
        title: "Calendar",
        icon: Calendar,
        url: "/dashboard/calendar",
        description: "Schedule & Events"
      }
    ]
  },
  {
    title: "Analytics & Reports",
    icon: PieChart,
    items: [
      {
        title: "Analytics",
        icon: BarChart3,
        url: "/dashboard/analytics",
        description: "Reports & Insights"
      },
      {
        title: "History",
        icon: Clock,
        url: "/dashboard/history",
        description: "Past Activities"
      }
    ]
  },
  {
    title: "System",
    icon: Cog,
    items: [
      {
        title: "Usage",
        icon: CreditCard,
        url: "/dashboard/usage",
        description: "Billing & Limits"
      },
      {
        title: "Resources",
        icon: FileText,
        url: "/dashboard/resources",
        description: "Help & Documentation"
      },
      {
        title: "Junk",
        icon: Trash2,
        url: "/dashboard/junk",
        description: "Spam & Filtered"
      },
      {
        title: "Settings",
        icon: Settings,
        url: "/dashboard/settings",
        description: "Account & Preferences"
      }
    ]
  }
]; 