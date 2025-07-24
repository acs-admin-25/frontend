import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useProfile } from "@/lib/hooks/useProfile";
import type { Session } from "next-auth";

// Types for settings data - extending the profile system
export interface UserSettings {
    // Profile Information
    name?: string;
    email?: string;
    phone?: string;
    
    // Bio & Professional Information
    bio?: string;
    title?: string;
    company?: string;
    website?: string;
    
    // Email Signature
    email_signature?: string;
    includeLogo?: boolean;
    includeSocialLinks?: boolean;
    
    // LCP Settings
    autoResponse?: boolean;
    responseDelay?: number;
    maxConcurrentConversations?: number;
    enableNotifications?: boolean;
    notificationFrequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    enableAutoFollowUp?: boolean;
    followUpDelay?: number;
    enableSpamFilter?: boolean;
    spamSensitivity?: 'low' | 'medium' | 'high';
    
    // Preferences
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    autoSave?: boolean;
    compactMode?: boolean;
    showTutorials?: boolean;
    
    // Security Settings
    enableTwoFactor?: boolean;
    phoneNumber?: string;
    enableLoginAlerts?: boolean;
    enableSessionTimeout?: boolean;
    sessionTimeoutMinutes?: number;
    enablePasswordHistory?: boolean;
    requireStrongPassword?: boolean;
    
    // Metadata
    created_at?: string;
    updated_at?: string;
}

export interface SettingsUpdateResult {
    success: boolean;
    error?: string;
    data?: UserSettings;
}

