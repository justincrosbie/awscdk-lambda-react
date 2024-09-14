import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  card: string;
  border: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  primary: '#1E40AF',   // Deep blue
  secondary: '#3B82F6', // Bright blue
  accent: '#10B981',    // Emerald green
  background: '#F3F4F6', // Light gray
  text: '#1F2937',      // Dark gray
  card: '#FFFFFF',      // White
  border: '#E5E7EB',    // Light gray
};

const darkColors: ThemeColors = {
  primary: '#60A5FA',   // Light blue
  secondary: '#3B82F6', // Bright blue
  accent: '#34D399',    // Light emerald
  background: '#111827', // Very dark blue
  text: '#F9FAFB',      // Off-white
  card: '#1F2937',      // Dark gray
  border: '#374151',    // Medium gray
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  const colors = theme === 'light' ? lightColors : darkColors;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};