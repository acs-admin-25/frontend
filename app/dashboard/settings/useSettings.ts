import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDbOperations } from "@/lib/hooks/useDbOperations";
import type { Session } from "next-auth";

// Types for settings data
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
    emailSignature?: string;
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
    const { select, update: updateDb } = useDbOperations();
    
    const [userData, setUserData] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const userId = (session as any)?.user?.id;

    const fetchSettings = useCallback(async () => {
        if (status === 'loading' || !userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const { data, error } = await select({
                table_name: 'Users',
                index_name: 'id-index',
                key_name: 'id',
                key_value: userId,
            });

            if (error || !data || !data.items || data.items.length === 0) {
                throw new Error(error || "Failed to fetch user settings or user not found.");
            }
            
            const userSettings = data.items[0] as UserSettings;
            setUserData(userSettings);
            setLastUpdated(new Date());
            
        } catch (err: any) {
            console.error('Error fetching user settings:', err);
            setError(err.message || 'An unexpected error occurred while loading settings.');
        } finally {
            setLoading(false);
        }
    }, [userId, status, select]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = useCallback(async (updateData: Partial<UserSettings>): Promise<SettingsUpdateResult> => {
        if (!userId) {
            return { 
                success: false, 
                error: "User not authenticated. Please log in again." 
            };
        }

        if (!userData) {
            return { 
                success: false, 
                error: "User data not loaded. Please refresh the page." 
            };
        }

        try {
            // Prepare update data with timestamp
            const updatePayload = {
                ...updateData,
                updated_at: new Date().toISOString(),
            };

            const { success, error } = await updateDb({
                table_name: 'Users',
                index_name: 'id-index',
                key_name: 'id',
                key_value: userId,
                update_data: updatePayload,
            });

            if (success) {
                // Update local state
                const updatedData = { ...userData, ...updatePayload };
                setUserData(updatedData);
                setLastUpdated(new Date());
                
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
                    data: updatedData 
                };
            } else {
                return { 
                    success: false, 
                    error: error || 'Failed to update settings.' 
                };
            }
            
        } catch (err: any) {
            console.error('Error updating settings:', err);
            return { 
                success: false, 
                error: err.message || 'An unexpected error occurred while updating settings.' 
            };
        }
    }, [userId, userData, updateDb, session, update]);

    const resetSettings = useCallback(async (): Promise<SettingsUpdateResult> => {
        if (!userId) {
            return { 
                success: false, 
                error: "User not authenticated." 
            };
        }

        try {
            // Reset to default settings
            const defaultSettings: Partial<UserSettings> = {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
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
                notificationFrequency: 'immediate',
                enableAutoFollowUp: true,
                followUpDelay: 24,
                enableSpamFilter: true,
                spamSensitivity: 'medium',
                enableLoginAlerts: true,
                enableSessionTimeout: true,
                sessionTimeoutMinutes: 30,
                enablePasswordHistory: true,
                requireStrongPassword: true,
                includeLogo: true,
                includeSocialLinks: true,
                updated_at: new Date().toISOString(),
            };

            return await updateSettings(defaultSettings);
            
        } catch (err: any) {
            console.error('Error resetting settings:', err);
            return { 
                success: false, 
                error: err.message || 'Failed to reset settings.' 
            };
        }
    }, [userId, updateSettings]);

    return {
        // Data
        session,
        userData,
        loading,
        error,
        lastUpdated,
        
        // Actions
        updateSettings,
        fetchSettings,
        resetSettings,
        
        // Metadata
        userId,
        status,
        isAuthenticated: !!userId && status === 'authenticated',
        hasData: !!userData,
    };
} 