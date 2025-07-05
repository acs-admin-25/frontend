"use client";

import { useState, useEffect } from 'react';
import { User, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface ProfileSettingsProps {
    userData: any;
    onSave: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function ProfileSettings({ userData, onSave }: ProfileSettingsProps) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (userData) {
            setForm({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || ''
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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
                setError(result.error || 'Failed to update profile.');
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
                    <User className="w-5 h-5 text-primary" />
                    Profile Settings
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your personal information and contact details</p>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
                                Full Name
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                value={form.name} 
                                onChange={handleChange}
                                className={cn(
                                    "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                    "text-card-foreground placeholder-muted-foreground bg-background",
                                    error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                )}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                value={form.email} 
                                onChange={handleChange}
                                className={cn(
                                    "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                    "text-card-foreground placeholder-muted-foreground bg-background",
                                    error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                )}
                                placeholder="Enter your email address"
                                required
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-card-foreground mb-2">
                                Phone Number
                            </label>
                            <input 
                                type="tel" 
                                name="phone" 
                                id="phone" 
                                value={form.phone} 
                                onChange={handleChange}
                                className={cn(
                                    "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                    "text-card-foreground placeholder-muted-foreground bg-background",
                                    error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                )}
                                placeholder="Enter your phone number"
                            />
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
                            <p className="text-sm text-status-success">Profile updated successfully!</p>
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
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 