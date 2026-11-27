import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapped to Samsaam.io Electric Cobalt Blue (#3B86FF)
        brand: {
          25: "#f5f8ff",
          50: "#eef4ff",
          100: "#d6e6ff",
          200: "#b5d2ff",
          300: "#85b5ff",
          400: "#5a9aff",
          500: "#3b86ff",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#111e3e",
        },
        primary: {
          25: "#f5f8ff",
          50: "#eef4ff",
          100: "#d6e6ff",
          200: "#b5d2ff",
          300: "#85b5ff",
          400: "#5a9aff",
          500: "#3b86ff",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        gray: {
          25: "#f8faff",
          50: "#eef4ff",
          100: "#e3eaf6",
          200: "#dae7ff",
          300: "#b6c5e0",
          400: "#9da4b0",
          500: "#6a748a",
          600: "#424957",
          700: "#2a2d33",
          800: "#1c1e22",
          900: "#141518",
          950: "#0b0c0e",
        },
        success: {
          50: "#ecfdf3",
          100: "#dcfae6",
          500: "#26bf6a",
          600: "#189d53",
          700: "#127a40",
        },
        warning: {
          50: "#fffaeb",
          100: "#fef0c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        error: {
          50: "#fef3f2",
          100: "#fee4e2",
          500: "#ea5b5b",
          600: "#d92d20",
          700: "#b42318",
        },
      },
      boxShadow: {
        xs: "0 1px 2px rgba(12, 24, 54, 0.05), 0 2px 8px -4px rgba(12, 24, 54, 0.06)",
        sm: "0 2px 8px -2px rgba(12, 24, 54, 0.08)",
        md: "0 12px 32px -16px rgba(12, 24, 54, 0.22)",
        lg: "0 24px 64px -24px rgba(12, 24, 54, 0.32)",
        xl: "0 28px 72px -24px rgba(0, 0, 0, 0.65)",
      },
      fontFamily: {
        sans: [
          "var(--font-ui)",
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
