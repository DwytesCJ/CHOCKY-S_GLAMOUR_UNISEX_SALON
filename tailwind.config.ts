import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Dark Pink / Rose
        primary: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f5a8b8',
          400: '#ef7691',
          500: '#e54d6d', // Main dark pink
          600: '#d12d52',
          700: '#af2244',
          800: '#921f3d',
          900: '#7c1d38',
          950: '#450b1a',
        },
        // Secondary - Rose Gold
        rose: {
          gold: '#b76e79',
          light: '#d4a5a5',
          dark: '#8b4d57',
        },
        // Accent - Burgundy
        burgundy: {
          50: '#fdf2f3',
          100: '#fce7e9',
          200: '#f9d0d5',
          300: '#f4a9b3',
          400: '#ec7a8a',
          500: '#e04d63',
          600: '#cc2d4a',
          700: '#ab223c',
          800: '#8f1f37',
          900: '#722f37', // Main burgundy
          950: '#44111a',
        },
        // Neutral - Cream/Warm tones
        cream: {
          50: '#fefdfb',
          100: '#fdf8f5',
          200: '#faf3ed',
          300: '#f5ebe0',
          400: '#ede0d0',
          500: '#e3d5c3',
          600: '#d4c4ae',
          700: '#bfa98f',
          800: '#a08b70',
          900: '#7d6b55',
        },
        // Dark tones
        dark: {
          DEFAULT: '#1a1a1a',
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#1a1a1a',
        },
        // Coral accent
        coral: {
          50: '#fff5f3',
          100: '#ffe9e4',
          200: '#ffd7ce',
          300: '#ffbdad',
          400: '#ff9680',
          500: '#e8a598', // Main coral
          600: '#d47a6a',
          700: '#b25a4a',
          800: '#944c3f',
          900: '#7b4439',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-glamour': 'linear-gradient(135deg, #e54d6d 0%, #b76e79 50%, #722f37 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(229, 77, 109, 0.9) 0%, rgba(183, 110, 121, 0.8) 50%, rgba(114, 47, 55, 0.9) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%)',
      },
      boxShadow: {
        'glamour': '0 4px 20px rgba(229, 77, 109, 0.25)',
        'glamour-lg': '0 10px 40px rgba(229, 77, 109, 0.3)',
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 25px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