export function useSettings() {
    const { data: session, status, update } = useSession();
    const { 
        profile, 
        isLoading, 
        error, 
        lastUpdated,
        updateProfile,
        updateBasicInfo,
        updateContactInfo,
        updateEmailSettings,
        updateLCPSettings,
        updatePreferences,
        refreshProfile
    } = useProfile();
    
    const [localError, setLocalError] = useState<string | null>(null);
    const [localLoading, setLocalLoading] = useState(false);

    // Transform profile to UserSettings format for backward compatibility
    const userData: UserSettings | null = useMemo(() => {
        if (!profile) return null;
        
        return {
            // Profile Information
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            
            // Bio & Professional Information
            bio: profile.bio,
            title: profile.job_title,
            company: profile.company,
            website: profile.metadata?.website,
            
            // Email Signature
            email_signature: profile.email_signature,
            includeLogo: profile.metadata?.includeLogo,
            includeSocialLinks: profile.metadata?.includeSocialLinks,
            
            // LCP Settings
            autoResponse: profile.lcp_automatic_enabled,
            responseDelay: profile.metadata?.responseDelay,
            maxConcurrentConversations: profile.metadata?.maxConcurrentConversations,
            enableNotifications: profile.preferences?.push_notifications,
            notificationFrequency: profile.metadata?.notificationFrequency,
            enableAutoFollowUp: profile.metadata?.enableAutoFollowUp,
            followUpDelay: profile.metadata?.followUpDelay,
            enableSpamFilter: profile.metadata?.enableSpamFilter,
            spamSensitivity: profile.metadata?.spamSensitivity,
            
            // Preferences
            theme: profile.preferences?.theme,
            language: profile.preferences?.language,
            timezone: profile.preferences?.timezone,
            dateFormat: profile.metadata?.dateFormat,
            timeFormat: profile.metadata?.timeFormat,
            emailNotifications: profile.preferences?.email_notifications,
            pushNotifications: profile.preferences?.push_notifications,
            smsNotifications: profile.preferences?.sms_notifications,
            autoSave: profile.metadata?.autoSave,
            compactMode: profile.metadata?.compactMode,
            showTutorials: profile.metadata?.showTutorials,
            
            // Security Settings
            enableTwoFactor: profile.mfa_enabled,
            phoneNumber: profile.phone,
            enableLoginAlerts: profile.metadata?.enableLoginAlerts,
            enableSessionTimeout: profile.metadata?.enableSessionTimeout,
            sessionTimeoutMinutes: profile.metadata?.sessionTimeoutMinutes,
            enablePasswordHistory: profile.metadata?.enablePasswordHistory,
            requireStrongPassword: profile.metadata?.requireStrongPassword,
            
            // Metadata
            created_at: profile.created_at,
            updated_at: profile.updated_at,
        };
    }, [profile]);

    const updateSettings = useCallback(async (updateData: Partial<UserSettings>): Promise<SettingsUpdateResult> => {
        if (!profile) {
            return { 
                success: false, 
                error: "Profile not loaded. Please refresh the page." 
            };
        }

        setLocalLoading(true);
        setLocalError(null);

        try {
            // Debug logging for signature updates
            if (updateData.email_signature) {
                console.log('🔍 [Settings] Saving signature:', {
                    signatureLength: updateData.email_signature.length,
                    signaturePreview: updateData.email_signature.substring(0, 100) + '...',
                    hasSignature: !!updateData.email_signature
                });
            }

            // Prepare updates based on the type of settings being updated
            const updates: any = {};
            const metadataUpdates: any = {};
            const preferencesUpdates: any = {};

            // Basic profile fields
            if (updateData.name) updates.name = updateData.name;
            if (updateData.email) updates.email = updateData.email;
            if (updateData.phone) updates.phone = updateData.phone;
            if (updateData.bio) updates.bio = updateData.bio;
            if (updateData.title) updates.job_title = updateData.title;
            if (updateData.company) updates.company = updateData.company;
            if (updateData.email_signature) updates.email_signature = updateData.email_signature;

            // Metadata fields
            if (updateData.website) metadataUpdates.website = updateData.website;
            if (updateData.includeLogo !== undefined) metadataUpdates.includeLogo = updateData.includeLogo;
            if (updateData.includeSocialLinks !== undefined) metadataUpdates.includeSocialLinks = updateData.includeSocialLinks;
            if (updateData.responseDelay !== undefined) metadataUpdates.responseDelay = updateData.responseDelay;
            if (updateData.maxConcurrentConversations !== undefined) metadataUpdates.maxConcurrentConversations = updateData.maxConcurrentConversations;
            if (updateData.notificationFrequency) metadataUpdates.notificationFrequency = updateData.notificationFrequency;
            if (updateData.enableAutoFollowUp !== undefined) metadataUpdates.enableAutoFollowUp = updateData.enableAutoFollowUp;
            if (updateData.followUpDelay !== undefined) metadataUpdates.followUpDelay = updateData.followUpDelay;
            if (updateData.enableSpamFilter !== undefined) metadataUpdates.enableSpamFilter = updateData.enableSpamFilter;
            if (updateData.spamSensitivity) metadataUpdates.spamSensitivity = updateData.spamSensitivity;
            if (updateData.dateFormat) metadataUpdates.dateFormat = updateData.dateFormat;
            if (updateData.timeFormat) metadataUpdates.timeFormat = updateData.timeFormat;
            if (updateData.autoSave !== undefined) metadataUpdates.autoSave = updateData.autoSave;
            if (updateData.compactMode !== undefined) metadataUpdates.compactMode = updateData.compactMode;
            if (updateData.showTutorials !== undefined) metadataUpdates.showTutorials = updateData.showTutorials;
            if (updateData.enableLoginAlerts !== undefined) metadataUpdates.enableLoginAlerts = updateData.enableLoginAlerts;
            if (updateData.enableSessionTimeout !== undefined) metadataUpdates.enableSessionTimeout = updateData.enableSessionTimeout;
            if (updateData.sessionTimeoutMinutes !== undefined) metadataUpdates.sessionTimeoutMinutes = updateData.sessionTimeoutMinutes;
            if (updateData.enablePasswordHistory !== undefined) metadataUpdates.enablePasswordHistory = updateData.enablePasswordHistory;
            if (updateData.requireStrongPassword !== undefined) metadataUpdates.requireStrongPassword = updateData.requireStrongPassword;

            // Preferences fields
            if (updateData.theme) preferencesUpdates.theme = updateData.theme;
            if (updateData.language) preferencesUpdates.language = updateData.language;
            if (updateData.timezone) preferencesUpdates.timezone = updateData.timezone;
            if (updateData.emailNotifications !== undefined) preferencesUpdates.email_notifications = updateData.emailNotifications;
            if (updateData.pushNotifications !== undefined) preferencesUpdates.push_notifications = updateData.pushNotifications;
            if (updateData.smsNotifications !== undefined) preferencesUpdates.sms_notifications = updateData.smsNotifications;

            // LCP settings
            if (updateData.autoResponse !== undefined) updates.lcp_automatic_enabled = updateData.autoResponse;
            if (updateData.enableNotifications !== undefined) preferencesUpdates.push_notifications = updateData.enableNotifications;

            console.log('🔍 [Settings] Profile update payload:', { updates, metadataUpdates, preferencesUpdates });

            // Perform the updates
            let success = true;
            let error = '';

            // Update basic profile fields
            if (Object.keys(updates).length > 0) {
                const result = await updateProfile(updates);
                if (!result.success) {
                    return { 
                        success: false, 
                        error: result.error || 'Failed to update profile' 
                    };
                }
            }

            // Update metadata
            if (Object.keys(metadataUpdates).length > 0) {
                const result = await updateProfile({ metadata: metadataUpdates });
                if (!result.success) {
                    return { 
                        success: false, 
                        error: result.error || 'Failed to update metadata' 
                    };
                }
            }

            // Update preferences
            if (Object.keys(preferencesUpdates).length > 0) {
                const result = await updatePreferences(preferencesUpdates);
                if (!result.success) {
                    return { 
                        success: false, 
                        error: result.error || 'Failed to update preferences' 
                    };
                }
            }

            if (success) {
                console.log('✅ [Settings] Settings saved successfully');
                
                // Update session if name or email changed
                if (updateData.name || updateData.email) {
                    try {
                        await update({
                            ...session,
                            user: {
                                ...session?.user,
                                name: updateData.name || session?.user?.name,
                                email: updateData.email || session?.user?.email,
                            },
                        });
                    } catch (sessionError) {
                        console.warn('Failed to update session:', sessionError);
                        // Don't fail the entire operation if session update fails
                    }
                }
                
                return { 
                    success: true, 
                    data: userData || undefined
                };
            } else {
                console.error('❌ [Settings] Failed to save settings:', error);
                setLocalError(error);
                return { 
                    success: false, 
                    error: error 
                };
            }
            
        } catch (err: any) {
            console.error('❌ [Settings] Error updating settings:', err);
            const errorMessage = err.message || 'An unexpected error occurred while updating settings.';
            setLocalError(errorMessage);
            return { 
                success: false, 
                error: errorMessage 
            };
        } finally {
            setLocalLoading(false);
        }
    }, [profile, updateProfile, updatePreferences, session, update, userData]);

    const resetSettings = useCallback(async (): Promise<SettingsUpdateResult> => {
        if (!profile) {
            return { 
                success: false, 
                error: "Profile not loaded." 
            };
        }

        setLocalLoading(true);
        setLocalError(null);

        try {
            // Reset to default settings
            const defaultSettings = {
                theme: 'light' as const,
                language: 'en' as const,
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h' as const,
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                autoSave: true,
                compactMode: false,
                showTutorials: true,
                autoResponse: true,
                responseDelay: 5,
                maxConcurrentConversations: 10,
                enableNotifications: true,
                notificationFrequency: 'immediate' as const,
                enableAutoFollowUp: true,
                followUpDelay: 24,
                enableSpamFilter: true,
                spamSensitivity: 'medium' as const,
                enableLoginAlerts: true,
                enableSessionTimeout: true,
                sessionTimeoutMinutes: 30,
                enablePasswordHistory: true,
                requireStrongPassword: true,
                includeLogo: true,
                includeSocialLinks: true,
            };

            return await updateSettings(defaultSettings);
            
        } catch (err: any) {
            console.error('Error resetting settings:', err);
            const errorMessage = err.message || 'Failed to reset settings.';
            setLocalError(errorMessage);
            return { 
                success: false, 
                error: errorMessage 
            };
        } finally {
            setLocalLoading(false);
        }
    }, [profile, updateSettings]);

    // Combine loading states
    const loading = isLoading || localLoading;
    const combinedError = localError || error;

    return {
        // Data
        session,
        userData,
        loading,
        error: combinedError,
        lastUpdated,
        
        // Actions
        updateSettings,
        fetchSettings: refreshProfile,
        resetSettings,
        
        // Metadata
        userId: profile?.account_id,
        status,
        isAuthenticated: !!profile && status === 'authenticated',
        hasData: !!userData,
    };
} 