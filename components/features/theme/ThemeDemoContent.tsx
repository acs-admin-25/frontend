'use client';

import React from 'react';
import { useSimpleTheme } from '@/lib/theme/simple-theme-provider';
import { ThemeSelector } from './ThemeSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Sun, 
  Moon, 
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

export function ThemeDemoContent() {
  const { currentTheme } = useSimpleTheme();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            ACS Theme System Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of our configurable theme system. Switch between different themes to see how the entire application adapts.
          </p>
          
          {/* Theme Selector */}
          <div className="flex justify-center">
            <ThemeSelector />
          </div>
          
          {/* Current Theme Info */}
          <div className="bg-card border rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-card-foreground mb-2">Current Theme</h3>
            <p className="text-muted-foreground">{currentTheme.name}</p>
            <p className="text-sm text-muted-foreground">Radius: {currentTheme.radius}rem</p>
          </div>
        </div>

        {/* Color Palette Showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Palette
            </CardTitle>
            <CardDescription>
              The current theme's color palette and how it's applied across different elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">Primary</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">Primary</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-secondary-foreground font-medium">Secondary</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">Secondary</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-accent flex items-center justify-center border">
                  <span className="text-accent-foreground font-medium">Accent</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">Accent</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">Muted</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">Muted</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-destructive flex items-center justify-center">
                  <span className="text-destructive-foreground font-medium">Destructive</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">Destructive</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-card border flex items-center justify-center">
                  <span className="text-card-foreground font-medium">Card</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">Card</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UI Components Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Different button variants and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges & Status</CardTitle>
              <CardDescription>Status indicators and badges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800">Success</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                <Badge className="bg-red-100 text-red-800">Error</Badge>
                <Badge className="bg-blue-100 text-blue-800">Info</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard-like Content */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Elements</CardTitle>
            <CardDescription>Common dashboard components with the current theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground">$45,231</p>
                      <p className="text-xs text-green-600">+20.1% from last month</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold text-foreground">2,350</p>
                      <p className="text-xs text-green-600">+180.1% from last month</p>
                    </div>
                    <Users className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sales</p>
                      <p className="text-2xl font-bold text-foreground">12,234</p>
                      <p className="text-xs text-green-600">+19% from last month</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-accent-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-muted/50 to-muted/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                      <p className="text-2xl font-bold text-foreground">573</p>
                      <p className="text-xs text-green-600">+201 since last hour</p>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="rounded border-input text-primary focus:ring-ring"
              />
              <label htmlFor="terms" className="text-sm text-foreground">
                I agree to the terms and conditions
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Elements</CardTitle>
            <CardDescription>Sidebar and navigation components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="w-64 bg-sidebar border border-sidebar-border rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Messages</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Calls</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Calendar</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Information */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Information</CardTitle>
            <CardDescription>Technical details about the current theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Theme Details</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name:</dt>
                    <dd className="text-foreground">{currentTheme.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Radius:</dt>
                    <dd className="text-foreground">{currentTheme.radius}rem</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Primary Colors</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Main:</dt>
                    <dd className="text-foreground">{currentTheme.colors.primary}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Light:</dt>
                    <dd className="text-foreground">{currentTheme.colors['primary-light']}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Dark:</dt>
                    <dd className="text-foreground">{currentTheme.colors['primary-dark']}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 