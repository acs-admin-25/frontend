"use client";

import React, { useState } from "react";
import { ResourceSection, ResourceItem } from "./types/resources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Shield, 
  Brain, 
  BarChart3, 
  Lightbulb, 
  Wrench, 
  Settings, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  Zap,
  Users,
  Mail,
  Calendar,
  Target,
  TrendingUp,
  Lock,
  Eye,
  Settings as SettingsIcon,
  MessageSquare,
  Phone,
  Clock,
  Search,
  Filter,
  Star as StarIcon
} from "lucide-react";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  "getting-started": BookOpen,
  "core-features": Settings,
  "ai-features": Brain,
  "security": Shield,
  "usage-analytics": BarChart3,
  "best-practices": Lightbulb,
  "troubleshooting": Wrench,
  "advanced-features": SettingsIcon,
  "faq": HelpCircle,
};

const featureIcons: { [key: string]: React.ComponentType<any> } = {
  "Dashboard & Analytics": BarChart3,
  "Conversation Management": MessageSquare,
  "Lead Management": Target,
  "Email Management": Mail,
  "Contact Management": Users,
  "Calendar & Scheduling": Calendar,
  "AI-Powered Lead Scoring": Brain,
  "AI Insights & Analysis": Zap,
  "Account Security": Lock,
  "Data Protection": Shield,
  "Email Security": Eye,
  "Usage Dashboard": TrendingUp,
  "Billing & Optimization": BarChart3,
  "Performance Analytics": TrendingUp,
  "Communication Excellence": MessageSquare,
  "Dashboard Optimization": Settings,
  "Common Issues": AlertCircle,
  "Getting Help": HelpCircle,
  "Customization": Settings,
  "Integrations": Zap,
  "Automation": Clock,
  "Data Security": Lock,
  "Lead Scoring": Star,
  "Account Management": Settings,
};

const allSections: ResourceSection[] = [
  // import and add all modularized sections here, e.g.:
  // gettingStartedSection,
  // coreFeaturesSection,
  // ...
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("getting-started");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderResourceItem = (item: ResourceItem, sectionId: string, itemIndex: number) => {
    const itemId = `${sectionId}-${itemIndex}`;
    const isExpanded = expandedItems.has(itemId);
    const IconComponent = featureIcons[item.title] || Info;

    return (
      <Card key={itemId} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader 
          className="cursor-pointer pb-3"
          onClick={() => toggleItem(itemId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {item.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.tips && item.tips.length > 0 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                  {item.tips.length} Tips
                </span>
              )}
              <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            {item.details && item.details.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Key Features
                </h4>
                <ul className="space-y-2">
                  {item.details.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {item.tips && item.tips.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <StarIcon className="h-4 w-4 text-yellow-600" />
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {item.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ACS Resources & Help Guide
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Everything you need to know about using ACS effectively
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to the ACS Resources page! Here you'll find comprehensive guides, best practices, 
            and tips to help you maximize your success with the ACS platform. Use the tabs below to 
            navigate through different sections and expand items to see detailed information.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 h-auto p-1 bg-gray-100 dark:bg-gray-800">
          {allSections.map((section) => {
            const IconComponent = iconMap[section.id] || BookOpen;
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-xs font-medium">{section.title}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {allSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {section.title}
              </h2>
              {section.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {section.content.map((item, index) => 
                renderResourceItem(item, section.id, index)
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <HelpCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Need Help?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contact support for assistance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Settings</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure your account
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View your performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Simple ChevronDown component
const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);