import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Settings, Eye, BarChart3, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import { DateRange } from 'react-day-picker';

// Dashboard Settings Types
export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';
export type ChartType = 'line' | 'bar' | 'area' | 'radar' | 'pie';
export type ViewMode = 'compact' | 'detailed' | 'fullscreen';
export type RefreshInterval = 'off' | '30s' | '1m' | '5m' | '15m';

export interface DashboardSettings {
  timeRange: TimeRange;
  dateRange: DateRange;
  chartType: ChartType;
  viewMode: ViewMode;
  refreshInterval: RefreshInterval;
  showMetrics: boolean;
  showAnalyticsSnippet: boolean;
  showResources: boolean;
  showUsage: boolean;
  customDateRange?: {
    start: Date;
    end: Date;
  };
}

interface DashboardSettingsContextType {
  settings: DashboardSettings;
  updateSettings: (updates: Partial<DashboardSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: DashboardSettings = {
  timeRange: '30d',
  dateRange: {
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  },
  chartType: 'line',
  viewMode: 'detailed',
  refreshInterval: 'off',
  showMetrics: true,
  showAnalyticsSnippet: true,
  showResources: true,
  showUsage: true,
};

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined);

export function useDashboardSettings() {
  const context = useContext(DashboardSettingsContext);
  if (!context) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider');
  }
  return context;
}

interface DashboardSettingsProviderProps {
  children: ReactNode;
  initialSettings?: Partial<DashboardSettings>;
}

export function DashboardSettingsProvider({ 
  children, 
  initialSettings = {} 
}: DashboardSettingsProviderProps) {
  const [settings, setSettings] = useState<DashboardSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  const updateSettings = (updates: Partial<DashboardSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <DashboardSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </DashboardSettingsContext.Provider>
  );
}

interface DashboardSettingsPanelProps {
  className?: string;
}

export function DashboardSettingsPanel({ className }: DashboardSettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useDashboardSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    const now = new Date();
    let from = new Date();
    switch (timeRange) {
      case '7d':
        from.setDate(now.getDate() - 7);
        break;
      case '30d':
        from.setDate(now.getDate() - 30);
        break;
      case '90d':
        from.setDate(now.getDate() - 90);
        break;
      case '1y':
        from.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        // For custom, we don't change the dateRange here. 
        // It will be handled by a DateRangePicker component.
        updateSettings({ timeRange });
        return;
    }
    updateSettings({ timeRange, dateRange: { from, to: now } });
  };

  const timeRangeOptions: { value: TimeRange; label: string; icon: React.ReactNode }[] = [
    { value: '7d', label: '7 Days', icon: <Calendar className="h-4 w-4" /> },
    { value: '30d', label: '30 Days', icon: <Calendar className="h-4 w-4" /> },
    { value: '90d', label: '90 Days', icon: <Calendar className="h-4 w-4" /> },
    { value: '1y', label: '1 Year', icon: <Calendar className="h-4 w-4" /> },
    { value: 'custom', label: 'Custom', icon: <Filter className="h-4 w-4" /> },
  ];

  const chartTypeOptions: { value: ChartType; label: string; icon: React.ReactNode }[] = [
    { value: 'line', label: 'Line Chart', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'area', label: 'Area Chart', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'radar', label: 'Radar Chart', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'pie', label: 'Pie Chart', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const viewModeOptions: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    { value: 'compact', label: 'Compact', icon: <Eye className="h-4 w-4" /> },
    { value: 'detailed', label: 'Detailed', icon: <Eye className="h-4 w-4" /> },
    { value: 'fullscreen', label: 'Fullscreen', icon: <Eye className="h-4 w-4" /> },
  ];

  const refreshIntervalOptions: { value: RefreshInterval; label: string }[] = [
    { value: 'off', label: 'Off' },
    { value: '30s', label: '30 seconds' },
    { value: '1m', label: '1 minute' },
    { value: '5m', label: '5 minutes' },
    { value: '15m', label: '15 minutes' },
  ];

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard Settings</h3>
            
            {/* Time Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <div className="grid grid-cols-2 gap-2">
                {timeRangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={settings.timeRange === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeRangeChange(option.value)}
                    className={cn(
                      "justify-start",
                      settings.timeRange === option.value && "bg-[#0e6537] hover:bg-[#0a4a2a]"
                    )}
                  >
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Chart Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <div className="grid grid-cols-2 gap-2">
                {chartTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={settings.chartType === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings({ chartType: option.value })}
                    className={cn(
                      "justify-start",
                      settings.chartType === option.value && "bg-[#0e6537] hover:bg-[#0a4a2a]"
                    )}
                  >
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* View Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {viewModeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={settings.viewMode === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings({ viewMode: option.value })}
                    className={cn(
                      "justify-start",
                      settings.viewMode === option.value && "bg-[#0e6537] hover:bg-[#0a4a2a]"
                    )}
                  >
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Refresh Interval */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Auto Refresh</label>
              <select
                value={settings.refreshInterval}
                onChange={(e) => updateSettings({ refreshInterval: e.target.value as RefreshInterval })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0e6537] focus:border-[#0e6537]"
              >
                {refreshIntervalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility Toggles */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Show Sections</label>
              <div className="space-y-2">
                {[
                  { key: 'showMetrics' as keyof DashboardSettings, label: 'Metrics Cards' },
                  { key: 'showAnalyticsSnippet' as keyof DashboardSettings, label: 'Analytics Snippet' },
                  { key: 'showResources' as keyof DashboardSettings, label: 'Quick Resources' },
                  { key: 'showUsage' as keyof DashboardSettings, label: 'Usage Overview' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings[key] as boolean}
                      onChange={(e) => updateSettings({ [key]: e.target.checked })}
                      className="rounded border-gray-300 text-[#0e6537] focus:ring-[#0e6537]"
                    />
                    <span className="ml-2 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset to defaults
                  resetSettings();
                }}
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Custom hook to access only the state from the dashboard settings.
 * This can be used in components that need to react to settings changes
 * but do not need to modify them.
 */
export function useDashboardSettingsState() {
  const { settings } = useDashboardSettings();
  return settings;
} 