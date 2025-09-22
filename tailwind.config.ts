import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        pulse: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideIn: {
          from: {
            transform: "translateX(-10px)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "neon-pulse": {
          "0%, 100%": {
            boxShadow: "var(--neon-glow-sm)",
          },
          "50%": {
            boxShadow: "var(--neon-glow-lg)",
          },
        },
        "neon-flicker": {
          "0%, 100%": {
            opacity: "1",
            textShadow: "0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary)), 0 0 15px hsl(var(--primary))",
          },
          "50%": {
            opacity: "0.8",
            textShadow: "0 0 2px hsl(var(--primary)), 0 0 5px hsl(var(--primary)), 0 0 8px hsl(var(--primary))",
          },
        },
        "cyber-pulse": {
          "0%, 100%": {
            filter: "brightness(1) saturate(1)",
          },
          "50%": {
            filter: "brightness(1.2) saturate(1.5)",
          },
        },
        "cyber-scan": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateX(100%)",
            opacity: "0",
          },
        },
        "matrix-rain": {
          "0%": {
            transform: "translateY(-100vh)",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
          },
          "90%": {
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100vh)",
            opacity: "0",
          },
        },
        "hologram-flicker": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "25%": {
            opacity: "0.8",
            transform: "scale(1.02)",
          },
          "50%": {
            opacity: "0.9",
            transform: "scale(0.98)",
          },
          "75%": {
            opacity: "0.85",
            transform: "scale(1.01)",
          },
        },
        "holographic-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        "neon-glow": {
          "0%, 100%": {
            boxShadow: "var(--neon-glow-sm)",
          },
          "50%": {
            boxShadow: "var(--neon-glow-lg)",
          },
        },
        "cyber-border": {
          "0%, 100%": {
            borderColor: "hsl(var(--primary))",
          },
          "50%": {
            borderColor: "hsl(var(--accent))",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: "pulse 2s infinite",
        fadeIn: "fadeIn 0.3s ease-out",
        slideIn: "slideIn 0.3s ease-out",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "neon-flicker": "neon-flicker 2s ease-in-out infinite alternate",
        "cyber-pulse": "cyber-pulse 3s ease-in-out infinite",
        "cyber-scan": "cyber-scan 3s linear infinite",
        "matrix-rain": "matrix-rain 4s linear infinite",
        "hologram-flicker": "hologram-flicker 0.5s ease-in-out infinite",
        "holographic-shift": "holographic-shift 3s ease-in-out infinite",
        "neon-glow": "neon-glow 2s ease-in-out infinite",
        "cyber-border": "cyber-border 2s ease-in-out infinite",
      },
      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
