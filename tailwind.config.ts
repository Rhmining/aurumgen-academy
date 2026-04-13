import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E1C26",
        mist: "#F4F1EA",
        gold: "#C79331",
        pine: "#214039",
        coral: "#D66A4E"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif", "Georgia"]
      },
      boxShadow: {
        card: "0 20px 45px rgba(14, 28, 38, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
