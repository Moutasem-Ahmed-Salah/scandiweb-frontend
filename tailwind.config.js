/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      transitionDuration: {
        500: "500ms", // Customize duration as needed
      },
    },
  },
  plugins: [],
};
