/**
 * Search Utilities
 * Functions for search highlighting and text processing
 */

import React from 'react';

/**
 * Highlights search terms in text by wrapping them in a span with highlighting classes
 * @param text - The text to highlight
 * @param searchQuery - The search query to highlight
 * @returns JSX elements with highlighted text
 */
export function highlightSearchText(text: string, searchQuery: string): React.ReactNode[] {
  if (!searchQuery.trim()) {
    return [text];
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <span
          key={index}
          className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-medium"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

/**
 * Checks if text contains the search query (case-insensitive)
 * @param text - The text to check
 * @param searchQuery - The search query
 * @returns boolean indicating if text contains the query
 */
export function textContainsQuery(text: string, searchQuery: string): boolean {
  if (!searchQuery.trim()) return true;
  return text.toLowerCase().includes(searchQuery.toLowerCase());
}

/**
 * Filters an array of items based on search query
 * @param items - Array of items to filter
 * @param searchQuery - The search query
 * @param searchFields - Array of field names to search in
 * @returns Filtered array of items
 */
export function filterBySearchQuery<T>(
  items: T[],
  searchQuery: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchQuery.trim()) return items;

  const query = searchQuery.toLowerCase();
  
  return items.filter(item => 
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(query);
      }
      return false;
    })
  );
} 