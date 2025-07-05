/**
 * Comprehensive theme type definitions for ACS Next.js
 * This ensures all theme configurations have all required attributes
 */

// Base color structure for consistent theming
export interface ThemeColor {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

// Extended color structure for secondary colors
export interface ThemeSecondaryColor extends ThemeColor {
  xlight: string; // Extra light variant
}

// Background color structure
export interface ThemeBackground {
  default: string;
  paper: string;
  accent: string;
  subtle: string;
}

// Text color structure
export interface ThemeText {
  primary: string;
  secondary: string;
  muted: string;
  inverse: string;
  gradient: string; // For better contrast against gradient backgrounds
}

// Border color structure
export interface ThemeBorder {
  default: string;
  subtle: string;
  accent: string;
}

// Status color structure
export interface ThemeStatus {
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Warning color for widget conflicts
export interface ThemeWarning {
  main: string;
}

// Interactive color structure
export interface ThemeInteractive {
  hover: string;
  active: string;
  focus: string;
  disabled: string;
}

// Gradient color structure
export interface ThemeGradients {
  primary: string[];
  secondary: string[];
  background: string[];
}

// Chart color structure
export interface ThemeCharts {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

// Sidebar color structure
export interface ThemeSidebar {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  ring: string;
}

// Midnight color palette (consistent across themes)
export interface ThemeMidnight {
  midnight50: string;
  midnight100: string;
  midnight200: string;
  midnight300: string;
  midnight400: string;
  midnight500: string;
  midnight600: string;
  midnight700: string;
  midnight800: string;
  midnight900: string;
  midnight950: string;
}

// Complete theme colors structure
export interface ThemeColors {
  // Primary brand colors
  primary: ThemeColor;
  
  // Secondary/accent colors
  secondary: ThemeSecondaryColor;
  
  // Background colors
  background: ThemeBackground;
  
  // Text colors
  text: ThemeText;
  
  // Border and divider colors
  border: ThemeBorder;
  
  // Status colors
  status: ThemeStatus;
  
  // Warning color for widget conflicts
  warning: ThemeWarning;
  
  // Interactive colors
  interactive: ThemeInteractive;
  
  // Gradient colors
  gradients: ThemeGradients;
  
  // Chart colors
  charts: ThemeCharts;
  
  // Sidebar colors
  sidebar: ThemeSidebar;
  
  // Midnight color palette
  midnight: ThemeMidnight;
}

// CSS Variables mapping
export interface ThemeCSSVariables {
  // Core variables
  '--background': string;
  '--foreground': string;
  '--card': string;
  '--card-foreground': string;
  '--popover': string;
  '--popover-foreground': string;
  
  // Primary variables
  '--primary': string;
  '--primary-light': string;
  '--primary-dark': string;
  '--primary-foreground': string;
  
  // Secondary variables
  '--secondary': string;
  '--secondary-light': string;
  '--secondary-xlight': string;
  '--secondary-dark': string;
  '--secondary-foreground': string;
  
  // Muted variables
  '--muted': string;
  '--muted-foreground': string;
  
  // Text gradient variable
  '--text-gradient': string;
  
  // Accent variables
  '--accent': string;
  '--accent-foreground': string;
  
  // Destructive variables
  '--destructive': string;
  '--destructive-foreground': string;
  
  // Border and input variables
  '--border': string;
  '--input': string;
  '--ring': string;
  '--radius': string;
  
  // Status variables
  '--status-success': string;
  '--status-warning': string;
  '--status-error': string;
  '--status-info': string;
  
  // Warning variable
  '--warning': string;
  
  // Chart variables
  '--chart-1': string;
  '--chart-2': string;
  '--chart-3': string;
  '--chart-4': string;
  '--chart-5': string;
  
  // Sidebar variables
  '--sidebar': string;
  '--sidebar-foreground': string;
  '--sidebar-primary': string;
  '--sidebar-primary-foreground': string;
  '--sidebar-accent': string;
  '--sidebar-accent-foreground': string;
  '--sidebar-border': string;
  '--sidebar-ring': string;
  
  // Midnight variables
  '--midnight-50': string;
  '--midnight-100': string;
  '--midnight-200': string;
  '--midnight-300': string;
  '--midnight-400': string;
  '--midnight-500': string;
  '--midnight-600': string;
  '--midnight-700': string;
  '--midnight-800': string;
  '--midnight-900': string;
  '--midnight-950': string;
}

// Complete theme configuration
export interface ThemeConfig {
  name: string;
  description: string;
  colors: ThemeColors;
  cssVariables: ThemeCSSVariables;
  radius: number; // in rem
  isDark?: boolean; // Optional flag for dark mode themes
}

// Theme mode types
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme preference type
export interface ThemePreference {
  mode: ThemeMode;
  themeId: string;
}

// Theme context type
export interface ThemeContextType {
  currentTheme: string;
  themeConfig: ThemeConfig;
  availableThemes: Array<{ value: string; label: string; description: string }>;
  setTheme: (themeName: string) => void;
  applyTheme: (themeName: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

// Theme utility types
export type ThemeName = 'green-white' | 'blue-white' | 'purple-white' | 'dark-green' | 'dark-blue' | 'dark-purple';

// Theme validation type
export interface ThemeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Theme generation utilities
export interface ThemeGenerator {
  generateCSSVariables: (colors: ThemeColors, radius: number) => ThemeCSSVariables;
  validateTheme: (theme: ThemeConfig) => ThemeValidation;
  createDarkVariant: (lightTheme: ThemeConfig) => ThemeConfig;
} 