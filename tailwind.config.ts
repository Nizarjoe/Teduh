import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        rain: "rgb(var(--rain) / <alpha-value>)",
        "rain-deep": "rgb(var(--rain-deep) / <alpha-value>)",
        mist: "rgb(var(--mist) / <alpha-value>)",
        sand: "rgb(var(--sand) / <alpha-value>)",
        clay: "rgb(var(--clay) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      maxWidth: {
        page: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
