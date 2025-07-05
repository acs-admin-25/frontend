import { Inter, Playfair_Display, Montserrat } from 'next/font/google';

// Primary font for body text and general content - Professional and clean
export const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    preload: true,
    fallback: ['system-ui', 'arial'],
});

// Display font for headings and featured text - Professional serif
export const playfair = Playfair_Display({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-playfair',
    preload: true,
    fallback: ['Georgia', 'serif'],
});

// Secondary font for navigation and UI elements - Clean and modern
export const montserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-montserrat',
    preload: true,
    fallback: ['system-ui', 'arial'],
});

// Combine font classes for easy application
export const getFontClasses = () => {
    return [
        inter.variable,
        playfair.variable,
        montserrat.variable
    ].join(' ');
};

// CSS variables for font families - Inter as primary professional font
export const fontFamilies = {
    sans: 'var(--font-inter)', // Primary professional font
    display: 'var(--font-playfair)', // Professional serif for headings
    ui: 'var(--font-montserrat)', // Clean UI font
}; 