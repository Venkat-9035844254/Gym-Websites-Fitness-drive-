import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#e6fdff",
          100: "#b3f8ff",
          200: "#80f4ff",
          300: "#4df0ff",
          400: "#1aebff",
          500: "#00f0ff", // Primary Electric Cyan
          600: "#00b8c4",
          700: "#00838c",
          800: "#005156",
          900: "#002326",
          accent: "#ff0055", // Neon Pink/Red Accent
        },
        dark: {
          base: "#090d16",
          card: "#121826",
          hover: "#1a2336",
          border: "#232e42",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to right bottom, rgba(9, 13, 22, 0.95), rgba(18, 24, 38, 0.85))',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 240, 255, 0.25)',
        'neon-pink': '0 0 20px rgba(255, 0, 85, 0.25)',
        'glow': '0 0 40px rgba(0, 240, 255, 0.15)',
      }
    },
  },
  plugins: [],
};
export default config;
