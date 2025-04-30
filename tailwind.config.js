/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        chatBlue: "#007bff",
        chatGray: "#e9ecef",
        chatError: "#f8d7da",
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};