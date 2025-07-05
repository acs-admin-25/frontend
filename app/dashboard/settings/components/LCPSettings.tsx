"use client";

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, AlertCircle, Zap, Clock, Shield, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface LCPSettingsProps {
    userData: any;
    onSave: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function LCPSettings({ userData, onSave }: LCPSettingsProps) {
    const [form, setForm] = useState({ 
        autoResponse: true,
        responseDelay: 5,
        maxConcurrentConversations: 10,
        enableNotifications: true,
        notificationFrequency: 'immediate',
        enableAutoFollowUp: true,
        followUpDelay: 24,
        enableSpamFilter: true,
        spamSensitivity: 'medium'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (userData) {
            setForm({
                autoResponse: userData.autoResponse !== false,
                responseDelay: userData.responseDelay || 5,
                maxConcurrentConversations: userData.maxConcurrentConversations || 10,
                enableNotifications: userData.enableNotifications !== false,
                notificationFrequency: userData.notificationFrequency || 'immediate',
                enableAutoFollowUp: userData.enableAutoFollowUp !== false,
                followUpDelay: userData.followUpDelay || 24,
                enableSpamFilter: userData.enableSpamFilter !== false,
                spamSensitivity: userData.spamSensitivity || 'medium'
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setForm({ 
            ...form, 
            [name]: type === 'checkbox' ? checked : 
                    type === 'number' ? parseInt(value) : value 
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
            } else {
                setError(result.error || 'Failed to save settings');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    LCP Settings
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure your Lead Conversation Platform settings
                </p>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Auto Response Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Auto Response Settings
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="autoResponse" 
                                        checked={form.autoResponse} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">Enable Auto Response</span>
                                </label>
                                <p className="text-xs text-muted-foreground mt-1 ml-7">Automatically respond to new leads</p>
                            </div>
                            
                            <div>
                                <label htmlFor="responseDelay" className="block text-sm font-medium text-card-foreground mb-2">
                                    Response Delay (minutes)
                                </label>
                                <input 
                                    type="number" 
                                    name="responseDelay" 
                                    id="responseDelay" 
                                    value={form.responseDelay} 
                                    onChange={handleChange}
                                    min="1"
                                    max="60"
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground placeholder-muted-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Conversation Management */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Conversation Management
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="maxConcurrentConversations" className="block text-sm font-medium text-card-foreground mb-2">
                                    Max Concurrent Conversations
                                </label>
                                <input 
                                    type="number" 
                                    name="maxConcurrentConversations" 
                                    id="maxConcurrentConversations" 
                                    value={form.maxConcurrentConversations} 
                                    onChange={handleChange}
                                    min="1"
                                    max="50"
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground placeholder-muted-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="notificationFrequency" className="block text-sm font-medium text-card-foreground mb-2">
                                    Notification Frequency
                                </label>
                                <select 
                                    name="notificationFrequency" 
                                    id="notificationFrequency" 
                                    value={form.notificationFrequency} 
                                    onChange={handleChange}
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                >
                                    <option value="immediate">Immediate</option>
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Follow-up Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Follow-up Settings
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="enableAutoFollowUp" 
                                        checked={form.enableAutoFollowUp} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">Enable Auto Follow-up</span>
                                </label>
                                <p className="text-xs text-muted-foreground mt-1 ml-7">Automatically follow up with leads</p>
                            </div>
                            
                            <div>
                                <label htmlFor="followUpDelay" className="block text-sm font-medium text-card-foreground mb-2">
                                    Follow-up Delay (hours)
                                </label>
                                <input 
                                    type="number" 
                                    name="followUpDelay" 
                                    id="followUpDelay" 
                                    value={form.followUpDelay} 
                                    onChange={handleChange}
                                    min="1"
                                    max="168"
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground placeholder-muted-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Spam Filter Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Spam Filter Settings
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="enableSpamFilter" 
                                        checked={form.enableSpamFilter} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm font-medium text-card-foreground">Enable Spam Filter</span>
                                </label>
                                <p className="text-xs text-muted-foreground mt-1 ml-7">Filter out spam and unwanted messages</p>
                            </div>
                            
                            <div>
                                <label htmlFor="spamSensitivity" className="block text-sm font-medium text-card-foreground mb-2">
                                    Spam Sensitivity
                                </label>
                                <select 
                                    name="spamSensitivity" 
                                    id="spamSensitivity" 
                                    value={form.spamSensitivity} 
                                    onChange={handleChange}
                                    className={cn(
                                        "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                        "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                        "text-card-foreground bg-background",
                                        error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                    )}
                                >
                                    <option value="low">Low (Fewer false positives)</option>
                                    <option value="medium">Medium (Balanced)</option>
                                    <option value="high">High (More aggressive)</option>
                                </select>
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
                            <p className="text-sm text-status-success">Settings saved successfully!</p>
                        </div>
                    )}
                    
                    {/* Submit Button */}
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
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 