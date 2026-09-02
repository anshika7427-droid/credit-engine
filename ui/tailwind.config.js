/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vapor: {
          canvas: "#F4F7F6",      // Primary page background
          card: "#FFFFFF",        // Elevated cards & surfaces
          border: "#DDE5E5",      // 1px hairline architectural borders
          subtle: "#EBF1F0",      // Light hover fills & track backgrounds
        },
        steel: {
          ink: "#111E25",         // Deep headline & high-contrast text
          muted: "#4F616B",       // Secondary labels & descriptions
          primary: "#0E7490",     // Main primary button & key interaction accent
          hover: "#155E75",       // Button hover & active states
          tint: "#ECFEFF",        // Pill badge backgrounds & soft selection fills
          ring: "rgba(14, 116, 144, 0.15)", // Focus rings & soft halos
        },
      },
    },
  },
  plugins: [],
}
