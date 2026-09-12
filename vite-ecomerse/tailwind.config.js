/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FF",
          100: "#D9E6FF",
          200: "#B3CDFF",
          300: "#82ACFB",
          400: "#5488EF",
          500: "#2F68DA",
          600: "#2151B0",
          700: "#1A3F8A",
          800: "#152F63",
          900: "#0F2145",
        },
        accent: {
          400: "#22C7E0",
          500: "#0EA5C7",
          600: "#0B84A3",
        },
        surface: {
          DEFAULT: "#F5F8FC",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};