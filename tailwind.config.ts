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
        ink: {
          DEFAULT: "#0b1026",
          muted: "#5d6680",
        },
        navy: {
          DEFAULT: "#121a3e",
          900: "#090e26",
          700: "#1f2a5e",
          500: "#3d5afe",
        },
        saffron: "#ff9a3c",
        "india-green": "#149c4a",
        line: "rgba(15, 23, 42, 0.1)",
        "line-soft": "rgba(15, 23, 42, 0.06)",
        canvas: "#eef1f8",
        surface: "rgba(255, 255, 255, 0.62)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-instrument)", "Georgia", "serif"],
        deva: ["var(--font-deva)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        gov: "12px",
      },
      boxShadow: {
        glass: "0 20px 40px -15px rgba(30, 41, 90, 0.08), 0 0 1px 1px rgba(255, 255, 255, 0.8) inset",
        "glass-strong": "0 24px 48px -12px rgba(30, 41, 90, 0.14), 0 0 1px 1px rgba(255, 255, 255, 0.9) inset",
      },
      keyframes: {
        "scan-line": {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "scan-line": "scan-line 2.5s ease-in-out infinite alternate",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
