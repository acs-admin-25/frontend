import { useState } from 'react';

export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function useSendMessage() {
  const [formData, setFormData] = useState<ContactMessageData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState(false);

  const updateField = (field: keyof ContactMessageData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    setApiSuccess(false);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setApiSuccess(true);
    }, 1200);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitted(false);
    setApiError(null);
    setApiSuccess(false);
  };

  return {
    formData,
    isSubmitting,
    isSubmitted,
    apiError,
    apiSuccess,
    updateField,
    handleSubmit,
    resetForm,
  };
}
