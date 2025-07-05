import { formatDate } from './formatting';

/**
 * File: lib/utils/date.ts
 * Purpose: Centralized date handling utilities for robust date operations
 * Author: AI Assistant
 * Date: 2024-12-19
 * Version: 1.0.0
 */

/**
 * Safely converts localDate to a Date object
 * This handles cases where localDate might be a string (from localStorage) or a Date object
 * Provides robust fallback handling for invalid dates
 */
export function ensureLocalDate(localDate: any): Date {
  if (localDate instanceof Date) {
    return localDate;
  }
  
  if (!localDate) {
    return new Date();
  }
  
  try {
    const date = new Date(localDate);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('Invalid localDate value:', localDate, 'falling back to current date');
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing localDate:', error, 'Value:', localDate, 'falling back to current date');
    return new Date();
  }
}

/**
 * Safely converts a timestamp to a Date object with proper error handling
 * Handles various timestamp formats and provides robust fallbacks
 */
export function safeParseDate(timestamp: string | Date | undefined | null): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (!timestamp) {
    return new Date();
  }
  
  try {
    let normalized = timestamp;
    
    // Handle different timestamp formats
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/.test(timestamp)) {
      // Format: 2025-06-18T02:24:04.542130 (microseconds, no timezone)
      normalized = timestamp + 'Z';
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/.test(timestamp)) {
      // Format: 2025-06-18T02:24:04.123 (milliseconds, no timezone)
      normalized = timestamp + 'Z';
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      // Format: 2025-06-18T02:24:04 (no timezone)
      normalized = timestamp + 'Z';
    }
    
    const date = new Date(normalized);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp format:', timestamp, 'falling back to current date');
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing timestamp:', error, 'Timestamp:', timestamp, 'falling back to current date');
    return new Date();
  }
}

/**
 * Safely compares two dates, handling cases where either might be invalid
 * Returns a comparison result suitable for sorting
 */
export function compareDates(dateA: any, dateB: any, ascending: boolean = false): number {
  const safeDateA = ensureLocalDate(dateA);
  const safeDateB = ensureLocalDate(dateB);
  
  const timeA = safeDateA.getTime();
  const timeB = safeDateB.getTime();
  
  return ascending ? timeA - timeB : timeB - timeA;
}

/**
 * Safely gets the time value from a date, with fallback to current time
 */
export function getSafeTime(date: any): number {
  return ensureLocalDate(date).getTime();
}

/**
 * Validates if a value is a valid Date object
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  return getStartOfDay(result);
}

export function getEndOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? 0 : 7);
  result.setDate(diff);
  return getEndOfDay(result);
}

export function getStartOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  return getStartOfDay(result);
}

export function getEndOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  return getEndOfDay(result);
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isYesterday(date: Date): boolean {
  const yesterday = addDays(new Date(), -1);
  return date.toDateString() === yesterday.toDateString();
}

export function isThisWeek(date: Date): boolean {
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = getEndOfWeek(new Date());
  return date >= startOfWeek && date <= endOfWeek;
}

export function isThisMonth(date: Date): boolean {
  const startOfMonth = getStartOfMonth(new Date());
  const endOfMonth = getEndOfMonth(new Date());
  return date >= startOfMonth && date <= endOfMonth;
}

export function getDaysBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export function getMonthsBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  
  return dates;
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDate(startDate, { month: 'short', day: 'numeric' });
  const end = formatDate(endDate, { month: 'short', day: 'numeric', year: 'numeric' });
  
  if (startDate.getFullYear() === endDate.getFullYear()) {
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${start} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }
    return `${start} - ${end}`;
  }
  
  return `${start}, ${startDate.getFullYear()} - ${end}`;
} 