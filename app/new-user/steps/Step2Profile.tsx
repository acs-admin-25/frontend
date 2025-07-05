// Last Modified: 2024-12-19 by Assistant
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Building, Briefcase, ArrowRight, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { useLocation } from '@/lib/hooks/useLocation';
import type { LocationSuggestion } from '@/types/location';

const PROFILE_TITLE = "Tell Us About Yourself";
const PROFILE_SUBTITLE = "Help us personalize your ACS experience with some basic information.";

interface ProfileData {
  bio: string;
  location: string;
  state: string;
  country: string;
  zipcode: string;
  company: string;
  jobTitle: string;
}

interface Step2ProfileProps {
  data: ProfileData;
  setData: (data: ProfileData) => void;
  onContinue: () => void;
  onBack: () => void;
  loading: boolean;
}

const Step2Profile: React.FC<Step2ProfileProps> = ({
  data,
  setData,
  onContinue,
  onBack,
  loading,
}) => {
  // Use the extracted location hook with all constants
  const {
    isDropdownOpen: isAddressDropdownOpen,
    suggestions: addressSuggestions,
    isLoading: isLoadingLocations,
    handleLocationChange,
    selectLocation,
    closeDropdown: closeLocationDropdown,
    constants: { COUNTRIES, US_STATES }
  } = useLocation();

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleLocationInputChange = (value: string) => {
    handleLocationChange(value, (locationValue) => {
      handleInputChange('location', locationValue);
    });
  };

  const selectAddressSuggestion = (suggestion: LocationSuggestion) => {
    selectLocation(suggestion, (locationData) => {
      setData({
        ...data,
        location: locationData.location,
        state: locationData.state,
        country: locationData.country,
        zipcode: locationData.zipcode,
      });
    });
  };

  const canProceed = data.bio.trim().length > 0 && 
                    data.location.trim().length > 0 && 
                    data.country.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-10"
    >
      {/* Page Header with ACS Gradient */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {PROFILE_TITLE}
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-medium">
          {PROFILE_SUBTITLE}
        </p>
      </div>

      {/* Profile Information Section */}
      <section className="mb-10 p-8 rounded-xl bg-card border border-border shadow-sm">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Profile Information
        </h2>
        <div className="space-y-8">
          {/* Bio */}
          <div>
            <label className="block text-base font-semibold text-foreground mb-1">
              Business Bio <span className="text-status-error">*</span>
            </label>
            <p className="text-sm text-muted-foreground mb-2 font-medium">
              Describe your business, target audience, service area, and what makes you unique. This helps ACS personalize responses to your customers.
            </p>
            <textarea
              className="w-full p-4 rounded-lg bg-muted text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base font-medium placeholder-muted-foreground/70 resize-none transition-all duration-200"
              rows={4}
              value={data.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="e.g., 'I'm a real estate agent specializing in luxury homes in downtown Seattle. I help first-time buyers and investors find their perfect property. My focus is on providing personalized service and market expertise to clients looking for homes in the $500K-$2M range.'"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{data.bio.length}/500 characters</p>
          </div>

          {/* Location with autocomplete */}
          <div className="relative">
            <label className="block text-base font-semibold text-foreground mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              Location/City <span className="text-status-error">*</span>
            </label>
            <p className="text-sm text-muted-foreground mb-2 font-medium">
              Enter your city to help us localize your ACS experience.
            </p>
            <div className="relative">
              <input
                type="text"
                className="w-full p-4 pr-10 rounded-lg bg-muted text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base font-medium placeholder-muted-foreground/70 transition-all duration-200"
                value={data.location}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                placeholder="Start typing your city name..."
                autoComplete="off"
              />
              {isLoadingLocations && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              )}
            </div>
            {isAddressDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-2xl backdrop-blur-sm">
                {addressSuggestions.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.uniqueKey}
                        type="button"
                        className="w-full text-left p-3 hover:bg-muted transition-colors text-foreground border-b border-border last:border-b-0 font-medium"
                        onClick={() => selectAddressSuggestion(suggestion)}
                      >
                        <div className="font-semibold text-base text-foreground">{suggestion.city}</div>
                        <div className="text-sm text-muted-foreground">{suggestion.fullAddress}</div>
                      </button>
                    ))}
                  </div>
                ) : !isLoadingLocations && data.location.length > 2 && (
                  <div className="p-3 text-muted-foreground text-sm font-medium">
                    No locations found. Try a different search term.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* State */}
            <div>
              <label className="block text-base font-semibold text-foreground mb-1">
                State/Province
              </label>
              <select
                className="w-full p-4 rounded-lg bg-muted text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base font-medium appearance-none transition-all duration-200"
                value={data.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state} className="bg-card text-foreground">
                    {state}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            {/* Country */}
            <div>
              <label className="block text-base font-semibold text-foreground mb-1">
                Country <span className="text-status-error">*</span>
              </label>
              <select
                className="w-full p-4 rounded-lg bg-muted text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base font-medium appearance-none transition-all duration-200"
                value={data.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              >
                <option value="">Select Country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country} className="bg-card text-foreground">
                    {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Zipcode */}
          <div>
            <label className="block text-base font-semibold text-foreground mb-1">
              Zip/Postal Code
            </label>
            <input
              type="text"
              className="w-full p-4 rounded-lg bg-muted text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base font-medium placeholder-muted-foreground/70 transition-all duration-200"
              value={data.zipcode}
              onChange={(e) => handleInputChange('zipcode', e.target.value)}
              placeholder="Enter your zip or postal code"
              maxLength={10}
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-40 mb-10" />

      {/* Work Information Section */}
      <section className="mb-10 p-8 rounded-xl bg-card border border-border shadow-sm">
        <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Building className="w-6 h-6 text-primary" />
          Work Information <span className="text-base text-muted-foreground font-medium">(Optional)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company */}
          <div>
            <label className="block text-base font-semibold text-foreground mb-1">
              Company
            </label>
            <input
              type="text"
              className="w-full p-4 rounded-lg bg-muted text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base font-medium placeholder-muted-foreground/70 transition-all duration-200"
              value={data.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company name"
            />
          </div>
          {/* Job Title */}
          <div>
            <label className="block text-base font-semibold text-foreground mb-1 flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-primary" />
              Job Title
            </label>
            <input
              type="text"
              className="w-full p-4 rounded-lg bg-muted text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base font-medium placeholder-muted-foreground/70 transition-all duration-200"
              value={data.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder="Your job title or role"
            />
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-8 py-4 text-lg font-bold text-primary hover:text-primary/80 transition-colors rounded-xl bg-muted border border-border shadow-sm"
        >
          ← Back
        </motion.button>
        <motion.button
          whileHover={{ scale: canProceed ? 1.07 : 1 }}
          whileTap={{ scale: canProceed ? 0.95 : 1 }}
          onClick={onContinue}
          disabled={!canProceed || loading}
          className={`px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:from-primary-light hover:to-secondary-light transition disabled:opacity-50 disabled:cursor-not-allowed ${canProceed ? 'hover:-translate-y-1' : ''}`}
        >
          {loading ? 'Saving...' : 'Save & Continue →'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Step2Profile; 