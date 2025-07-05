'use client';

import React, { useState } from 'react';
import { useSimpleTheme } from '@/lib/theme/simple-theme-provider';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette, Check, ChevronDown } from 'lucide-react';

interface ThemeOptionProps {
  theme: {
    value: string;
    label: string;
    description: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeOption({ theme, isSelected, onSelect }: ThemeOptionProps) {
  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border cursor-pointer transition-all duration-200",
        "hover:border-primary/50 hover:shadow-sm",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-neutral-200 hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{theme.label}</h4>
          <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
        </div>
        {isSelected && (
          <Check className="h-5 w-5 text-primary" />
        )}
      </div>
      
      {/* Theme preview */}
      <div className="mt-3 flex gap-2">
        <div className="w-4 h-4 rounded-full bg-primary"></div>
        <div className="w-4 h-4 rounded-full bg-secondary"></div>
        <div className="w-4 h-4 rounded-full bg-accent"></div>
        <div className="w-4 h-4 rounded-full bg-muted"></div>
      </div>
    </div>
  );
}

export function ThemeSelector() {
  const { currentTheme, switchToGreen, switchToBlue } = useSimpleTheme();
  const [isOpen, setIsOpen] = useState(false);

  const availableThemes = [
    {
      value: 'green',
      label: 'Green & White',
      description: 'Clean and professional green theme'
    },
    {
      value: 'blue',
      label: 'Blue & White', 
      description: 'Modern and trustworthy blue theme'
    }
  ];

  const handleThemeSelect = (themeName: string) => {
    if (themeName === 'green') {
      switchToGreen();
    } else if (themeName === 'blue') {
      switchToBlue();
    }
    setIsOpen(false);
  };

  const currentThemeValue = currentTheme.name === 'Green & White' ? 'green' : 'blue';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          aria-label="Select theme"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Theme</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Choose Theme</CardTitle>
            <CardDescription>
              Select a theme to customize the appearance of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableThemes.map((theme) => (
              <ThemeOption
                key={theme.value}
                theme={theme}
                isSelected={currentThemeValue === theme.value}
                onSelect={() => handleThemeSelect(theme.value)}
              />
            ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Compact version for mobile or smaller spaces
export function CompactThemeSelector() {
  const { currentTheme, switchToGreen, switchToBlue } = useSimpleTheme();
  const [isOpen, setIsOpen] = useState(false);

  const availableThemes = [
    {
      value: 'green',
      label: 'Green & White',
      description: 'Clean and professional green theme'
    },
    {
      value: 'blue',
      label: 'Blue & White', 
      description: 'Modern and trustworthy blue theme'
    }
  ];

  const handleThemeSelect = (themeName: string) => {
    if (themeName === 'green') {
      switchToGreen();
    } else if (themeName === 'blue') {
      switchToBlue();
    }
    setIsOpen(false);
  };

  const currentThemeValue = currentTheme.name === 'Green & White' ? 'green' : 'blue';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Select theme"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableThemes.map((theme) => (
              <div
                key={theme.value}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                  currentThemeValue === theme.value
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
                onClick={() => handleThemeSelect(theme.value)}
              >
                <span className="text-sm font-medium">{theme.label}</span>
                {currentThemeValue === theme.value && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
} 