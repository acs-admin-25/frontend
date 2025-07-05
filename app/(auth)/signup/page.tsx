/**
 * File: app/signup/page.tsx
 * Purpose: Renders the signup page with email/password and Google authentication, including reCAPTCHA verification and password validation.
 * Author: acagliol
 * Date: 06/15/25
 * Version: 1.0.1
 */

"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { SignupData } from '@/types/auth';
import Script from 'next/script';
import { handleAuthError, validateAuthForm, clearAuthData, setAuthType } from '@/lib/auth/auth-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, X, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';

/**
 * Global type declaration for reCAPTCHA
 * Extends Window interface to include reCAPTCHA functionality
 */
declare global {
  interface Window {
    grecaptcha: {
      execute(siteKey: string, options: { action: string }): Promise<string>;
      ready(cb: () => void): void;
    };
  }
}

/**
 * SignupPage Component
 * Client-side signup page with email/password and Google authentication
 * 
 * Features:
 * - Email/password registration
 * - Google OAuth integration
 * - reCAPTCHA verification
 * - Password strength validation
 * - Form validation
 * - Error handling
 * - Loading states
 * - Responsive design
 * 
 * State Management:
 * - Form data
 * - Loading states
 * - Error states
 * - reCAPTCHA states
 * - Password visibility
 * - Validation states
 * 
 * @returns {JSX.Element} Complete signup page with authentication options
 */
const SignupPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
    provider: 'form',
    captchaToken: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(true);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [showUserExistsError, setShowUserExistsError] = useState(false);

  /**
   * Password validation rules
   * Array of checks for password strength requirements
   */
  const passwordChecks = [
    { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
    { label: 'One uppercase letter', test: (pw: string) => /[A-Z]/.test(pw) },
    { label: 'One number', test: (pw: string) => /\d/.test(pw) },
    { label: 'One symbol', test: (pw: string) => /[^A-Za-z0-9\s]/.test(pw) },
  ];

  /**
   * Retrieves reCAPTCHA token for form submission
   * @returns {Promise<string|null>} reCAPTCHA token or null if failed
   * @throws {Error} If reCAPTCHA is not ready or fails to execute
   */
  const getCaptchaToken = async (): Promise<string | null> => {
    if (!recaptchaReady || !window.grecaptcha) {
      setRecaptchaError('reCAPTCHA is not ready. Please refresh the page and try again.');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
        { action: 'signup' }
      );
      if (!token) {
        setRecaptchaError('Failed to get reCAPTCHA token. Please try again.');
        return null;
      }
      return token;
    } catch (error) {
      console.error('Captcha error:', error);
      setRecaptchaError('Failed to verify reCAPTCHA. Please try again.');
      return null;
    }
  };

  /**
   * Handles form input changes
   * Updates form state based on input field changes
   * 
   * @param {ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "confirmPassword") {
      setConfirmPassword(value)
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  /**
   * Handles form submission
   * Validates form data, checks password requirements, and creates account
   * 
   * @param {FormEvent<HTMLFormElement>} e - Form submission event
   * @throws {Error} If validation fails or account creation fails
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecaptchaError(null);

    try {
      // Validate form data
      const validation = validateAuthForm(formData);
      if (!validation.isValid) {
        setError(validation.error || "Invalid form data");
        setShowRequirements(true);
        return;
      }

      // Check password match
      if (formData.password !== confirmPassword) {
        setError("Passwords do not match");
        setShowRequirements(true);
        return;
      }

      // Get reCAPTCHA token
      if (!recaptchaReady) {
        setError("reCAPTCHA is not ready. Please try again.");
        return;
      }

      const token = await getCaptchaToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Update form data with captcha token
      setFormData((prev) => ({
        ...prev,
        captchaToken: token,
      }));

      // Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          captchaToken: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "User already exists") {
          setShowUserExistsError(true);
        } else {
          setError(handleAuthError(data.error));
        }
        return;
      }

      // Clear form data and redirect
      clearAuthData();
      setAuthType('new');
      
      // After successful signup, the backend already creates a session
      // We need to ensure NextAuth is synchronized with this session
      
      // Create a NextAuth session without triggering another login call
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        provider: 'form',
        redirect: false,
        callbackUrl: '/dashboard'
      });


      if (result?.error) {
        console.error('[signup] NextAuth session creation error:', result.error);
        // Even if NextAuth session creation fails, the backend session exists
        // Redirect to dashboard anyway
        router.push('/process-form?authType=new');
        return;
      }

      // Redirect to dashboard
      router.push('/process-form?authType=new');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google OAuth signup
   * Initiates Google authentication flow
   * 
   * @throws {Error} If Google authentication fails
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signIn('google', { callbackUrl: '/process-google' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initializes reCAPTCHA
   * Sets up ready state when reCAPTCHA is loaded
   */
  useEffect(() => {
    const initializeRecaptcha = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setRecaptchaReady(true);
          setRecaptchaLoading(false);
        });
      }
    };

    let checkInterval: NodeJS.Timeout;

    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      initializeRecaptcha();
    } else {
      // Wait for reCAPTCHA to be loaded by the Script component
      checkInterval = setInterval(() => {
        if (window.grecaptcha) {
          initializeRecaptcha();
          clearInterval(checkInterval);
        }
      }, 100);

      // Clear interval after 10 seconds if reCAPTCHA doesn't load
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.grecaptcha) {
          setRecaptchaLoading(false);
          setRecaptchaError('reCAPTCHA failed to load. Please refresh the page.');
        }
      }, 10000);
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, []);

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
        onLoad={() => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              setRecaptchaReady(true);
              setRecaptchaLoading(false);
            });
          }
        }}
        onError={() => {
          setRecaptchaLoading(false);
          setRecaptchaError('Failed to load reCAPTCHA. Please refresh the page.');
        }}
      />
      <div className="min-h-screen w-full bg-background flex flex-col">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center">
            <Link href="/" className="no-underline">
              <span className="text-xl font-semibold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                ACS
              </span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Enter your details to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Signup Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {recaptchaError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>reCAPTCHA Error</AlertTitle>
                  <AlertDescription>{recaptchaError}</AlertDescription>
                </Alert>
              )}
              {showUserExistsError && (
                 <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>User Exists</AlertTitle>
                  <AlertDescription>
                    An account with this email already exists. Please <Link href="/login" className="font-bold hover:underline">Sign In</Link> instead.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      onFocus={() => setShowRequirements(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                    />
                     <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {showRequirements && (
                  <div className="p-4 bg-accent border border-neutral-200 rounded-xl text-sm">
                    <h3 className="font-medium mb-2 text-foreground">Password Requirements:</h3>
                    <ul className="space-y-1">
                      {passwordChecks.map((check) => (
                        <li key={check.label} className={`flex items-center ${check.test(formData.password || '') ? 'text-primary' : 'text-muted-foreground'}`}>
                          {check.test(formData.password || '') ? <Check className="h-4 w-4 mr-2 text-primary" /> : <X className="h-4 w-4 mr-2 text-muted-foreground" />}
                          {check.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || recaptchaLoading}
                  className="w-full"
                >
                  {loading || recaptchaLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      {loading ? 'Creating account...' : 'Loading...'}
                    </div>
                  ) : (
                    'Sign up'
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing up...
                    </div>
                  ) : (
                    <>
                      <Image src="/google.svg" alt="Google" width={18} height={18} className="mr-3" />
                      Sign up with Google
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-muted hover:text-secondary">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignupPage;

/**
 * Change Log:
 * 06/15/25 - Version 1.0.1
 * - Removed: -- a/app/signup/page.tsx
 * - Added: ++ b/app/signup/page.tsx
 * - Removed: 'use client';
 * - Added: "use client";
 * - Removed: import React, { useState, useEffect } from 'react';
 * 5/25/25 - Initial version
 * - Created signup page with email/password registration
 * - Implemented Google OAuth integration
 * - Added reCAPTCHA verification
 * - Integrated password strength validation
 * - Added form validation and error handling
 * - Implemented loading states and animations
 * - Enhanced UI with responsive design
 * - Added user feedback and notifications
 */
