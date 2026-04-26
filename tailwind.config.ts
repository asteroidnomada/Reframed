import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        "bg-subtle": "#F7F6F5",
        fg: "#0F0F0F",
        "fg-muted": "#6B6B6B",
        "fg-faint": "#ADADAD",
        border: "#E5E4E2",
        "border-strong": "#C9C8C6",
        accent: "#1A1A1A",
        "accent-hover": "#333333",
        overlay: "rgba(0,0,0,0.48)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(15,15,15,0.04), 0 1px 1px rgba(15,15,15,0.03)",
        md: "0 4px 12px rgba(15,15,15,0.06), 0 2px 4px rgba(15,15,15,0.04)",
        lg: "0 16px 40px rgba(15,15,15,0.12), 0 4px 12px rgba(15,15,15,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
