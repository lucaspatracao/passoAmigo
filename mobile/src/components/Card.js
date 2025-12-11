import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/theme';

export function Card({ 
  children, 
  style, 
  variant = 'default',
  onPress,
  ...props 
}) {
  const { colors, shadows } = useTheme();
  const styles = createStyles(colors, shadows);
  const cardStyle = [
    styles.base,
    styles[variant],
    onPress && styles.pressable,
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }) {
  const { colors, shadows } = useTheme();
  const styles = createStyles(colors, shadows);
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ children, style, ...props }) {
  const { colors, shadows } = useTheme();
  const styles = createStyles(colors, shadows);
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style, ...props }) {
  const { colors, shadows } = useTheme();
  const styles = createStyles(colors, shadows);
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

const createStyles = (colors, shadows) => StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    ...(shadows?.card || shadows?.small || {}),
  },
  
  // Variants
  default: {
    padding: spacing.md,
  },
  elevated: {
    padding: spacing.lg,
    ...shadows.medium,
  },
  outlined: {
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...(shadows?.card || shadows?.small || {}),
  },
  
  // Pressable state
  pressable: {
    // Cards pressáveis têm feedback visual via activeOpacity
  },
  
  // Card sections
  header: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.sm,
  },
});
