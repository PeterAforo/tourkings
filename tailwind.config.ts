import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#003b7a",
          container: "#1d5299",
          fixed: "#d6e3ff",
          "fixed-dim": "#aac7ff",
        },
        secondary: {
          DEFAULT: "#865300",
          container: "#ffa522",
          fixed: "#ffddb9",
          "fixed-dim": "#ffb963",
        },
        tertiary: {
          DEFAULT: "#731c00",
          container: "#9b2900",
          fixed: "#ffdbd1",
          "fixed-dim": "#ffb59f",
        },
        surface: {
          DEFAULT: "#fff8f5",
          dim: "#e1d8d3",
          bright: "#fff8f5",
          container: {
            DEFAULT: "#f6ece7",
            low: "#fbf2ec",
            high: "#f0e6e1",
            highest: "#eae1db",
            lowest: "#ffffff",
          },
          variant: "#eae1db",
          tint: "#2d5ea5",
        },
        "on-surface": {
          DEFAULT: "#1f1b18",
          variant: "#424751",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#abc7ff",
          fixed: "#001b3e",
          "fixed-variant": "#05458c",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#694000",
          fixed: "#2b1700",
          "fixed-variant": "#663e00",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#ffb59f",
          fixed: "#3a0a00",
          "fixed-variant": "#862200",
        },
        outline: {
          DEFAULT: "#737782",
          variant: "#c3c6d2",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        inverse: {
          surface: "#342f2c",
          "on-surface": "#f8efea",
          primary: "#aac7ff",
        },
        background: "#fff8f5",
        "on-background": "#1f1b18",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        accent: {
          50: "#EBF1FA",
          100: "#CDDCF2",
          200: "#9BB9E5",
          300: "#6996D8",
          400: "#3773CB",
          500: "#2B5EA7",
          600: "#224B85",
          700: "#1A3964",
          800: "#112642",
          900: "#091321",
        },
        dark: {
          700: "#1C2540",
          800: "#141B2E",
          900: "#0B1120",
        },
      },
      fontFamily: {
        headline: ["var(--font-plus-jakarta)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
        label: ["var(--font-manrope)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
