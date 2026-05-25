/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 20px 60px rgba(0, 0, 0, 0.35)",
        gold: "0 18px 50px rgba(212, 175, 55, 0.18)",
      },
      colors: {
        matte: {
          950: "#050505",
          900: "#0a0a0a",
          800: "#111111",
          700: "#161616",
        },
        card: {
          950: "#050505",
          900: "#0a0a0a",
          800: "#111111",
          700: "#161616",
        },
        paper: {
          50: "#f5f5f5",
          100: "#ebebeb",
          200: "#d6d6d6",
        },
        gold: {
          300: "#F5D97B",
          400: "#E2C15A",
          500: "#D4AF37",
        },
        luxury: {
          50: "#fff8e1",
          100: "#ffefb3",
          200: "#ffe480",
          300: "#f5c542",
          400: "#e0b32e",
          500: "#d4af37",
          600: "#b88f21",
          700: "#8f6f18",
          800: "#634d11",
          900: "#3b2d0a",
        },
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.10) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
