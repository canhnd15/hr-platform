import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        dark: {
          1: "#101624",
          2: "#18191c",
          3: "#0e315a",
        },
        gray: {
          1: "#565c69",
          2: "#7e8494",
          3: "#bdc0ce",
          4: "#e5e7ef",
          5: "#f6f7fc",
        },
        positive: {
          DEFAULT: "#47bd5f",
          light: "#e6f7e4",
        },
        warning: {
          DEFAULT: "#f9b217",
          light: "#fff8e7",
        },
        nav: {
          "active-bg": "#d3def3",
          "active-color": "#172b8a",
          "inactive-color": "#3e4878",
        },
        canvas: "#eef0f6",
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "btn-primary":
          "0 1px 2px rgba(8,8,8,.2), 0 4px 4px rgba(8,8,8,.08), inset 0 1px 1px rgba(255,255,255,.2), inset 0 6px 12px rgba(255,255,255,.12)",
        card: "0 8px 28px rgba(3,106,229,.09)",
        drawer: "-4px 0 24px rgba(0,0,0,.12)",
        "drawer-l": "4px 0 24px rgba(0,0,0,.14)",
        modal: "0 8px 24px rgba(0,0,0,.16)",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(.4,0,.2,1)",
      },
      screens: {
        xs: "480px",
        sm: "600px",
        md: "744px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
