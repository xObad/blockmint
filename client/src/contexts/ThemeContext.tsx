import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // First check localStorage for user preference
    const saved = localStorage.getItem("theme");
    if (saved) return (saved as Theme);
    
    // Force dark theme by default (ignore system preference)
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    
    // Update native status bar style based on theme
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ 
        style: theme === "dark" ? Style.Dark : Style.Light 
      }).catch(() => {});
    }
  }, [theme]);

  // No longer listen for system theme changes - user controls theme explicitly

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
