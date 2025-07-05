/**
 * Simplified Theme System for ACS Next.js
 * Direct mapping from theme colors to Tailwind classes
 */

// Simple theme structure - no complex interfaces
export interface SimpleTheme {
  name: string;
  colors: {
    // Core colors
    primary: string;
    'primary-light': string;
    'primary-dark': string;
    secondary: string;
    'secondary-light': string;
    'secondary-dark': string;
    'secondary-xlight': string;
    
    // Background colors
    background: string;
    'background-paper': string;
    'background-accent': string;
    card: string;
    'card-light': string;
    
    // Text colors - Enhanced with contrast variants
    foreground: string;
    'text-secondary': string;
    'text-muted': string;
    'text-inverse': string;
    
    // New contrast variants for better accessibility
    'text-on-primary': string;      // Text on primary background
    'text-on-secondary': string;    // Text on secondary background
    'text-on-accent': string;       // Text on accent background
    'text-on-muted': string;        // Text on muted background
    'text-on-card': string;         // Text on card background
    'text-on-card-light': string;   // Text on light card background
    'text-on-gradient': string;     // Text on gradient backgrounds
    
    // Border colors
    border: string;
    'border-subtle': string;
    'border-accent': string;
    
    // Status colors
    'status-success': string;
    'status-warning': string;
    'status-error': string;
    'status-info': string;
    
    // Warning color for widget conflicts
    'warning': string;
    
    // Midnight palette
    'midnight-50': string;
    'midnight-100': string;
    'midnight-200': string;
    'midnight-300': string;
    'midnight-400': string;
    'midnight-500': string;
    'midnight-600': string;
    'midnight-700': string;
    'midnight-800': string;
    'midnight-900': string;
    'midnight-950': string;
  };
  radius: number;
}

// Green & White Theme
export const greenTheme: SimpleTheme = {
  name: 'Green & White',
  colors: {
    // Core colors - More aesthetic and modern
    primary: '#288e41',
    'primary-light': '#10b981',
    'primary-dark': '#047857',
    secondary: '#288e41',
    'secondary-light': '#34d399',
    'secondary-dark': '#047857',
    'secondary-xlight': '#d1fae5',
    
    // Background colors
    background: '#FFFFFF',
    'background-paper': '#FFFFFF',
    'background-accent': '#f0fdf4',
    card: '#f8fafc',
    'card-light': '#ffffff',
    
    // Text colors
    foreground: '#0f172a',
    'text-secondary': 'rgba(15, 23, 42, 0.7)',
    'text-muted': 'rgba(15, 23, 42, 0.5)',
    'text-inverse': '#FFFFFF',
    
    // Enhanced contrast variants
    'text-on-primary': '#FFFFFF',      // White text on primary green
    'text-on-secondary': '#FFFFFF',    // White text on secondary green
    'text-on-accent': '#0f172a',       // Dark text on light accent
    'text-on-muted': '#0f172a',        // Dark text on muted background
    'text-on-card': '#0f172a',         // Dark text on card background
    'text-on-card-light': '#374151',   // Slightly muted text on light card
    'text-on-gradient': '#FFFFFF',     // White text on gradient backgrounds
    
    // Border colors
    border: 'rgba(15, 23, 42, 0.08)',
    'border-subtle': 'rgba(15, 23, 42, 0.04)',
    'border-accent': '#059669',
    
    // Status colors
    'status-success': '#22c55e',
    'status-warning': '#eab308',
    'status-error': '#ef4444',
    'status-info': '#3b82f6',
    
    // Warning color for widget conflicts
    'warning': '#ff0000',
    
    // Midnight palette
    'midnight-50': '#eafff6',
    'midnight-100': '#baffdf',
    'midnight-200': '#7dffd0',
    'midnight-300': '#39ffb7',
    'midnight-400': '#00ff94',
    'midnight-500': '#00ff6a',
    'midnight-600': '#00b34a',
    'midnight-700': '#007a34',
    'midnight-800': '#00331a',
    'midnight-900': '#001a0d',
    'midnight-950': '#000a05',
  },
  radius: 0.5,
};

