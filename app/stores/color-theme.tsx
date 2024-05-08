'use client';

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { useLocalStorage } from 'react-use';

export type ColorTheme = 'light' | 'dark' | undefined;
export interface ColorThemeContextType {
  colorTheme: ColorTheme;
  changeColorTheme: Dispatch<SetStateAction<ColorTheme>>;
  removeColorTheme: () => void;
}
const ColorThemeContext = createContext<ColorThemeContextType>({
  colorTheme: undefined,
  changeColorTheme: () => {},
  removeColorTheme: () => {},
});

function ColorThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorTheme, changeColorTheme, removeColorTheme] =
    useLocalStorage<ColorTheme>('color-theme');

  useEffect(() => {
    if (isDarkMode(colorTheme)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorTheme]);

  return (
    <ColorThemeContext.Provider
      value={{ colorTheme, changeColorTheme, removeColorTheme }}
    >
      {children}
    </ColorThemeContext.Provider>
  );
}

function useColorThemeStore() {
  return useContext(ColorThemeContext);
}

function isDarkMode(colorTheme: ColorTheme) {
  if (
    colorTheme === 'dark' ||
    (colorTheme === undefined &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    return true;
  }

  return false;
}

export { ColorThemeContextProvider, useColorThemeStore, isDarkMode };
