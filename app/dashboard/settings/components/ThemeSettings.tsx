'use client';

import React from 'react';
import { useSimpleTheme } from '@/lib/theme/simple-theme-provider';
import { ThemeSelector } from '@/components/features/theme/ThemeSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Settings, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';

export function ThemeSettings() {
  const { currentTheme } = useSimpleTheme();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Choose your preferred theme to customize the appearance of your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Current Theme</h4>
              <p className="text-sm text-muted-foreground">{currentTheme.name}</p>
            </div>
            <ThemeSelector />
          </div>
        </div>

        {/* Theme Preview */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Theme Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-medium">Primary</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Primary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-secondary-foreground text-xs font-medium">Secondary</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Secondary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-accent flex items-center justify-center border">
                <span className="text-accent-foreground text-xs font-medium">Accent</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Accent</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-12 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs font-medium">Muted</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Muted</p>
            </div>
          </div>
        </div>

        {/* Component Examples */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Component Examples</h4>
          <div className="space-y-3">
            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Default</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="outline" size="sm">Outline</Button>
              <Button variant="ghost" size="sm">Ghost</Button>
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
        </div>

        {/* Mini Dashboard Preview */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Dashboard Preview</h4>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold text-foreground">$45,231</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Users</p>
                    <p className="text-lg font-bold text-foreground">2,350</p>
                  </div>
                  <Users className="h-5 w-5 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Preview */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Navigation Preview</h4>
          <div className="w-48 bg-card border border-border rounded-lg p-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 p-2 rounded-md bg-primary text-primary-foreground">
                <User className="h-3 w-3" />
                <span className="text-xs font-medium">Profile</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted text-foreground">
                <Mail className="h-3 w-3" />
                <span className="text-xs">Messages</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted text-foreground">
                <Settings className="h-3 w-3" />
                <span className="text-xs">Settings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Theme Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dl className="space-y-1">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name:</dt>
                  <dd className="text-foreground">{currentTheme.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Primary Color:</dt>
                  <dd className="text-foreground">{currentTheme.colors.primary}</dd>
                </div>
              </dl>
            </div>
            <div>
              <dl className="space-y-1">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Secondary Color:</dt>
                  <dd className="text-foreground">{currentTheme.colors.secondary}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Background:</dt>
                  <dd className="text-foreground">{currentTheme.colors.background}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Theme changes are applied immediately and saved to your preferences.
          </p>
          <Button variant="outline" size="sm" onClick={() => window.open('/theme-demo', '_blank')}>
            View Full Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 