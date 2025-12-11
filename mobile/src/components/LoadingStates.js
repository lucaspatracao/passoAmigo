import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

export function LoadingSpinner({ size = 'large', color = colors.primary, style }) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

export function EmptyState({ 
  title = 'Nenhum item encontrado', 
  subtitle = 'Tente adicionar um novo item ou verificar sua conexão.',
  icon = '📭',
  style 
}) {
  return (
    <View style={[styles.center, styles.emptyState, style]}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[typography.h3, styles.emptyTitle]}>{title}</Text>
      <Text style={[typography.bodySmall, styles.emptySubtitle]}>{subtitle}</Text>
    </View>
  );
}

export function ErrorState({ 
  title = 'Ops! Algo deu errado', 
  subtitle = 'Não foi possível carregar os dados. Tente novamente.',
  onRetry,
  style 
}) {
  return (
    <View style={[styles.center, styles.errorState, style]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={[typography.h3, styles.errorTitle]}>{title}</Text>
      <Text style={[typography.bodySmall, styles.errorSubtitle]}>{subtitle}</Text>
      {onRetry && (
        <Text style={[typography.button, styles.retryButton]} onPress={onRetry}>
          Tentar novamente
        </Text>
      )}
    </View>
  );
}

export function InlineLoading({ loading, children, style }) {
  if (loading) {
    return (
      <View style={[styles.inlineLoading, style]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[typography.bodySmall, styles.loadingText]}>Carregando...</Text>
      </View>
    );
  }
  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorState: {
    paddingVertical: spacing.xxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorTitle: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  retryButton: {
    color: colors.primary,
    textDecorationLine: 'underline',
    marginTop: spacing.md,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  loadingText: {
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
});
