/* Sistema de colores — ui-ux-pro-max-skill (Enterprise SaaS) */
export const Colors = {
  light: {
    primary:           '#2563EB',
    primaryForeground: '#FFFFFF',
    secondary:         '#3B82F6',
    accent:            '#F97316',
    background:        '#F8FAFC',
    foreground:        '#1E293B',
    muted:             '#94A3B8',
    mutedForeground:   '#64748B',
    border:            '#E2E8F0',
    destructive:       '#EF4444',
    card:              '#FFFFFF',
    cardBorder:        '#E2E8F0',
  },
  dark: {
    primary:           '#3B82F6',
    primaryForeground: '#020203',
    secondary:         '#1E293B',
    accent:            '#F97316',
    background:        '#020203',
    foreground:        '#EDEDEF',
    muted:             '#475569',
    mutedForeground:   '#94A3B8',
    border:            '#334155',
    destructive:       '#EF4444',
    card:              '#0F172A',
    cardBorder:        '#1E293B',
  },
} as const

export type ColorScheme = typeof Colors.light
