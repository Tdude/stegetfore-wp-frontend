/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // this will catch all files in src
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-animate"), // if you're using this
  ],
};
