import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks/useProfile';

export function useNewUser() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { 
        profile, 
        isLoading, 
        error, 
        updateProfile, 
        updateBasicInfo, 
        updateProfessionalInfo, 
        updateContactInfo, 
        updateEmailSettings, 
        updateLCPSettings,
        markProfileComplete,
        updateOnboardingStep,
        completion,
        nextOnboardingStep
    } = useProfile();

    const [step, setStep] = useState(1);
    const [localError, setLocalError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const isTransitioningRef = useRef(false);

    // Form states - these will be populated from profile data
    const [profileData, setProfileData] = useState({
        bio: '',
        location: '',
        state: '',
        country: '',
        zipcode: '',
        company: '',
        jobTitle: ''
    });

    const [emailData, setEmailData] = useState({
        responseEmail: '',
        customDomain: '',
        customEmail: '',
        emailOption: 'default' as 'default' | 'custom',
    });

    const [lcpSettings, setLcpSettings] = useState({
        lcp_tone: "professional" as 'professional' | 'casual' | 'friendly' | 'formal',
        lcp_style: "concise" as 'concise' | 'detailed' | 'conversational' | 'direct',
        lcp_sample_prompt: ""
    });

    const [settingsData, setSettingsData] = useState({
        signature: '',
        smsEnabled: false,
        phone: '',
        autoEmails: true,
    });

    // Populate form data from profile when it loads
    useEffect(() => {
        if (profile) {
            setProfileData({
                bio: profile.bio || '',
                location: profile.location || '',
                state: profile.state || '',
                country: profile.country || '',
                zipcode: profile.zipcode || '',
                company: profile.company || '',
                jobTitle: profile.job_title || ''
            });
            
            setEmailData(prev => ({ 
                ...prev, 
                responseEmail: profile.response_email || '',
                customEmail: profile.response_email || profile.acs_mail || ''
            }));
            
            setLcpSettings({
                lcp_tone: profile.lcp_tone || "professional",
                lcp_style: profile.lcp_style || "concise",
                lcp_sample_prompt: profile.lcp_sample_prompt || ""
            });
            
            setSettingsData(prev => ({
                ...prev,
                signature: profile.email_signature || '',
                smsEnabled: profile.sms_enabled === true,
                phone: profile.phone || '',
                autoEmails: profile.auto_emails !== false,
            }));
        }
    }, [profile]);

    useEffect(() => {
        if (status === 'authenticated') {
            // Profile will be automatically loaded by the UserProfileProvider
            if (profile && !isLoading && !isSubmitting && !isTransitioningRef.current) {
                // Set initial step based on profile completion, but only if not submitting or transitioning
                const currentStep = profile.onboarding_step || 1;
                console.log('🔄 [NewUser] Setting step from profile:', { 
                    profileStep: profile.onboarding_step, 
                    currentStep, 
                    isTransitioning: isTransitioningRef.current, 
                    isSubmitting 
                });
                setStep(currentStep);
            }
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, profile, isLoading, router, isSubmitting]);
    
    const nextStep = () => {
        console.log('🔄 [NewUser] Moving to next step, current step:', step);
        isTransitioningRef.current = true;
        setIsTransitioning(true);
        setStep(s => s + 1);
        // Reset transition flag after a short delay to allow profile updates to complete
        setTimeout(() => {
            console.log('✅ [NewUser] Transition flag reset');
            isTransitioningRef.current = false;
            setIsTransitioning(false);
        }, 100);
    };
    const prevStep = () => {
        isTransitioningRef.current = true;
        setIsTransitioning(true);
        setStep(s => Math.max(1, s - 1));
        // Reset transition flag after a short delay to allow profile updates to complete
        setTimeout(() => {
            isTransitioningRef.current = false;
            setIsTransitioning(false);
        }, 100);
    };

    const handleProfileSubmit = async () => {
        setLocalError(null);
        setIsSubmitting(true);
        
        try {
            console.log('🔄 [NewUser] Starting profile submission, current step:', step);
            
            const result = await updateProfessionalInfo({
                company: profileData.company,
                job_title: profileData.jobTitle,
                location: profileData.location,
                state: profileData.state,
                country: profileData.country,
                zipcode: profileData.zipcode,
            }, { optimistic: true });

            if (result.success) {
                console.log('✅ [NewUser] Profile update successful, updating onboarding step to 2');
                await updateOnboardingStep(2);
                console.log('✅ [NewUser] Onboarding step updated, moving to next step');
                nextStep();
            } else {
                console.error('❌ [NewUser] Profile update failed:', result.error);
                setLocalError(result.error || 'Failed to save profile');
            }
        } catch (err) {
            console.error('❌ [NewUser] Profile submission error:', err);
            setLocalError(err instanceof Error ? err.message : 'Failed to save profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailSubmit = async () => {
        setLocalError(null);
        setIsSubmitting(true);
        
        try {
            const result = await updateContactInfo({
                response_email: emailData.responseEmail,
                custom_domain: emailData.customDomain,
            }, { optimistic: true });

            if (result.success) {
                await updateOnboardingStep(3);
                nextStep();
            } else {
                setLocalError(result.error || 'Failed to save email settings');
            }
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Failed to save email settings');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLCPSubmit = async () => {
        setLocalError(null);
        setIsSubmitting(true);
        
        try {
            const result = await updateLCPSettings({
                lcp_tone: lcpSettings.lcp_tone,
                lcp_style: lcpSettings.lcp_style,
                lcp_sample_prompt: lcpSettings.lcp_sample_prompt,
            }, { optimistic: true });

            if (result.success) {
                await updateOnboardingStep(4);
                nextStep();
            } else {
                setLocalError(result.error || 'Failed to save LCP settings');
            }
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Failed to save LCP settings');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSettingsSubmit = async () => {
        setLocalError(null);
        setIsSubmitting(true);
        
        try {
            const result = await updateEmailSettings({
                email_signature: settingsData.signature,
                auto_emails: settingsData.autoEmails,
            }, { optimistic: true });

            if (result.success) {
                // Also update phone and SMS settings
                await updateContactInfo({
                    phone: settingsData.phone,
                }, { optimistic: false });

                await updateProfile({
                    sms_enabled: settingsData.smsEnabled,
                }, { optimistic: false });

                await updateOnboardingStep(5);
                nextStep();
            } else {
                setLocalError(result.error || 'Failed to save settings');
            }
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = async () => {
        setLocalError(null);
        setIsSubmitting(true);
        
        try {
            const result = await markProfileComplete({ optimistic: true });
            
            if (result.success) {
                // Redirect to dashboard
                router.push('/dashboard');
            } else {
                setLocalError(result.error || 'Failed to complete setup');
            }
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Failed to complete setup');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        nextStep();
    };

    const handleBack = () => {
        prevStep();
    };

    // Combine local error with profile error
    const combinedError = localError || error;

    return {
        // State
        step,
        loading: isLoading || isSubmitting,
        error: combinedError,
        profile,
        
        // Form data
        profileData,
        setProfileData,
        emailData,
        setEmailData,
        lcpSettings,
        setLcpSettings,
        settingsData,
        setSettingsData,
        
        // Profile completion
        completion,
        nextOnboardingStep,
        
        // Actions
        nextStep,
        prevStep,
        handleProfileSubmit,
        handleEmailSubmit,
        handleLCPSubmit,
        handleSettingsSubmit,
        handleComplete,
        handleSkip,
        handleBack,
        
        // Utility
        setLocalError,
    };
} 