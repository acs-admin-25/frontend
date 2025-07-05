/**
 * File: app/demo/page.tsx
 * Purpose: Demo access page with code verification and navigation to login/signup
 * Author: Assistant
 * Date: 12/19/24
 * Version: 1.0.0
 */

"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, UserPlus, LogIn, Lock, Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { useApi } from '@/lib/hooks/useApi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner'

/**
 * DemoPage Component
 * Demo access page with code verification functionality
 * 
 * Features:
 * - Demo code verification
 * - ACS brand design consistency
 * - Error handling and validation
 * - Loading states
 * - Navigation options to login/signup after verification
 * - Responsive design
 * - Password visibility toggle
 * 
 * State Management:
 * - Demo code input
 * - Loading state
 * - Error state
 * - Success state
 * - Password visibility state
 * - Verification completed state
 * 
 * @returns {JSX.Element} Complete demo access page
 */
const DemoPage = () => {
  const router = useRouter()
  const [demoCode, setDemoCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verify, setVerify] = useState(false)
  const [verificationCompleted, setVerificationCompleted] = useState(false)

  const { data, loading, error, refetch } = useApi<any>('verify-demo', {
    method: 'POST',
    body: { demoCode },
    enabled: verify,
    onSuccess: () => {
      setVerificationCompleted(true)
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDemoCode(e.target.value)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerify(true);
  }

  const handleNavigation = (route: string) => {
    router.push(route)
  }

  useEffect(() => {
      if(verify) {
          refetch();
          setVerify(false);
      }
  }, [verify, refetch]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-accent/50 to-accent flex flex-col w-full h-full">
        

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 pb-16 w-full h-full">
          <div className="w-full max-w-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl shadow-xl border border-border p-8 transition-all duration-300 hover:shadow-2xl"
            >
              {/* Page Header */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary-dark to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-text-on-gradient" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2 font-sans">
                  Demo Access Required
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">
                  ACS is currently in a closed demo phase. Enter your demo code to access the platform.
                </p>
              </div>

              {/* Info Box */}
              <div className="mb-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>For more information</AlertTitle>
                  <AlertDescription>
                     Visit{' '}
                      <a
                        href="https://www.demoacs.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-status-info underline hover:text-status-info/80 transition-colors"
                      >
                        https://www.demoacs.com
                      </a>
                  </AlertDescription>
                </Alert>
              </div>

              {/* Success Message */}
              {data?.success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <Alert variant="default">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>Demo code verified successfully!</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Navigation Options - Show after successful verification */}
              {verificationCompleted && data?.success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-foreground mb-2 font-sans">
                      Choose Your Next Step
                    </h3>
                    <p className="text-muted-foreground text-sm font-sans">
                      Create a new account or sign in to your existing account
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Sign Up Button */}
                    <Button onClick={() => handleNavigation('/signup')} className="w-full text-text-on-gradient">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create New Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    {/* Login Button */}
                    <Button onClick={() => handleNavigation('/login')} variant="outline" className="w-full">
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In to Existing Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Demo Code Form - Hide after successful verification */}
              {!verificationCompleted && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="demoCode" className="block text-sm font-medium text-foreground mb-2 font-sans">
                      Demo Code
                    </label>
                    <div className="relative">
                      <Input
                        id="demoCode"
                        name="demoCode"
                        type={showPassword ? "text" : "password"}
                        required
                        value={demoCode}
                        onChange={handleChange}
                        placeholder="Enter your demo code"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !demoCode.trim()}
                    className="w-full text-text-on-gradient"
                  >
                    {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Demo Code'
                      )}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
  )
}

export default DemoPage 