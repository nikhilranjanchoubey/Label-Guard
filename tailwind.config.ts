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
        background: "#F6F8FB",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#123B5D",
          hover: "#0c2840",
          light: "#1e527f",
        },
        action: {
          DEFAULT: "#2563EB",
          hover: "#1d4ed8",
          light: "#3b82f6",
        },
        compliant: {
          DEFAULT: "#15803D",
          bg: "#F0FDF4",
          border: "#BBF7D0",
          text: "#166534",
        },
        warning: {
          DEFAULT: "#D97706",
          bg: "#FFFBEB",
          border: "#FDE68A",
          text: "#B45309",
        },
        violation: {
          DEFAULT: "#DC2626",
          bg: "#FEF2F2",
          border: "#FECACA",
          text: "#B91C1C",
        },
        boundary: "#E2E8F0",
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans-devanagari)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(18, 59, 93, 0.05), 0 1px 2px -1px rgba(18, 59, 93, 0.05)",
        hover: "0 4px 12px -2px rgba(18, 59, 93, 0.08)",
        modal: "0 12px 28px -4px rgba(18, 59, 93, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
