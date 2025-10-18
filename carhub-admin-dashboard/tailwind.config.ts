import { type Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: "class",
  content: [
  "./app/**/*.{ts,tsx,js,jsx}",
  "./components/**/*.{ts,tsx,js,jsx}",
  "./src/**/*.{ts,tsx,js,jsx}",
],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  // plugins: [require("tailwindcss-animate")],
}

export default config
