"use client";

import { useState, useEffect } from 'react';
import { Mail, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface EmailSignatureSettingsProps {
    userData: any;
    onSave: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function EmailSignatureSettings({ userData, onSave }: EmailSignatureSettingsProps) {
    const [form, setForm] = useState({ 
        emailSignature: '',
        includeLogo: true,
        includeSocialLinks: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        if (userData) {
            setForm({
                emailSignature: userData.emailSignature || '',
                includeLogo: userData.includeLogo !== false,
                includeSocialLinks: userData.includeSocialLinks !== false
            });
        }
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
                setError(result.error || 'Failed to update email signature.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generatePreviewSignature = () => {
        let signature = form.emailSignature;
        
        if (form.includeLogo) {
            signature = `[ACS Logo]\n${signature}`;
        }
        
        if (form.includeSocialLinks) {
            signature += `\n\n---\nConnect with me:\nLinkedIn | Facebook | Instagram`;
        }
        
        return signature;
    };

    return (
        <div className="bg-card rounded-lg shadow-sm border border-border">
            <div className="px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Email Signature
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Customize your professional email signature</p>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="emailSignature" className="block text-sm font-medium text-card-foreground mb-2">
                                Email Signature Content
                            </label>
                            <textarea 
                                name="emailSignature" 
                                id="emailSignature" 
                                value={form.emailSignature} 
                                onChange={handleChange}
                                rows={6}
                                className={cn(
                                    "block w-full px-4 py-3 rounded-lg border shadow-sm transition-all duration-200",
                                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                    "text-card-foreground placeholder-muted-foreground bg-background resize-none font-mono text-sm",
                                    error ? "border-status-error focus:border-status-error focus:ring-status-error/50" : "border-border"
                                )}
                                placeholder={`John Doe
Real Estate Agent
ACS Real Estate
Phone: (555) 123-4567
Email: john.doe@acsrealestate.com`}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {form.emailSignature.length}/1000 characters
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-card-foreground">Signature Options</label>
                            
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="includeLogo" 
                                        checked={form.includeLogo} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm text-card-foreground">Include ACS logo in signature</span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="includeSocialLinks" 
                                        checked={form.includeSocialLinks} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 bg-background"
                                    />
                                    <span className="text-sm text-card-foreground">Include social media links</span>
                                </label>
                            </div>
                        </div>
                        
                        {/* Preview Section */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-card-foreground">Signature Preview</label>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode(!previewMode)}
                                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                    {previewMode ? (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            Hide Preview
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Show Preview
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {previewMode && (
                                <div className="p-4 bg-muted border border-border rounded-lg">
                                    <pre className="text-sm text-card-foreground whitespace-pre-wrap font-mono">
                                        {generatePreviewSignature()}
                                    </pre>
                                </div>
                            )}
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
                            <p className="text-sm text-status-success">Email signature updated successfully!</p>
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
                                    Save Signature
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 