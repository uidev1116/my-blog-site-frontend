'use client';

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
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

const STORAGE_KEY = 'color-theme';

function ColorThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorTheme, changeColorTheme, removeColorTheme] =
    useLocalStorage<ColorTheme>(STORAGE_KEY);

  const value = useMemo(() => {
    return {
      colorTheme,
      changeColorTheme,
      removeColorTheme,
    };
  }, [colorTheme, changeColorTheme, removeColorTheme]);

  useEffect(() => {
    if (isDarkMode(colorTheme)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorTheme]);

  return (
    <ColorThemeContext.Provider value={value}>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ((localStorage['${STORAGE_KEY}'] !== undefined && JSON.parse(localStorage['${STORAGE_KEY}']) === 'dark') || (!('${STORAGE_KEY}' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          `,
        }}
      />
      {children}
    </ColorThemeContext.Provider>
  );
}

function useColorThemeStore() {
  return useContext(ColorThemeContext);
}

function isDarkMode(colorTheme: ColorTheme) {
  if (colorTheme === 'dark') {
    return true;
  }

  if (
    colorTheme === undefined &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return true;
  }

  return false;
}

export default ColorThemeContextProvider;
export { useColorThemeStore, isDarkMode };
