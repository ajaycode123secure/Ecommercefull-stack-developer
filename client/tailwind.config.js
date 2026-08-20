/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all source files for NativeWind class names
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/app/components/**/*.{js,jsx,ts,tsx}",
    "./assets/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand palette — mirrors COLORS in src/constants/index.ts
        primary: {
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F97316',
          foreground: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#F5F7FB',
        },
        background: '#F5F7FB',
        muted: {
          DEFAULT: '#6B7280',
          foreground: '#9CA3AF',
        },
        border: '#E5E7EB',
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}
