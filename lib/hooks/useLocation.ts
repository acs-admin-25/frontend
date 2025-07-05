/**
 * Custom hook for location autocomplete using OpenStreetMap Nominatim API
 * Extracted from the new user setup process for reusability
 */

import { useState, useCallback, useEffect } from 'react';
import type { 
  LocationSuggestion, 
  LocationData, 
  LocationAutocompleteState,
  LocationConstants 
} from '@/types/location';

// Move all hardcoded data into the hook
const LOCATION_CONSTANTS: LocationConstants = {
  COUNTRIES: [
    "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Spain", "Italy", "Netherlands", "Other"
  ],
  US_STATES: [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ]
};

export function useLocation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced location search function
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use our local API route to avoid CORS issues
      const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Process and deduplicate results
        const processedSuggestions: LocationSuggestion[] = [];
        const seenCities = new Set<string>();
        
        data.forEach((item: any) => {
          const city = item.city || '';
          const state = item.state || '';
          const country = item.country || '';
          
          // Skip if no city name
          if (!city) return;
          
          // Map country names to our dropdown values
          let mappedCountry = country;
          switch (country) {
            case 'United States of America':
            case 'United States':
              mappedCountry = 'United States';
              break;
            case 'United Kingdom':
            case 'England':
            case 'Scotland':
            case 'Wales':
            case 'Northern Ireland':
              mappedCountry = 'United Kingdom';
              break;
            case 'Deutschland':
              mappedCountry = 'Germany';
              break;
            case 'España':
              mappedCountry = 'Spain';
              break;
            case 'France':
            case 'République française':
              mappedCountry = 'France';
              break;
            default:
              if (!LOCATION_CONSTANTS.COUNTRIES.includes(country)) {
                mappedCountry = 'Other';
              }
              break;
          }
          
          // Create unique key for deduplication
          const uniqueKey = `${city.toLowerCase()}-${state.toLowerCase()}-${mappedCountry.toLowerCase()}`;
          
          // Skip duplicates
          if (seenCities.has(uniqueKey)) return;
          seenCities.add(uniqueKey);
          
          const suggestion: LocationSuggestion = {
            fullAddress: `${city}${state ? ', ' + state : ''}${mappedCountry ? ', ' + mappedCountry : ''}`,
            city: city.trim(),
            state: state.trim(),
            country: mappedCountry.trim(),
            zipCode: '', // We'll get this from the API if available
            displayName: item.fullAddress,
            uniqueKey
          };
          
          processedSuggestions.push(suggestion);
        });
        
        // Sort by relevance (shorter display names first, then alphabetically)
        processedSuggestions.sort((a, b) => {
          const aRelevance = a.city.toLowerCase().indexOf(query.toLowerCase());
          const bRelevance = b.city.toLowerCase().indexOf(query.toLowerCase());
          
          if (aRelevance !== bRelevance) {
            return aRelevance - bRelevance;
          }
          
          return a.fullAddress.localeCompare(b.fullAddress);
        });
        
        // Limit to 8 most relevant results for better progressive matching
        const limitedSuggestions = processedSuggestions.slice(0, 8);
        
        setSuggestions(limitedSuggestions);
        setIsDropdownOpen(limitedSuggestions.length > 0);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      // Show error state but don't break the UI
      setSuggestions([]);
      setIsDropdownOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLocationChange = useCallback((value: string, onLocationChange: (value: string) => void) => {
    onLocationChange(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search (300ms delay for more responsive feel)
    const newTimeout = setTimeout(() => {
      searchLocations(value);
    }, 300);
    
    setSearchTimeout(newTimeout);
    
    // If input is cleared, close dropdown immediately
    if (value.length === 0) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setIsLoading(false);
    }
  }, [searchTimeout, searchLocations]);

  const selectLocation = useCallback((suggestion: LocationSuggestion, onLocationSelect: (locationData: LocationData) => void) => {
    onLocationSelect({
      location: suggestion.city,
      state: suggestion.state,
      country: suggestion.country,
      zipcode: suggestion.zipCode,
    });
    setIsDropdownOpen(false);
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return {
    isDropdownOpen,
    suggestions,
    isLoading,
    handleLocationChange,
    selectLocation,
    closeDropdown,
    constants: LOCATION_CONSTANTS
  };
} 