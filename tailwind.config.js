/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand (existing)
        brand: {
          DEFAULT: '#FF6B6B',
          dark: '#D94A4A'
        },
        // New accent (carrot tone for interactive emphasis)
        carrot: {
          DEFAULT: '#FC924C',
          dark: '#CC6A1F'
        },
        // Navbar deep natural palette
        nav: {
          DEFAULT: '#1F2E25', // base
          dark: '#18241E' // subtle darker bottom / hover shade
        },
        // Surfaces for future section backgrounds
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F5F7F5'
        }
      }
    }
  },
  plugins: []
};
