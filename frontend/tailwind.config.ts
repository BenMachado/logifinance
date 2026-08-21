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
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 24, 39, 0.04), 0 4px 12px rgba(17, 24, 39, 0.04)",
        float: "0 18px 50px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
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
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
