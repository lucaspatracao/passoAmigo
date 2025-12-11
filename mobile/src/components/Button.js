import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius, typography } from '../theme/theme';

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props 
}) {
  const { colors, shadows } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [loading]);

  const styles = createStyles(colors, shadows);
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    { transform: [{ scale: scaleAnim }] },
    style
  ];

  const buttonTextStyle = [
    typography.button,
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || title}
      accessibilityHint={props.accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.background : colors.primary} 
        />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function IconButton({ 
  icon, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  ...props 
}) {
  const { colors, shadows } = useTheme();
  const styles = createStyles(colors, shadows);
  const buttonStyle = [
    styles.base,
    styles.iconButton,
    styles[variant],
    styles[`${size}Icon`],
    disabled && styles.disabled,
    style
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.background : colors.primary} 
        />
      ) : (
        <Text style={styles.iconText}>{icon}</Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors, shadows) => StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
    overflow: 'hidden',
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Sizes
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 52,
  },
  
  // Icon button sizes
  smallIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
  },
  mediumIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
  },
  largeIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.round,
  },
  
  // Text styles
  text: {
    textAlign: 'center',
  },
  primaryText: {
    color: colors.background,
  },
  secondaryText: {
    color: colors.text,
  },
  dangerText: {
    color: colors.background,
  },
  ghostText: {
    color: colors.primary,
  },
  
  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Icon text
  iconText: {
    fontSize: 20,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  
  // Icon button base
  iconButton: {
    ...shadows.small,
  },
});

// Exportar função para criar estilos dinâmicos
export function useButtonStyles() {
  const { colors, shadows } = useTheme();
  return createStyles(colors, shadows);
}
