/**
 * Platform features data for the about page
 */

import React from 'react';
import { BarChart, Lock, Target, TrendingUp, Users, Zap } from "lucide-react";

export interface PlatformFeature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  metric: string;
}

export const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    title: "AI-Powered Automation",
    description: "Automate complex business processes and identify inefficiencies using advanced artificial intelligence.",
    icon: Zap,
    metric: "Streamlined Operations",
  },
  {
    title: "Cost Optimization",
    description: "Reduce operational expenses and enable strategic growth for small businesses.",
    icon: TrendingUp,
    metric: "Lower Costs",
  },
  {
    title: "Personalized Service",
    description: "Hands-on, long-term support tailored to each client's unique needs.",
    icon: Users,
    metric: "Client-Focused",
  },
  {
    title: "AWS Cloud Infrastructure",
    description: "Built on AWS with DynamoDB, API Gateway, Lambda, and Cognito for secure, scalable solutions.",
    icon: Lock,
    metric: "Enterprise-Grade",
  },
  {
    title: "Lead Conversion Pipeline (LCP)",
    description: "Automate contacting and converting leads, with dashboards, metrics, and manual controls.",
    icon: BarChart,
    metric: "Higher Conversions",
  },
  {
    title: "Lead Generation Workflow (LGW)",
    description: "Advertising and channel strategy to generate new leads for clients, integrated with major ad platforms.",
    icon: Target,
    metric: "More Leads",
  },
]; 