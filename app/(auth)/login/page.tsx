/**
 * File: app/login/page.tsx
 * Purpose: Renders the login page with email/password and Google authentication options.
 * Author: acagliol
 * Date: 06/15/25
 * Version: 1.0.1
 */

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signIn, useSession } from "next-auth/react"
import { handleAuthError, validateAuthForm } from "@/lib/auth/auth-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/common/Feedback/LoadingSpinner"
import { Logo } from "@/components/ui/Logo"

/**
 * LoginPage Component
 * Client-side login page with email/password and Google authentication
 * 
 * Features:
 * - Email/password authentication
 * - Google OAuth integration
 * - Form validation
 * - Error handling
 * - Loading states
 * - Remember me functionality
 * - Password recovery link
 * - Sign up redirection
 * 
 * @returns {JSX.Element} Complete login page with authentication options
 */
const LoginPage = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signInTriggered, setSignInTriggered] = useState(false)

  // Handle session changes after signIn
  useEffect(() => {
    if (signInTriggered && status !== "loading" && session?.user) {
      router.push(`/process-form?authType=existing`);
      setSignInTriggered(false);
    }
  }, [session, status, signInTriggered, router]);

  /**
   * Handles input field changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Handles Google OAuth login
   * Sets auth type and redirects to Google authentication
   * @throws {Error} If authentication fails
   */
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug logging
      console.log('Starting Google login...');
      
      localStorage.setItem('authType', 'existing');
      
      const result = await signIn('google', {
        callbackUrl: '/process-google',
        redirect: false // Change to false to handle the result
      });

      console.log('Google signIn result:', result);

      if (result?.error) {
        console.error('Google signIn error:', result.error);
        setError(`Google login failed: ${result.error}`);
      } else if (result?.ok) {
        // Successful sign-in, redirect manually
        console.log('Google signIn successful, redirecting...');
        window.location.href = result.url || '/process-google';
      } else {
      }
    } catch (err: any) {
      console.error('Google login exception:', err);
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission for email/password login
   * Validates form data and creates NextAuth session
   * @param {React.FormEvent} e - Form submission event
   * @throws {Error} If validation or authentication fails
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const validation = validateAuthForm(formData);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid form data');
        return;
      }

      // Create NextAuth session
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        provider: 'form',
        redirect: false,
        callbackUrl: '/dashboard'
      });

      if (result?.error) {
        // Handle specific error cases
        if (result.error.includes('500') || result.error.includes('server error')) {
          setError('We\'re experiencing technical difficulties. Please try again later or contact support at support@automatedconsultancy.com for assistance.');
        } else {
          setError(result.error);
        }
        return;
      }

      // Set flag to trigger redirect when session is ready
      setSignInTriggered(true);
    } catch (err: any) {
      // Handle specific error cases
      if (err.message?.includes('500') || err.message?.includes('server error')) {
        setError('We\'re experiencing technical difficulties. Please try again later or contact support at support@automatedconsultancy.com for assistance.');
      } else {
        setError(handleAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full h-full">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center">
          <Link href="/" className="no-underline">
            <Logo variant="icon-only" />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-primary/10 p-8 transition-all duration-300 hover:shadow-2xl">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground">Welcome Back!</h1>
              <p className="text-muted-foreground text-sm mt-2 transition-colors duration-200">
                Enter your Credentials to access your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl transition-all duration-300">
                <p className="font-medium mb-1">Login Error</p>
                <p>{error}</p>
                {error.includes('technical difficulties') && (
                  <p className="mt-2 text-muted-foreground">
                    Need help? Contact our support team at{' '}
                    <a href="mailto:support@automatedconsultancy.com" className="underline hover:text-primary">
                      support@automatedconsultancy.com
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-ring border-input rounded transition-colors duration-200"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                    Remember for 30 days
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-secondary transition-colors duration-200 font-medium"
                >
                  Forgot password
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Google Sign In */}
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    <Image src="/google.svg" alt="Google" width={18} height={18} className="mr-3" />
                    Sign in with Google
                  </>
                )}
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:text-secondary">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

/**
 * Change Log:
 * 06/15/25 - Version 1.0.1
 * - Removed: -- a/app/login/page.tsx
 * - Added: ++ b/app/login/page.tsx
 * - Removed:               <p className="text-sm text-[#0e6537]/70">
 * - Removed:                 Don't have an account?{" "}
 * - Removed:                 <Link
 * 5/25/25 - Initial version
 * - Created login page with email/password authentication
 * - Implemented Google OAuth integration
 * - Added form validation and error handling
 * - Integrated loading states and animations
 * - Added remember me functionality
 * - Implemented password recovery link
 * - Added sign up redirection
 */
