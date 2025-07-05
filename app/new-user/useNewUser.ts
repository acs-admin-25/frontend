import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDbOperations } from '@/lib/hooks/useDbOperations';

export function useNewUser() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { select, update } = useDbOperations();
    const userId = (session as any)?.user?.id;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);

    // Form states
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
        lcp_tone: "professional",
        lcp_style: "concise",
        lcp_sample_prompt: ""
    });

    const [settingsData, setSettingsData] = useState({
        signature: '',
        smsEnabled: false,
        phone: '',
        autoEmails: true,
    });

    const fetchUserData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error } = await select({
                table_name: 'Users',
                index_name: 'id-index',
                key_name: 'id',
                key_value: userId,
            });

            if (error || !data?.items?.[0]) {
                setError(error || "User not found");
            } else {
                const user = data.items[0];
                setUserData(user);
                // Pre-fill forms
                setProfileData({
                    bio: user.bio || '',
                    location: user.location || '',
                    state: user.state || '',
                    country: user.country || '',
                    zipcode: user.zipcode || '',
                    company: user.company || '',
                    jobTitle: user.job_title || ''
                });
                setEmailData(prev => ({ 
                    ...prev, 
                    responseEmail: user.acsMail || '',
                    customEmail: user.responseEmail || user.acsMail || ''
                }));
                setLcpSettings({
                    lcp_tone: user.lcp_tone || "professional",
                    lcp_style: user.lcp_style || "concise",
                    lcp_sample_prompt: user.lcp_sample_prompt || ""
                });
                setSettingsData(prev => ({
                    ...prev,
                    signature: user.email_signature || '',
                    smsEnabled: user.sms_enabled === 'true',
                    phone: user.phone || '',
                    autoEmails: user.lcp_automatic_enabled !== 'false',
                }));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    }, [userId, select]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUserData();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, fetchUserData, router]);
    
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const handleProfileSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const { success, error } = await update({
                table_name: 'Users',
                index_name: 'id-index',
                key_name: 'id',
                key_value: userId,
                update_data: { 
                    ...profileData, 
                    job_title: profileData.jobTitle 
                }
            });
            if (success) {
                nextStep();
            } else {
                setError(error || 'Failed to save profile');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const finalEmail = emailData.emailOption === 'default' 
                ? emailData.responseEmail 
                : emailData.customEmail;
            
            const update_data = {
                responseEmail: finalEmail,
                acsMail: emailData.responseEmail,
            };
            
            const { success, error } = await update({
                table_name: 'Users',
                index_name: 'id-index',
                key_name: 'id',
                key_value: userId,
                update_data
            });
            if (success) {
                nextStep();
            } else {
                setError(error || 'Failed to save email settings');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save email settings');
        } finally {
            setLoading(false);
        }
    };

    const handleLcpSettingsSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const { success, error } = await update({
                table_name: 'Users',
                index_name: 'id-index',
                key_name: 'id',
                key_value: userId,
                update_data: lcpSettings
            });
            if (success) {
                nextStep();
            } else {
                setError(error || 'Failed to save LCP settings');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save LCP settings');
        } finally {
            setLoading(false);
        }
    }

    const handleSettingsSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const { success, error } = await update({
                table_name: 'Users',
                index_name: 'id-index',
                key_name: 'id',
                key_value: userId,
                update_data: {
                    ...settingsData,
                    lcp_automatic_enabled: settingsData.autoEmails ? 'true' : 'false',
                    sms_enabled: settingsData.smsEnabled ? 'true' : 'false',
                }
            });
            if (success) {
                nextStep(); // Go to final step (step 6)
            } else {
                setError(error || 'Failed to save settings');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCompleteSetup = async () => {
        // Directly redirect to dashboard without unnecessary database update
        router.push('/dashboard');
    };

    return {
        step,
        loading,
        error,
        nextStep,
        prevStep,
        profileData,
        setProfileData,
        handleProfileSubmit,
        emailData,
        setEmailData,
        handleEmailSubmit,
        lcpSettings,
        setLcpSettings,
        handleLcpSettingsSubmit,
        settingsData,
        setSettingsData,
        handleSettingsSubmit,
        handleCompleteSetup
    };
} 