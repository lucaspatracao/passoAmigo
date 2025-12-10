export const colors = {
  // Primary colors - Gradiente moderno azul/verde (identidade única)
  primary: '#4A90E2',           // Azul vibrante principal
  primaryLight: '#6BA3E8',       // Azul claro para hover
  primaryDark: '#357ABD',        // Azul escuro para press
  primaryGradient: ['#4A90E2', '#5FB3D3'], // Gradiente para botões
  
  // Accent colors - Verde complementar (harmonia)
  accent: '#50C878',             // Verde esmeralda
  accentLight: '#6FD892',
  accentDark: '#3FA865',
  
  // Background colors - Tons suaves e modernos
  background: '#FFFFFF',
  backgroundSecondary: '#F5F7FA',  // Mais suave e moderno
  surface: '#FAFBFC',                // Superfície sutil
  surfaceElevated: '#FFFFFF',
  
  // Text colors - Hierarquia clara
  text: '#1A1D29',              // Preto suave (mais moderno)
  textSecondary: '#5A5F73',     // Cinza médio
  textMuted: '#8B92A7',         // Cinza claro
  textLight: '#B8BCC8',         // Cinza muito claro
  
  // Status colors - Mais vibrantes e modernos
  success: '#10B981',           // Verde sucesso moderno
  successLight: '#34D399',
  warning: '#F59E0B',          // Laranja/amarelo moderno
  warningLight: '#FBBF24',
  danger: '#EF4444',            // Vermelho moderno
  dangerLight: '#F87171',
  info: '#3B82F6',             // Azul info moderno
  infoLight: '#60A5FA',
  
  // UI colors - Bordas e sombras mais sutis
  border: '#E1E5E9',            // Borda mais suave
  borderLight: '#F0F2F5',      // Borda muito clara
  shadow: 'rgba(26, 29, 41, 0.08)',  // Sombra mais sutil e moderna
  
  // Gradientes para uso em componentes
  gradients: {
    primary: ['#4A90E2', '#5FB3D3'],
    success: ['#10B981', '#34D399'],
    accent: ['#50C878', '#6FD892'],
    warm: ['#F59E0B', '#FBBF24'],
  },
  
  // Dark theme (for future use)
  dark: {
    background: '#1A1D29',
    surface: '#252836',
    text: '#FFFFFF',
    textSecondary: '#8B92A7',
    border: '#2D3142',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 50
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  }
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  // Sombra extra suave para cards elevados
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  }
};


