import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { ContactMessageData, useSendMessage } from '../hooks/useSendMessage';

interface SendMessageSectionProps {
  variants: any;
  onReset?: () => void;
}

/**
 * SendMessageSection Component
 * Displays the contact form with validation and submission handling
 * 
 * @param variants - Framer Motion variants for animations
 * @param onReset - Optional callback to reset the form
 * @returns {JSX.Element} Send message section component
 */
export function SendMessageSection({
  variants,
  onReset
}: SendMessageSectionProps) {
  const {
    formData,
    isSubmitting,
    isSubmitted,
    apiError,
    apiSuccess,
    updateField,
    handleSubmit,
    resetForm,
    handleDemoRequest,
  } = useSendMessage();

  // Handle form field changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;
    
    if (name === "isDemoRequest") {
      handleDemoRequest(checked);
    } else {
      updateField(name as keyof ContactMessageData, type === "checkbox" ? checked : value);
    }
  };

  // Handle form reset
  const handleFormReset = () => {
    resetForm();
    onReset?.();
  };
  return (
    <motion.div className="md:col-span-7 lg:col-span-8" variants={variants}>
      <div className="rounded-xl bg-card p-4 sm:p-8 shadow-lg">
        {isSubmitted ? (
          <motion.div
            className="flex flex-col items-center justify-center py-8 sm:py-16 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 sm:mb-6 rounded-full bg-accent p-3 sm:p-4">
              <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-secondary" />
            </div>
            <h2 className="mb-2 text-xl sm:text-2xl font-bold text-card-foreground">
              Message Sent Successfully!
            </h2>
            <p className="mb-6 sm:mb-8 max-w-md text-sm sm:text-base text-muted-foreground">
              Thank you for reaching out to us. We've received your message and will get back to you as soon as
              possible.
            </p>
            <Button
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              onClick={handleFormReset}
            >
              Send Another Message
            </Button>
          </motion.div>
        ) : (
          <div className="overflow-hidden">
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-semibold text-card-foreground">
                Send Us a Message
              </h2>
              <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-secondary to-primary"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Fill out the form below, and we'll be in touch as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder="Enter message subject"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Enter your message"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDemoRequest"
                  name="isDemoRequest"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  checked={formData.isDemoRequest}
                  onChange={handleFormChange}
                />
                <label htmlFor="isDemoRequest" className="ml-2 block text-sm text-foreground">
                  Request a demo
                </label>
              </div>
              {apiError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              {apiSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Message sent successfully! We'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r text-muted from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
} 