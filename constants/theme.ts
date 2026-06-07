export const colors = {
  // Fundos — escuro mas com hierarquia visível
  bg: '#060C18',
  surface: '#0A1628',
  card: '#0F1E35',
  cardAlt: '#152440',

  // Bordas
  border: '#1A334F',
  borderLight: '#224060',

  // Marca
  primary: '#3D80FF',
  primaryLight: '#6FA0FF',
  primaryDark: '#1C60E0',

  // Semântico
  success: '#10BA80',
  warning: '#F5A020',
  danger: '#E84545',

  // Texto
  textPrimary: '#EBF2FF',
  textSecondary: '#7896B8',
  textMuted: '#3D5870',

  // Especial
  gold: '#FFB500',
  cyan: '#00D0ED',
  purple: '#7B52D4',

  // Tab bar
  tabBg: '#0A1628',
  tabBorder: '#1A334F',
  tabActive: '#3D80FF',
  tabInactive: '#3D5870',

  // Form
  inputBg: '#0E1C30',
  inputBorder: '#1A334F',
  placeholder: '#3D5870',

  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 100,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
} as const;

// Status de reserva → cor
export const statusColor: Record<string, string> = {
  PENDENTE: '#F5A020',
  CONFIRMADO: '#10BA80',
  EM_MISSAO: '#3D80FF',
  CONCLUIDO: '#7B52D4',
  CANCELADO: '#E84545',
};

export const statusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmada',
  EM_MISSAO: 'Em Missão',
  CONCLUIDO: 'Concluída',
  CANCELADO: 'Cancelada',
};
