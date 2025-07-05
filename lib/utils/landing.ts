/**
 * Utility functions for landing page components
 */

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Formats a statement for display with proper capitalization
 * @param statement - The statement to format
 * @returns Formatted statement
 */
export function formatStatement(statement: string): string {
  return statement.charAt(0).toUpperCase() + statement.slice(1);
}

/**
 * Generates a unique key for list items
 * @param prefix - The prefix for the key
 * @param index - The index of the item
 * @returns A unique key string
 */
export function generateKey(prefix: string, index: number): string {
  return `${prefix}-${index}`;
} 