'use client';

import React from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { useSettings } from './useSettings';
import { ProfileSettings } from './components/ProfileSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { DangerZone } from './components/DangerZone';
import { PreferencesSettings } from './components/PreferencesSettings';
import { BioSettings } from './components/BioSettings';
import { LCPSettings } from './components/LCPSettings';
import { EmailSignatureSettings } from './components/EmailSignatureSettings';
import { ThemeSettings } from './components/ThemeSettings';
import { LoadingSpinner } from '@/components/common/Feedback/LoadingSpinner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';

export function SettingsContent() {
    const { 
        userData, 
        loading, 
        error, 
        updateSettings, 
        fetchSettings,
        lastUpdated 
    } = useSettings();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" text="Loading settings..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <Alert variant="destructive">
                        <Settings className="h-4 w-4" />
                        <AlertTitle>Error Loading Settings</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button onClick={fetchSettings} className="mt-6">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-background" style={{ minHeight: '100vh', overflow: 'auto' }}>
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 sm:py-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary shadow-sm">
                                <Settings className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                            Manage your account preferences, security settings, and personal information. 
                            All changes are automatically saved and synchronized across your devices.
                        </p>
                        {lastUpdated && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Last updated: {lastUpdated.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-8">
                    {/* Profile & Personal Information */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                Personal Information
                            </h2>
                            <div className="space-y-6">
                                <ProfileSettings userData={userData} onSave={updateSettings} />
                                <BioSettings userData={userData} onSave={updateSettings} />
                            </div>
                        </div>
                    </section>

                    {/* Professional Settings */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                Professional Settings
                            </h2>
                            <div className="space-y-6">
                                <EmailSignatureSettings userData={userData} onSave={updateSettings} />
                                <LCPSettings userData={userData} onSave={updateSettings} />
                            </div>
                        </div>
                    </section>

                    {/* Preferences & Security */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                Preferences & Security
                            </h2>
                            <div className="space-y-6">
                                <PreferencesSettings userData={userData} onSave={updateSettings} />
                                <SecuritySettings userData={userData} onSave={updateSettings} />
                            </div>
                        </div>
                    </section>

                    {/* Appearance */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                Appearance
                            </h2>
                            <div className="space-y-6">
                                <ThemeSettings />
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-status-error rounded-full"></div>
                                Account Management
                            </h2>
                            <DangerZone />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
} 