// Core utilities
export * from './common';
export * from './api';
export * from './date';
export * from './security';
export * from './validation';

// Calendar utilities (with specific exports to avoid conflicts)
export {
  formatDate as formatCalendarDate,
  getWeekDays,
  getMonthDays,
  isSameDay,
  isPast,
  isFuture,
  addHours,
  addMinutes,
  getEventDuration,
  formatEventDuration,
  getEventColor,
  getEventStatusColor,
  getEventStatusIcon,
  calculateAvailableSlots,
  generateRecurringDates,
  validateEventData,
  validateAvailabilityData,
  exportCalendarData,
  parseCalendarImport
} from './calendar';

// Formatting utilities (avoid conflicts)
export { 
  formatRelativeTime,
  formatNumber,
  formatFileSize,
  formatPhoneNumber,
  truncateText,
  capitalizeFirst,
  toTitleCase,
  formatCurrency as formatCurrencyAmount
} from './formatting';

// Conversation utilities (avoid formatDuration conflict)
export {
  sortMessagesByDate,
  getMostRecentMessage,
  getFirstMessage,
  getConversationDuration,
  getMessagesInTimeRange,
  groupMessagesByDate,
  getLatestEvaluableMessage,
  getAverageResponseTime,
  formatDuration as formatConversationDuration
} from './conversation';

// Dashboard utilities (avoid formatDuration conflict)
export {
  calculateDashboardMetrics,
  generateAnalytics,
  filterConversationsByDateRange,
  sortConversations,
  groupConversationsByStatus,
  calculateUsageStats,
  formatDuration as formatDurationMinutes,
  formatCurrency as formatDashboardCurrency,
  getStatusColor as getDashboardStatusColor
} from './dashboard';

// Analytics utilities
export {
  calculateKeyMetrics,
  formatMetrics,
  calculateAverageEVByMessage,
  filterConversations as filterAnalyticsConversations
} from './analytics';

// Conversations utilities (avoid conflicts)
export {
  processConversationsData,
  calculateConversationMetrics,
  getStatusColor as getConversationStatusColor
} from '../api/conversations'; 