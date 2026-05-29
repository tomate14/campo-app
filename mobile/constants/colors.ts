/* Premium SaaS color system - Campo App */
const premium = {
  primary: '#9FE870',
  primaryForeground: '#081225',
  secondary: '#6EA8FF',
  accent: '#FFB84D',
  background: '#081225',
  foreground: '#F8FBFF',
  muted: '#17243D',
  mutedForeground: '#95A8C4',
  border: 'rgba(110, 168, 255, 0.16)',
  destructive: '#FF6B6B',
  card: '#0B1730',
  cardBorder: 'rgba(110, 168, 255, 0.16)',
  sidebar: '#06101F',
  success: '#9FE870',
  gps: '#6EA8FF',
  agricultura: '#9FE870',
  ganaderia: '#6EA8FF',
  orange: '#FFB84D',
  danger: '#FF6B6B',
  glass: 'rgba(11, 23, 48, 0.72)',
  glassStrong: 'rgba(11, 23, 48, 0.92)',
} as const

export const Colors = {
  light: premium,
  dark: premium,
} as const

export type ColorScheme = typeof Colors.light
