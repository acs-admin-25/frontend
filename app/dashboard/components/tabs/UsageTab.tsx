"use client"

import React from 'react';
import { 
  Mail,
  LogIn,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
  MousePointer,
  User,
  MessageSquare,
  Monitor,
  Laptop,
  Smartphone,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar
} from "lucide-react";
import { cn } from '@/lib/utils/utils';
import { useUsageData } from '@/lib/hooks/useCentralizedDashboardData';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease" | "stable";
  icon: React.ReactNode;
  className?: string;
}

function MetricCard({ title, value, change, changeType, icon, className }: MetricCardProps) {
  const getChangeColor = () => {
    if (changeType === "increase") return "text-green-600";
    if (changeType === "decrease") return "text-red-500";
    return "text-gray-500";
  };

  const ChangeIcon = changeType === "increase" ? ArrowUp : changeType === "decrease" ? ArrowDown : null;

  return (
    <div className={cn("border border-gray-300 rounded-lg p-6 bg-white", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
          <div className="text-2xl font-bold text-gray-900 mb-3">{value}</div>
          {change && (
            <div className={cn("flex items-center text-sm font-medium", getChangeColor())}>
              {ChangeIcon && <ChangeIcon className="h-3 w-3 mr-1" />}
              {change}
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">{icon}</div>
        </div>
      </div>
    </div>
  );
}

// Large Stats Card Component
function LargeStatsCard({ usage }: { usage: any }) {
  const stats = [
    { 
      value: `${usage?.timeSaved || 47} hrs`, 
      label: "Time saved by AI", 
      icon: <Shield className="h-6 w-6 text-green-600" /> 
    },
    { 
      value: `${usage?.emailOpenRate || 74}%`, 
      label: "Email Open Rate", 
      icon: <MousePointer className="h-6 w-6 text-green-600" /> 
    },
    { 
      value: `${usage?.conversionRate || 32}%`, 
      label: "Conversion Rate", 
      icon: <User className="h-6 w-6 text-green-600" /> 
    },
    { 
      value: `${usage?.messagesSent || 2415}`, 
      label: "Message sent by AI", 
      icon: <MessageSquare className="h-6 w-6 text-green-600" /> 
    },
  ];

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <div className="grid grid-cols-2 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-3">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Device Overview Component
function DeviceOverview() {
  const devices = [
    {
      name: "Computer",
      percentage: 30,
      users: 246,
      change: "1.2% Increase",
      changeType: "increase" as const,
      icon: <Monitor className="h-5 w-5 text-gray-600" />,
    },
    {
      name: "Laptop",
      percentage: 32,
      users: 130,
      change: "2.1% Decrease",
      changeType: "decrease" as const,
      icon: <Laptop className="h-5 w-5 text-gray-600" />,
    },
    {
      name: "Mobile Phone",
      percentage: 70,
      users: 288,
      change: "2.9% Increase",
      changeType: "increase" as const,
      icon: <Smartphone className="h-5 w-5 text-gray-600" />,
    },
  ];

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Devices Overview</h3>
        <button className="p-1 hover:bg-gray-100 rounded">
          <ExternalLink className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-6">
        {devices.map((device, index) => {
          const ChangeIcon = device.changeType === "increase" ? ArrowUp : ArrowDown;
          const changeColor = device.changeType === "increase" ? "text-green-600" : "text-red-500";

          return (
            <div key={index} className="flex items-center gap-4">
              {/* Circular Progress */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeDasharray={`${device.percentage}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">{device.icon}</div>
              </div>

              {/* Device Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{device.name}</span>
                  <span className="text-sm text-gray-600">
                    {device.percentage}% • {device.users} Users
                  </span>
                </div>
                <div className={cn("flex items-center text-sm font-medium", changeColor)}>
                  <ChangeIcon className="h-3 w-3 mr-1" />
                  {device.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UsageTab() {
  const { usage, loading, error, refetch } = useUsageData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading usage statistics..." />
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Usage</h3>
          <p className="text-gray-600 mb-4">{error || 'An unexpected error occurred.'}</p>
          <Button onClick={() => refetch()} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 h-full">
      <div className="w-full h-full space-y-6">
        {/* Header removed - just keeping the spacing */}
        <div className="mb-6">
          {/* Header removed - just keeping the spacing */}
        </div>

        {/* Top Row - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Email Sent (per day)"
            value={usage.emailsSent?.toString() || "24"}
            change="6.7% Increase"
            changeType="increase"
            icon={<Mail className="h-6 w-6 text-green-600" />}
          />
          <MetricCard
            title="Login (this month)"
            value={usage.logins?.toString() || "9,741"}
            change="13.5% Decrease"
            changeType="decrease"
            icon={<LogIn className="h-6 w-6 text-red-500" />}
          />
          <MetricCard
            title="Activity Rate"
            value="Stable"
            change="13.5% Decrease"
            changeType="decrease"
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
          />
        </div>

        {/* Middle Row - 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Cold Lead Identified"
            value="86"
            change="6.7% Increase"
            changeType="increase"
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          />
          <MetricCard
            title="Top-Response Time"
            value="6-8pm,11am"
            change="13.5% Decrease"
            changeType="decrease"
            icon={<Clock className="h-6 w-6 text-red-500" />}
          />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large Stats Card - Takes 2 columns */}
          <div className="lg:col-span-2">
            <LargeStatsCard usage={usage} />
          </div>

          {/* Device Overview */}
          <div>
            <DeviceOverview />
          </div>
        </div>

        {/* View Full Usage Overview Button */}
        <div className="w-full">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
            View Full Usage Overview
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UsageTab; 