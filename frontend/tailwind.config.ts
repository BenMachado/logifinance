import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F97316",
          foreground: "#ffffff",
          muted: "#FB923C",
          dim: "#C2410C",
        },
        ink: {
          DEFAULT: "#0D0D0D",
          warm: "#1A1410",
          card: "#161210",
          elevated: "#1F1914",
        },
        primary: { DEFAULT: "#F97316", foreground: "#ffffff" },
        tertiary: "#111827",

        background: "#F4F5F7",
        surface: { DEFAULT: "#F4F5F7", bright: "#ffffff" },
        foreground: "#111827",
        on: { surface: "#111827", surfaceVariant: "#6B7280" },
        secondary: { DEFAULT: "#6B7280", foreground: "#ffffff" },
        outline: { DEFAULT: "#9CA3AF", variant: "#E5E7EB" },
        surfaceContainer: {
          lowest: "#ffffff",
          low: "#F9FAFB",
          DEFAULT: "#F3F4F6",
          high: "#E5E7EB",
          highest: "#D1D5DB",
        },
        surfaceVariant: "#E5E7EB",
        surfaceDim: "#D1D5DB",

        error: { DEFAULT: "#DC2626", container: "#FEE2E2", foreground: "#ffffff" },
        onErrorContainer: "#991B1B",
        success: { DEFAULT: "#059669", background: "#ECFDF5", border: "#A7F3D0" },
        profit: "#059669",
        whatsapp: "#25D366",

        // Status colors — sólidos e vibrantes
        status: {
          profit: "#10B981",
          alert: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
          neutral: "#6B7280",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(17, 24, 39, 0.06), 0 4px 16px rgba(17, 24, 39, 0.06)",
        hover: "0 4px 24px rgba(17, 24, 39, 0.12), 0 1px 4px rgba(17, 24, 39, 0.06)",
        float: "0 18px 50px rgba(0, 0, 0, 0.35)",
        "float-brand": "0 8px 32px rgba(249, 115, 22, 0.2)",
        sm: "0 1px 2px rgba(17, 24, 39, 0.05)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        gutter: "16px",
        margin: "24px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "data-mono": ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        "data-mono-sm": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        "label-caps": ["11px", { lineHeight: "1", letterSpacing: "0.08em", fontWeight: "700" }],
        "headline-sm": ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-lg": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        display: ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-hero": [
          "clamp(2.5rem, 7vw, 4.75rem)",
          { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "800" },
        ],
      },
      keyframes: {
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-slide-up": "fade-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.35s ease both",
        shimmer: "shimmer 1.6s linear infinite",
        "slide-in-left": "slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "bounce-subtle": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
