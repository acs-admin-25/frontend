import React, { useRef, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, MessageSquare, Target, Clock, Activity, Zap, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import type { DashboardMetrics as Metrics } from '@/lib/types/dashboard';
import { calculateTrends, shouldShowTrend, formatTrendChange, getTrendDirection, type TrendData } from '@/lib/utils/dashboard';

interface DashboardMetricsProps {
  data: Metrics;
  dateRange?: DateRange;
  conversations?: any[]; // Add conversations for trend calculation
}

const MetricCard = ({ 
  name, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  change, 
  changeType, 
  subtitle,
  trend,
  showTrend = true,
  className = ""
}: { 
  name: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string; 
  change?: string; 
  changeType?: 'increase' | 'decrease';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable' | null;
  showTrend?: boolean;
  className?: string;
}) => {
    const ChangeIcon = changeType === 'increase' ? TrendingUp : TrendingDown;
    const changeColor = changeType === 'increase' ? 'text-status-success' : 'text-status-error';
    const trendColor = trend === 'up' ? 'text-status-success' : trend === 'down' ? 'text-status-error' : 'text-muted-foreground';

    return (
        <div className={`card bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 group w-full h-full flex-shrink-0 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{name}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground/70">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </div>
            <div className="space-y-2">
                <p className="text-3xl font-bold text-card-foreground">{value}</p>
                {change && showTrend && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <ChangeIcon className={`h-4 w-4 mr-1 ${changeColor}`} />
                            <span>{change}</span>
                        </div>
                        {trend && (
                            <div className={`flex items-center text-xs ${trendColor}`}>
                                {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                                {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                                {trend === 'stable' && <Activity className="h-3 w-3 mr-1" />}
                                <span className="capitalize">{trend}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export function DashboardMetrics({ data, dateRange, conversations = [] }: DashboardMetricsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState(0);

  // --- METRIC SLIDER CONSTANTS ---
  const metricsPerSlide = 3;
  const METRIC_CARD_WIDTH = 220; // px, fixed width for each card
  const SLIDER_WIDTH = METRIC_CARD_WIDTH * metricsPerSlide; // always 3 cards

  // --- RESPONSIVE CONTAINER STYLES ---
  const keyCardBase =
    "flex flex-col justify-center items-center bg-[#288e41] rounded-xl shadow-sm border border-[#047857] mr-4";
  const keyCardResponsive =
    "w-[180px] sm:w-[220px] md:w-[240px] min-w-[140px] max-w-[240px] h-[120px] sm:h-[140px] md:h-[160px] flex-shrink-0";

  // --- ARROW BUTTON STYLES ---
  const arrowButtonBase =
    "flex items-center justify-center absolute top-1/2 -translate-y-1/2 z-10 bg-card border border-border rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-muted";

  // Calculate trends if we have date range and conversations
  const trends = dateRange && dateRange.from && dateRange.to && conversations.length > 0 
    ? calculateTrends(conversations, dateRange.from, dateRange.to)
    : null;

  // Calculate additional metrics
  const calculateResponseTimeCategory = (time: number) => {
    if (time <= 5) return { category: 'Excellent', color: 'text-status-success', bgColor: 'bg-status-success/10' };
    if (time <= 15) return { category: 'Good', color: 'text-status-info', bgColor: 'bg-status-info/10' };
    if (time <= 30) return { category: 'Fair', color: 'text-status-warning', bgColor: 'bg-status-warning/10' };
    return { category: 'Needs Improvement', color: 'text-status-error', bgColor: 'bg-status-error/10' };
  };

  const responseTimeCategory = calculateResponseTimeCategory(data.averageResponseTime);
  
  // Calculate conversation velocity (conversations per day)
  const conversationsPerDay = data.totalConversations > 0 ? 
    Math.round((data.totalConversations / 30) * 10) / 10 : 0;

  // Calculate engagement rate (active vs total)
  const engagementRate = data.totalConversations > 0 ? 
    Math.round((data.activeConversations / data.totalConversations) * 100) : 0;

  // Helper function to get trend data for a metric
  const getTrendData = (metricKey: 'totalConversations' | 'activeConversations' | 'conversionRate' | 'averageResponseTime' | 'newConversations') => {
    if (!trends) return { showTrend: false, change: '', trend: null as any };
    
    const trendData = trends[metricKey];
    const showTrend = shouldShowTrend(trendData);
    const change = showTrend ? formatTrendChange(trendData) : '';
    const trend = showTrend ? getTrendDirection(trendData) : null;
    
    return { showTrend, change, trend };
  };

  const totalConversationsTrend = getTrendData('totalConversations');
  const activeConversationsTrend = getTrendData('activeConversations');
  const conversionRateTrend = getTrendData('conversionRate');
  const responseTimeTrend = getTrendData('averageResponseTime');

  const metrics = [
    { 
      name: 'Total Conversations', 
      value: data.totalConversations, 
      icon: MessageSquare, 
      color: 'text-status-info', 
      bgColor: 'bg-status-info/10',
      subtitle: 'All time conversations',
      change: totalConversationsTrend.change,
      changeType: totalConversationsTrend.trend === 'up' ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: totalConversationsTrend.trend,
      showTrend: totalConversationsTrend.showTrend
    },
    { 
      name: 'Active Conversations', 
      value: data.activeConversations, 
      icon: Activity, 
      color: 'text-status-success', 
      bgColor: 'bg-status-success/10',
      subtitle: 'Currently in progress',
      change: activeConversationsTrend.change,
      changeType: activeConversationsTrend.trend === 'up' ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: activeConversationsTrend.trend,
      showTrend: activeConversationsTrend.showTrend
    },
    { 
      name: 'Conversion Rate', 
      value: `${data.conversionRate}%`, 
      icon: Target, 
      color: 'text-status-warning', 
      bgColor: 'bg-status-warning/10',
      subtitle: 'Successfully closed',
      change: conversionRateTrend.change || `${data.conversionRate >= 0 ? '+' : ''}${data.conversionRate}% vs target`,
      changeType: conversionRateTrend.trend === 'up' || data.conversionRate >= 15 ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: conversionRateTrend.trend || (data.conversionRate >= 15 ? 'up' : 'down' as 'up' | 'down'),
      showTrend: conversionRateTrend.showTrend
    },
    { 
      name: 'Avg Response Time', 
      value: `${data.averageResponseTime}m`, 
      icon: Clock, 
      color: responseTimeCategory.color, 
      bgColor: responseTimeCategory.bgColor,
      subtitle: responseTimeCategory.category,
      change: responseTimeTrend.change || (data.averageResponseTime <= 15 ? 'Under 15min target' : 'Above target'),
      changeType: responseTimeTrend.trend === 'down' || data.averageResponseTime <= 15 ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: responseTimeTrend.trend || (data.averageResponseTime <= 15 ? 'up' : 'down' as 'up' | 'down'),
      showTrend: responseTimeTrend.showTrend
    },
    { 
      name: 'Conversation Velocity', 
      value: `${conversationsPerDay}/day`, 
      icon: Zap, 
      color: 'text-secondary', 
      bgColor: 'bg-secondary/10',
      subtitle: 'Daily conversation rate',
      trend: conversationsPerDay > 1 ? 'up' : 'stable' as 'up' | 'stable',
      showTrend: false // No historical data for this metric yet
    },
    { 
      name: 'Engagement Rate', 
      value: `${engagementRate}%`, 
      icon: Users, 
      color: 'text-primary', 
      bgColor: 'bg-primary/10',
      subtitle: 'Active engagement level',
      change: `${engagementRate >= 0 ? '+' : ''}${engagementRate}% of total`,
      changeType: engagementRate >= 50 ? 'increase' : 'decrease' as 'increase' | 'decrease',
      trend: engagementRate >= 50 ? 'up' : 'down' as 'up' | 'down',
      showTrend: false // No historical data for this metric yet
    },
  ];

  const totalSlides = Math.ceil(metrics.length / metricsPerSlide);

  // --- SLIDER STATE ---
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Responsive constants
  const SLIDER_WINDOW_MAX_WIDTH = 960; // px
  const SLIDER_WINDOW_MIN_WIDTH = 480; // px
  const CARD_MIN_WIDTH = 140; // px
  const CARD_MAX_WIDTH = 320; // px
  const cardsPerPage = 3;
  const CARD_GAP = 24; // px (for JS width calc, but use gap-4/gap-6 for CSS)

  const sliderWindowRef = React.useRef<HTMLDivElement>(null);
  const [sliderWindowWidth, setSliderWindowWidth] = useState(0);

  // Responsive: measure the slider window width
  useEffect(() => {
    function updateWidth() {
      if (sliderWindowRef.current) {
        setSliderWindowWidth(sliderWindowRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate card width responsively
  const cardWidth = sliderWindowWidth > 0
    ? Math.max(
        CARD_MIN_WIDTH,
        Math.min((sliderWindowWidth - CARD_GAP * 2) / cardsPerPage, CARD_MAX_WIDTH)
      )
    : CARD_MIN_WIDTH;
  // Calculate number of pages
  const totalPages = Math.ceil(metrics.length / cardsPerPage);

  // Animation handlers
  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 400);
  };
  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 400);
  };

  // Calculate the indices for the current page
  const startIdx = currentPage * cardsPerPage;
  const endIdx = startIdx + cardsPerPage;
  const visibleMetrics = metrics.slice(startIdx, endIdx);

  return (
    <div className="w-full max-w-full mb-8 px-2 sm:px-4 md:px-6 overflow-x-hidden">
      <div
        className="flex flex-col md:flex-row items-stretch md:items-center bg-card rounded-2xl shadow-lg border border-border w-full max-w-full overflow-x-hidden p-2 sm:p-4 md:p-6 gap-4 md:gap-0"
        style={{
          background: 'var(--card)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Key Metrics Card - fixed size, responsive, never overlapped */}
        <div className={`${keyCardBase} ${keyCardResponsive} mb-4 md:mb-0 md:mr-8 flex-shrink-0`}>
          <div className="flex flex-col items-center justify-center h-full w-full px-2">
            <div className="flex items-center mb-2">
              <div className="bg-white/20 rounded-lg p-2 mr-2 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Key Metrics</span>
            </div>
            <span className="text-xs text-white/70">Performance Overview</span>
          </div>
        </div>
        {/* Slider Area: arrows outside the overflow-hidden slider window */}
        <div className="flex flex-row items-center justify-center rounded-2xl bg-muted/70 border border-border shadow-lg backdrop-blur-md w-full max-w-[900px] min-w-[360px] mx-auto px-2 py-4 overflow-x-hidden">
          {/* Left Arrow - outside slider window, hide on xs screens */}
          <div className="hidden xs:flex items-center justify-center h-full mr-2">
            <button
              onClick={handlePrev}
              className="group w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl hover:ring-2 hover:ring-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Previous metrics slide"
              style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}
              disabled={isAnimating}
            >
              <span className="inline-flex transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-110 active:scale-90">
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-muted-foreground" />
              </span>
            </button>
          </div>
          {/* Slider window - robust sizing, always fills available space, centered */}
          <div
            className="relative flex items-center justify-center flex-1 min-w-0 w-full overflow-hidden"
            style={{ height: '100%', margin: '0 auto' }}
          >
            <div
              className="flex w-full flex-row flex-nowrap gap-4"
              style={{ minWidth: 0, height: '100%' }}
            >
              {visibleMetrics.map((metric) => (
                <div
                  key={metric.name}
                  className="flex-shrink-0 flex-1 h-full flex flex-col min-w-0 min-w-[120px] max-w-[280px]"
                >
                  <MetricCard {...metric} className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>
          {/* Right Arrow - outside slider window, hide on xs screens */}
          <div className="hidden xs:flex items-center justify-center h-full ml-2">
            <button
              onClick={handleNext}
              className="group w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl hover:ring-2 hover:ring-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Next metrics slide"
              style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}
              disabled={isAnimating}
            >
              <span className="inline-flex transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110 active:scale-90">
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-muted-foreground" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}