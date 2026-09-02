import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { resolveSystemAppearance } from '../theme/appearance';
import { activateTheme, createTheme, type AppTheme } from '../theme/theme';

interface ThemeContextValue {
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Keeps the app palette synchronized with the device appearance setting. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemAppearance = useColorScheme();
  const resolvedAppearance = resolveSystemAppearance(systemAppearance);
  const theme = useMemo(() => createTheme(resolvedAppearance), [resolvedAppearance]);

  activateTheme(theme);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used within ThemeProvider');
  return value;
}
