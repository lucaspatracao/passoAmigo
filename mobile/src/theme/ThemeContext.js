import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDarkMode, setDarkMode } from '../storage/settings';
import { colors as lightColors, spacing, typography, radius, shadows } from './theme';

// Cores do tema escuro com melhor contraste
const darkColors = {
  ...lightColors,
  background: '#1A1D29',
  backgroundSecondary: '#252836',
  surface: '#2D3142',
  surfaceElevated: '#353849',
  text: '#FFFFFF',
  textSecondary: '#E0E4EB', // Melhor contraste
  textMuted: '#A8B0C0', // Melhor contraste (WCAG AA)
  textLight: '#6B7280',
  border: '#2D3142',
  borderLight: '#353849',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const dark = await getDarkMode();
      setIsDark(dark);
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTheme() {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await setDarkMode(newTheme);
  }

  const theme = {
    colors: isDark ? darkColors : lightColors,
    spacing,
    typography,
    radius,
    shadows: {
      ...shadows,
      small: {
        ...shadows.small,
        shadowColor: isDark ? darkColors.shadow : shadows.small.shadowColor,
      },
      medium: {
        ...shadows.medium,
        shadowColor: isDark ? darkColors.shadow : shadows.medium.shadowColor,
      },
      large: {
        ...shadows.large,
        shadowColor: isDark ? darkColors.shadow : shadows.large.shadowColor,
      },
      card: {
        ...shadows.card,
        shadowColor: isDark ? darkColors.shadow : shadows.card.shadowColor,
      },
    },
    isDark,
    toggleTheme,
  };

  if (loading) {
    return null; // Ou um loading spinner
  }

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