// Blue & White Theme
export const blueTheme: SimpleTheme = {
  name: 'Blue & White',
  colors: {
    // Core colors - More aesthetic and modern
    primary: '#1d4ed8',
    'primary-light': '#3b82f6',
    'primary-dark': '#1e40af',
    secondary: '#1d4ed8',
    'secondary-light': '#60a5fa',
    'secondary-dark': '#1e40af',
    'secondary-xlight': '#dbeafe',
    
    // Background colors
    background: '#FFFFFF',
    'background-paper': '#FFFFFF',
    'background-accent': '#eff6ff',
    card: '#f8fafc',
    'card-light': '#fefefe',
    
    // Text colors
    foreground: '#0f172a',
    'text-secondary': 'rgba(15, 23, 42, 0.7)',
    'text-muted': 'rgba(15, 23, 42, 0.5)',
    'text-inverse': '#FFFFFF',
    
    // Enhanced contrast variants
    'text-on-primary': '#FFFFFF',      // White text on primary blue
    'text-on-secondary': '#FFFFFF',    // White text on secondary blue
    'text-on-accent': '#0f172a',       // Dark text on light accent
    'text-on-muted': '#0f172a',        // Dark text on muted background
    'text-on-card': '#0f172a',         // Dark text on card background
    'text-on-card-light': '#374151',   // Slightly muted text on light card
    'text-on-gradient': '#FFFFFF',     // White text on gradient backgrounds
    
    // Border colors
    border: 'rgba(15, 23, 42, 0.08)',
    'border-subtle': 'rgba(15, 23, 42, 0.04)',
    'border-accent': '#1d4ed8',
    
    // Status colors
    'status-success': '#22c55e',
    'status-warning': '#eab308',
    'status-error': '#ef4444',
    'status-info': '#3b82f6',
    
    // Warning color for widget conflicts
    'warning': '#ff0000',
    
    // Midnight palette
    'midnight-50': '#f0f7ff',
    'midnight-100': '#e0effe',
    'midnight-200': '#bae0fd',
    'midnight-300': '#7cc7fb',
    'midnight-400': '#36a7f7',
    'midnight-500': '#0e8aed',
    'midnight-600': '#0c6fd8',
    'midnight-700': '#0d5ab0',
    'midnight-800': '#114b8f',
    'midnight-900': '#134076',
    'midnight-950': '#0d2a4d',
  },
  radius: 0.5,
};

/**
 * Generate CSS variables from simple theme
 */
export function generateCSSVars(theme: SimpleTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  
  // Convert theme colors to CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/-/g, '-')}`;
    vars[cssVar] = value;
  });
  
  // Add radius
  vars['--radius'] = `${theme.radius}rem`;
  
  return vars;
}

/**
 * Generate Tailwind colors from simple theme
 */
export function generateTailwindColors(theme: SimpleTheme) {
  const colors: Record<string, any> = {};
  
  // Convert theme colors to Tailwind format
  Object.entries(theme.colors).forEach(([key, value]) => {
    const tailwindKey = key.replace(/-/g, '-');
    colors[tailwindKey] = `var(--${key})`;
  });
  
  // Add semantic color mappings
  return {
    // Core semantic colors
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    
    // Primary colors
    primary: {
      DEFAULT: 'var(--primary)',
      light: 'var(--primary-light)',
      dark: 'var(--primary-dark)',
      foreground: 'var(--text-on-primary)',
    },
    
    // Secondary colors
    secondary: {
      DEFAULT: 'var(--secondary)',
      light: 'var(--secondary-light)',
      dark: 'var(--secondary-dark)',
      xlight: 'var(--secondary-xlight)',
      foreground: 'var(--text-on-secondary)',
    },
    
    // Muted colors
    muted: {
      DEFAULT: 'var(--background-accent)',
      foreground: 'var(--text-on-muted)',
    },
    
    // Card colors
    card: {
      DEFAULT: 'var(--card)',
      foreground: 'var(--text-on-card)',
      light: 'var(--card-light)',
      'light-foreground': 'var(--text-on-card-light)',
    },
    
    // Direct access to card-light-foreground for easier use
    'card-light-foreground': 'var(--text-on-card-light)',
    
    // Border
    border: 'var(--border)',
    
    // Status colors
    status: {
      success: 'var(--status-success)',
      warning: 'var(--status-warning)',
      error: 'var(--status-error)',
      info: 'var(--status-info)',
    },
    
    // Text contrast variants with opacity support
    'text-on-primary': 'var(--text-on-primary)',
    'text-on-secondary': 'var(--text-on-secondary)',
    'text-on-accent': 'var(--text-on-accent)',
    'text-on-muted': 'var(--text-on-muted)',
    'text-on-card': 'var(--text-on-card)',
    'text-on-card-light': 'var(--text-on-card-light)',
    'text-on-gradient': 'var(--text-on-gradient)',
    
    // Midnight palette
    midnight: {
      50: 'var(--midnight-50)',
      100: 'var(--midnight-100)',
      200: 'var(--midnight-200)',
      300: 'var(--midnight-300)',
      400: 'var(--midnight-400)',
      500: 'var(--midnight-500)',
      600: 'var(--midnight-600)',
      700: 'var(--midnight-700)',
      800: 'var(--midnight-800)',
      900: 'var(--midnight-900)',
      950: 'var(--midnight-950)',
    },
    
    // All other colors as direct access
    ...colors,
  };
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: SimpleTheme) {
  const vars = generateCSSVars(theme);
  
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

/**
 * Get current theme
 */
export function getCurrentTheme(): SimpleTheme {
  // For now, return green theme - can be enhanced with localStorage
  return greenTheme;
} 