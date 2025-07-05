/**
 * Hook for managing contact message sending functionality
 * Used by the SendMessageSection component for marketing contact forms
 */

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/api/errorHandling';
import type { ApiResponse } from '@/types/api';

/**
 * Interface for the contact message form data
 */
export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
  isDemoRequest: boolean;
}

/**
 * Interface for the hook return value
 */
export interface UseSendMessageReturn {
  // State
  formData: ContactMessageData;
  isSubmitting: boolean;
  isSubmitted: boolean;
  apiError: string;
  apiSuccess: boolean;
  
  // Actions
  updateField: (field: keyof ContactMessageData, value: string | boolean) => void;
  validateForm: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  handleDemoRequest: (isDemo: boolean) => void;
}

/**
 * Default form data
 */
const defaultFormData: ContactMessageData = {
  name: "",
  email: "",
  subject: "",
  message: "",
  isDemoRequest: false,
};

/**
 * Hook for managing contact message sending
 * 
 * @returns {UseSendMessageReturn} Hook state and actions
 */
export function useSendMessage(): UseSendMessageReturn {
  const [formData, setFormData] = useState<ContactMessageData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState(false);

  /**
   * Update a specific form field
   */
  const updateField = useCallback((field: keyof ContactMessageData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (apiError) {
      setApiError("");
    }
  }, [apiError]);

  /**
   * Validate the form data
   */
  const validateForm = useCallback((): boolean => {
    if (!formData.name.trim()) {
      setApiError("Name is required");
      return false;
    }
    
    if (!formData.email.trim()) {
      setApiError("Email is required");
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setApiError("Please enter a valid email address");
      return false;
    }
    
    if (!formData.subject.trim()) {
      setApiError("Subject is required");
      return false;
    }
    
    if (!formData.message.trim()) {
      setApiError("Message is required");
      return false;
    }
    
    return true;
  }, [formData]);

  /**
   * Handle demo request checkbox
   */
  const handleDemoRequest = useCallback((isDemo: boolean) => {
    if (isDemo) {
      setFormData(prev => ({
        ...prev,
        isDemoRequest: true,
        subject: "Demo Request",
        message: "Hello, I am interested in a demo of your AI-powered real estate platform. I would like to learn more about how it can help my business. Please provide more information about scheduling a demo session.",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        isDemoRequest: false,
        subject: "",
        message: "",
      }));
    }
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess(false);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.request('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }

      setIsSubmitted(true);
      setApiSuccess(true);
      setFormData(defaultFormData);
      
    } catch (err) {
      const appError = handleApiError(err);
      setApiError(appError.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  /**
   * Reset the form to initial state
   */
  const resetForm = useCallback(() => {
    setIsSubmitted(false);
    setApiError("");
    setApiSuccess(false);
    setFormData(defaultFormData);
  }, []);

  return {
    // State
    formData,
    isSubmitting,
    isSubmitted,
    apiError,
    apiSuccess,
    
    // Actions
    updateField,
    validateForm,
    handleSubmit,
    resetForm,
    handleDemoRequest,
  };
} 