import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { typography, spacing, radius } from '../theme/theme';

export function LogoHeader() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logoText, { color: colors.primary }]}>
        PassoAmigo
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Tutorial')}
        style={[styles.tutorialButton, { 
          backgroundColor: colors.primaryLight + '30',
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderWidth: 1.5,
          borderColor: colors.primaryLight + '50',
        }]}
        accessibilityLabel="Abrir tutorial do aplicativo"
        accessibilityHint="Mostra instruções de como usar o aplicativo"
        accessibilityRole="button"
      >
        <Text style={[styles.tutorialText, { color: colors.primary, marginRight: spacing.xs }]}>
          📚
        </Text>
        <Text style={[styles.tutorialLabel, { color: colors.primary }]}>
          Ajuda
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 75,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 12,
    paddingBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialText: {
    fontSize: 20,
  },
  tutorialLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});
