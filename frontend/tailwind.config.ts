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
        // Material Design 3 Orange Palette
        primary: {
          DEFAULT: "#904d00",
          container: "#ff8c00",
          fixed: "#ffdcbe",
          "fixed-dim": "#ffb77d",
        },
        "primary-container": "#ff8c00",
        "on-primary": "#ffffff",
        "on-primary-container": "#623200",
        "primary-fixed": "#ffdcbe",
        "primary-fixed-dim": "#ffb77d",

        surface: {
          DEFAULT: "#f9f9f9",
          bright: "#ffffff",
          container: {
            DEFAULT: "#eeeeee",
            low: "#f3f3f3",
            high: "#e8e8e8",
            lowest: "#ffffff",
            highest: "#e2e2e2",
          },
        },
        "surface-bright": "#ffffff",
        "surface-container": "#eeeeee",
        "surface-container-low": "#f3f3f3",
        "surface-container-high": "#e8e8e8",
        "surface-container-lowest": "#ffffff",
        "surface-container-highest": "#e2e2e2",

        // CamelCase aliases for backwards-compatibility
        surfaceContainer: {
          DEFAULT: "#eeeeee",
          low: "#f3f3f3",
          high: "#e8e8e8",
          lowest: "#ffffff",
          highest: "#e2e2e2",
        },

        "on-surface": "#1a1c1c",
        "on-surface-variant": "#564334",
        background: "#f9f9f9",
        "on-background": "#1a1c1c",
        outline: {
          DEFAULT: "#897362",
          variant: "#ddc1ae",
        },
        "outline-variant": "#ddc1ae",

        secondary: {
          DEFAULT: "#5e5e5e",
          foreground: "#ffffff",
        },
        "on-secondary": "#ffffff",

        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          foreground: "#ffffff",
        },
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        onErrorContainer: "#93000a",

        "inverse-surface": "#2f3131",
        "inverse-primary": "#ffb77d",

        // Legacy / Brand aliases
        brand: {
          DEFAULT: "#904d00",
          container: "#ff8c00",
          foreground: "#ffffff",
          muted: "#ff8c00",
          dim: "#623200",
        },
        ink: {
          DEFAULT: "#1a1c1c",
          warm: "#2f3131",
          card: "#ffffff",
          elevated: "#f3f3f3",
        },
        status: {
          profit: "#904d00",
          alert: "#ba1a1a",
          warning: "#ff8c00",
          info: "#5e5e5e",
          neutral: "#897362",
        },
        profit: "#904d00",
        whatsapp: "#25D366",
        success: {
          DEFAULT: "#904d00",
          background: "#f3f3f3",
          border: "#ddc1ae",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(17, 24, 39, 0.06), 0 4px 16px rgba(17, 24, 39, 0.06)",
        hover: "2px 2px 0px rgba(0,0,0,1)",
        float: "4px 4px 0px rgba(0, 0, 0, 1)",
        "float-brand": "4px 4px 0px rgba(0, 0, 0, 1)",
        sm: "0 1px 2px rgba(17, 24, 39, 0.05)",
        brutal: "4px 4px 0px rgba(0, 0, 0, 1)",
        "brutal-sm": "2px 2px 0px rgba(0, 0, 0, 1)",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
        full: "9999px",
      },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "64px",
        gutter: "24px",
        unit: "4px",
        "container-max": "1440px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        margin: "24px",
      },
      fontFamily: {
        display: ["'Hanken Grotesk'", "var(--font-display)", "sans-serif"],
        body: ["'Hanken Grotesk'", "var(--font-body)", "sans-serif"],
        mono: ["Geist", "var(--font-mono)", "monospace"],
        sans: ["'Hanken Grotesk'", "sans-serif"],
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "title-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-sm": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "mono-data": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "data-mono": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "data-mono-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        display: ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }],
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
