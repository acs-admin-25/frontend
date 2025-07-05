"use client";

import { useState, useEffect } from 'react';
import { FileText, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface BioSettingsProps {
    userData: any;
    onSave: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function BioSettings({ userData, onSave }: BioSettingsProps) {
    const [form, setForm] = useState({ 
        bio: '', 
        title: '', 
        company: '', 
        website: '' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (userData) {
            setForm({
                bio: userData.bio || '',
                title: userData.title || '',
                company: userData.company || '',
                website: userData.website || ''
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                setError(result.error || 'Failed to update bio information.');
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
                    <FileText className="w-5 h-5 text-primary" />
                    Bio & Professional Information
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Update your professional bio and company details</p>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-card-foreground mb-2">
                                Professional Title
                            </label>
                            <input 
                                type="text" 
                                name="title" 
                                id="title" 
                                value={form.title} 
                                onChange={handleChange}
                                className={cn(
                                    "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                    "text-card-foreground placeholder-muted-foreground bg-background",
                                    error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                )}
                                placeholder="e.g., Real Estate Agent, Broker, etc."
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-card-foreground mb-2">
                                Company Name
                            </label>
                            <input 
                                type="text" 
                                name="company" 
                                id="company" 
                                value={form.company} 
                                onChange={handleChange}
                                className={cn(
                                    "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                    "text-card-foreground placeholder-muted-foreground bg-background",
                                    error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                )}
                                placeholder="Enter your company name"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-card-foreground mb-2">
                                Website URL
                            </label>
                            <input 
                                type="url" 
                                name="website" 
                                id="website" 
                                value={form.website} 
                                onChange={handleChange}
                                className={cn(
                                    "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                    "text-card-foreground placeholder-muted-foreground bg-background",
                                    error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                )}
                                placeholder="https://your-website.com"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-card-foreground mb-2">
                                Professional Bio
                            </label>
                            <textarea 
                                name="bio" 
                                id="bio" 
                                value={form.bio} 
                                onChange={handleChange}
                                rows={4}
                                className={cn(
                                    "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                    "text-card-foreground placeholder-muted-foreground bg-background resize-none",
                                    error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                )}
                                placeholder="Tell clients about your experience, specialties, and what makes you unique..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {form.bio.length}/500 characters
                            </p>
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
                            <p className="text-sm text-status-success">Bio information updated successfully!</p>
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
                                    Save Bio
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 