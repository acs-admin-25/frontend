/**
 * Features data for the about page
 */

import React from 'react';
import { BarChart, MessageSquare, Target, Zap } from "lucide-react";

export interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: string;
  color: string;
}

export const FEATURES: Feature[] = [
  {
    title: "Lead Conversion Pipeline (LCP)",
    description: "Automate contacting and converting leads with intelligent email routing, conversation management, and conversion tracking through our comprehensive dashboard.",
    icon: MessageSquare,
    stats: "24/7 Lead Management",
    color: "from-secondary to-secondary-dark",
  },
  {
    title: "Lead Generation Workflow (LGW)",
    description: "Strategic advertising and channel management to generate new leads through Facebook Marketplace, Google PPC, and other major ad platforms.",
    icon: Target,
    stats: "Expanded Funnel",
    color: "from-primary to-primary-light",
  },
  {
    title: "AI-Powered Automation",
    description: "Leverage artificial intelligence to automate complex business processes, identify inefficiencies, and streamline operations for small businesses.",
    icon: Zap,
    stats: "Process Optimization",
    color: "from-status-info to-blue-600",
  },
  {
    title: "Real Estate Specialization",
    description: "Industry-specific solutions designed for real estate professionals",
    icon: BarChart,
    stats: "Industry Focus",
    color: "from-status-warning to-orange-600",
  },
]; 