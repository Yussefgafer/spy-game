import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeType = 'DARK' | 'LIGHT' | 'NEON';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  border: string;
  danger: string;
}

export interface ThemeContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: ThemeColors;
  glassScheme: 'dark' | 'light';
}

const THEMES: Record<ThemeType, ThemeColors> = {
  DARK: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textMuted: '#A0A0A0',
    accent: '#00E676', // أخضر نيون
    accentMuted: 'rgba(0, 230, 118, 0.15)',
    border: '#2C2C2C',
    danger: '#FF3366',
  },
  LIGHT: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#121212',
    textMuted: '#707070',
    accent: '#4CAF50', // أخضر غامق مريح
    accentMuted: 'rgba(76, 175, 80, 0.15)',
    border: '#E0E0E0',
    danger: '#D32F2F',
  },
  NEON: {
    background: '#050515',
    card: '#0D0D26',
    text: '#00FFFF', // سماوي نيون (Cyan)
    textMuted: '#8A8A9F',
    accent: '#FF00FF', // فوشيا نيون (Magenta)
    accentMuted: 'rgba(255, 0, 255, 0.15)',
    border: '#1F1F44',
    danger: '#FF3366',
  },
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>(
    systemScheme === 'light' ? 'LIGHT' : 'DARK'
  );

  // تحميل الثيم المحفوظ — إن لم يوجد نستخدم ثيم النظام
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('SPY_GAME_THEME');
        if (savedTheme && (savedTheme === 'DARK' || savedTheme === 'LIGHT' || savedTheme === 'NEON')) {
          setThemeState(savedTheme as ThemeType);
        }
        // لا saved theme → ثيم النظام يبقى مفعلاً
      } catch (error) {
        console.error('خطأ أثناء تحميل الثيم:', error);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('SPY_GAME_THEME', newTheme);
    } catch (error) {
      console.error('خطأ أثناء حفظ الثيم:', error);
    }
  };

  const colors = THEMES[theme];
  const glassScheme = theme === 'LIGHT' ? 'light' : 'dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, glassScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
