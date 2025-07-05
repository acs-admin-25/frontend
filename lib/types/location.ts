/**
 * Location-related TypeScript interfaces and types
 * Used for location autocomplete functionality throughout the application
 */

export interface LocationSuggestion {
  fullAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  displayName: string;
  uniqueKey: string;
}

export interface LocationData {
  location: string;
  state: string;
  country: string;
  zipcode: string;
}

export interface LocationAutocompleteState {
  isDropdownOpen: boolean;
  suggestions: LocationSuggestion[];
  isLoading: boolean;
  searchTimeout: NodeJS.Timeout | null;
}

export interface LocationConstants {
  COUNTRIES: string[];
  US_STATES: string[];
} 