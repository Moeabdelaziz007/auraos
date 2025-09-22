import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  accentColor: "theme-violet",
  setAccentColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultAccentColor = "theme-violet",
  storageKey = "vite-ui-theme",
  accentStorageKey = "vite-ui-accent",
  ...props
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultAccentColor?: string;
  storageKey?: string;
  accentStorageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [accentColor, setAccentColor] = useState<string>(
    () => localStorage.getItem(accentStorageKey) || defaultAccentColor
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const body = window.document.body;
    // Remove any existing theme classes
    body.classList.forEach(className => {
      if (className.startsWith("theme-")) {
        body.classList.remove(className);
      }
    });
    body.classList.add(accentColor);
    localStorage.setItem(accentStorageKey, accentColor);
  }, [accentColor, accentStorageKey]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    accentColor,
    setAccentColor,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
