/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#62d56a",
        secondary: "#A2FAA8",
        tertiary: "#ADB8AC",
      },
    },
    plugins: [],
  },
};
