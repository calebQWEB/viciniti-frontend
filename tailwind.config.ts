import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0faf4",
          100: "#d7f0e3",
          200: "#b2e0ca",
          300: "#80c9a8",
          400: "#52B788",
          500: "#2D6A4F",
          600: "#245c43",
          700: "#1d4d38",
          800: "#173d2c",
          900: "#102d20",
        },
        accent: {
          400: "#F9B97A",
          500: "#F4A261",
          600: "#e8894a",
        },
        earth: {
          50: "#FAFAF8",
          100: "#F5F5F0",
          200: "#E8E8E0",
          300: "#D4D4C8",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
