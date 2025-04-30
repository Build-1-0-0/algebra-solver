/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        chatBlue: "#2563eb",
        chatIndigo: "#4f46e5",
        chatGray: "rgba(255, 255, 255, 0.6)",
        chatError: "rgba(254, 226, 226, 0.9)",
      },
      animation: {
        slideIn: "slideIn 0.4s ease-out",
        pulse: "pulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateY(30px) scale(0.95)", opacity: "0" },
          to: { transform: "translateY(0) scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};