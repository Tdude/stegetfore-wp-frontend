/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // this will catch all files in src
  ],
  theme: {
    extend: {
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        DEFAULT: "0 2px 4px var(--tw-shadow-color)",
        lg: "0 8px 16px var(--tw-shadow-color)",
        xl: "0 10px 20px var(--tw-shadow-color)",
      },
      boxShadow: {
        custom: "0 10px 34px rgba(18, 25, 38, 0.04)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "calc(var(--radius) - 2px)",
        lg: "12px",
        xl: "16px",
      },
      colors: {
        // Direct color values (preferred approach for your specific brand colors)
        primary: "#ffb500", // #ffdd00 The yellow original color
        "primary-foreground": "#040404", // Dark text on primary color
        secondary: "#f4f4f4", // Light gray from your CSS
        "secondary-foreground": "#040404",
        muted: "#eaeaea", // Border color from your CSS
        "muted-foreground": "#666666", // Light text color
        background: "#fbfbfb", // Body background
        foreground: "#333333", // Main text color
        border: "#eaeaea",
        input: "#6b7280",
        ring: "#2563eb",
        destructive: "#db2c23", // Warning red from notice.warning
        "destructive-foreground": "#ffffff",
        accent: "#f4f4f4", // theme-light color
        "accent-foreground": "#040404",

        // Chart colors can still use HSL variables for flexibility
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },

        // Card and popover can use either approach
        // If you want to keep using HSL variables for theming:
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        heading: ["Raleway", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "1.25rem",
        lg: "2rem",
      },
      screens: {
        sm: "540px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
