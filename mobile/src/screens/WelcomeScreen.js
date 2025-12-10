import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography, radius } from '../theme/theme';
import { Button } from '../components/Button';

export default function WelcomeScreen({ navigation }) {
  const { colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    navigation.replace('Home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primaryLight + '20' }]}>
            <Text style={styles.logoEmoji}>🚶‍♂️</Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Bem-vindo ao PassoAmigo!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Acompanhe suas caminhadas,{'\n'}
            registre suas atividades e{'\n'}
            alcance suas metas de exercício.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Rastreamento GPS preciso
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Estatísticas detalhadas
            </Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Metas e progresso
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Começar"
            onPress={handleGetStarted}
            size="large"
            accessibilityLabel="Botão para começar a usar o aplicativo"
            accessibilityHint="Inicia o aplicativo e leva para a tela principal"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 64,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'transparent',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 32,
  },
  featureText: {
    ...typography.body,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
});
