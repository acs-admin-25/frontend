"use client";

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, AlertCircle, Palette, Bell, Globe, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface PreferencesSettingsProps {
    userData: any;
    onSave: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function PreferencesSettings({ userData, onSave }: PreferencesSettingsProps) {
    const [form, setForm] = useState({ 
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
        showTutorials: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (userData) {
            setForm({
                theme: userData.theme || 'light',
                language: userData.language || 'en',
                timezone: userData.timezone || 'UTC',
                dateFormat: userData.dateFormat || 'MM/DD/YYYY',
                timeFormat: userData.timeFormat || '12h',
                emailNotifications: userData.emailNotifications !== false,
                pushNotifications: userData.pushNotifications !== false,
                smsNotifications: userData.smsNotifications === true,
                autoSave: userData.autoSave !== false,
                compactMode: userData.compactMode === true,
                showTutorials: userData.showTutorials !== false
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setForm({ 
            ...form, 
            [name]: type === 'checkbox' ? checked : value 
        });
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await onSave(form);

            if (result.success) {
                setSuccess(true);
                // Auto-hide success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to update preferences.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Preferences & Display
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Customize your interface and notification preferences</p>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Appearance Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                            <Palette className="w-5 h-5 text-primary" />
                            Appearance
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="theme" className="block text-sm font-medium text-card-foreground mb-2">
                                    Theme
                                </label>
                                <select 
                                    name="theme" 
                                    id="theme" 
                                    value={form.theme} 
                                    onChange={handleChange}
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                >
                                    <option value="light">Light Theme</option>
                                    <option value="dark">Dark Theme</option>
                                    <option value="auto">Auto (System)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="compactMode" 
                                        checked={form.compactMode} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">Compact Mode</span>
                                </label>
                                <p className="text-xs text-muted-foreground mt-1 ml-7">Reduce spacing for more content</p>
                            </div>
                        </div>
                    </div>

                    {/* Localization Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            Localization
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-card-foreground mb-2">
                                    Language
                                </label>
                                <select 
                                    name="language" 
                                    id="language" 
                                    value={form.language} 
                                    onChange={handleChange}
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="it">Italiano</option>
                                    <option value="pt">Português</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="timezone" className="block text-sm font-medium text-card-foreground mb-2">
                                    Timezone
                                </label>
                                <select 
                                    name="timezone" 
                                    id="timezone" 
                                    value={form.timezone} 
                                    onChange={handleChange}
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Chicago">Central Time</option>
                                    <option value="America/Denver">Mountain Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                    <option value="Europe/London">London</option>
                                    <option value="Europe/Paris">Paris</option>
                                    <option value="Asia/Tokyo">Tokyo</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="dateFormat" className="block text-sm font-medium text-card-foreground mb-2">
                                    Date Format
                                </label>
                                <select 
                                    name="dateFormat" 
                                    id="dateFormat" 
                                    value={form.dateFormat} 
                                    onChange={handleChange}
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" />
                            Notifications
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="emailNotifications" 
                                        checked={form.emailNotifications} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">Email Notifications</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="pushNotifications" 
                                        checked={form.pushNotifications} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">Push Notifications</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="smsNotifications" 
                                        checked={form.smsNotifications} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">SMS Notifications</span>
                                </label>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="autoSave" 
                                        checked={form.autoSave} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">Auto Save</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="showTutorials" 
                                        checked={form.showTutorials} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">Show Tutorials</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {/* Status Messages */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-status-error/10 border border-status-error/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0" />
                            <p className="text-sm text-status-error">{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-status-success/10 border border-status-success/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-status-success flex-shrink-0" />
                            <p className="text-sm text-status-success">Preferences updated successfully!</p>
                        </div>
                    )}
                    
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={cn(
                                "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200",
                                "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/50",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Preferences
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 