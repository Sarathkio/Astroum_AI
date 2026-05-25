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
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        gold: {
          50: "#fbf8eb",
          100: "#f4ebb9",
          500: "#cda84f",
          600: "#b58d3c",
          700: "#916c2c",
          800: "#745225",
        },
        brandBlue: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        brandPurple: {
          DEFAULT: '#8b5cf6',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        slate: {
          950: "#060813",
        }
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
