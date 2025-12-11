import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography, radius, shadows } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const { width } = Dimensions.get('window');

export default function TutorialScreen({ navigation }) {
  const { colors } = useTheme();

  const steps = [
    {
      icon: '👤',
      title: '1. Criar Usuários',
      description: 'Vá para a aba "Usuários" e clique em "Novo Usuário" para criar perfis. Cada usuário pode ter suas próprias caminhadas registradas.',
    },
    {
      icon: '🚶‍♂️',
      title: '2. Visualizar Caminhadas',
      description: 'Na aba "Caminhadas", você pode visualizar todas as caminhadas registradas. Para criar novas caminhadas, use a aba "Atividade" para rastrear com GPS em tempo real.',
    },
    {
      icon: '📍',
      title: '3. Usar GPS Tracking',
      description: 'Na aba "Atividade", selecione um usuário, permita acesso à localização e clique em "Iniciar Caminhada". O app calculará a distância automaticamente.',
    },
    {
      icon: '📊',
      title: '4. Ver Dashboard',
      description: 'A aba "Dashboard" mostra suas estatísticas: distância hoje, esta semana, total geral, gráfico semanal e progresso das metas.',
    },
    {
      icon: '🗺️',
      title: '5. Ver Rotas no Mapa',
      description: 'Caminhadas registradas com GPS podem ser visualizadas no mapa. Toque no ícone de mapa em uma caminhada para ver a rota completa.',
    },
    {
      icon: '📤',
      title: '6. Exportar Dados',
      description: 'Na aba "Configurações", você pode exportar seus dados em CSV ou JSON. Os dados serão copiados para a área de transferência.',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            📚 Tutorial
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Aprenda a usar o PassoAmigo
          </Text>
        </View>

        {steps.map((step, index) => (
          <Card key={index} variant="elevated" style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                <Text style={styles.icon}>{step.icon}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {step.title}
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: colors.textMuted }]}>
              {step.description}
            </Text>
          </Card>
        ))}

        <Card variant="elevated" style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            💡 Dicas
          </Text>
          <View style={styles.tipsList}>
            <Text style={[styles.tip, { color: colors.textMuted }]}>
              • Mantenha o app aberto durante caminhadas com GPS
            </Text>
            <Text style={[styles.tip, { color: colors.textMuted }]}>
              • Exporte seus dados regularmente para backup
            </Text>
            <Text style={[styles.tip, { color: colors.textMuted }]}>
              • A meta diária padrão é de 1000 metros
            </Text>
            <Text style={[styles.tip, { color: colors.textMuted }]}>
              • Configure o backend nas Configurações para salvar dados na nuvem
            </Text>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Entendi, vamos começar!"
            onPress={() => navigation.goBack()}
            size="large"
            accessibilityLabel="Botão para fechar o tutorial"
            accessibilityHint="Fecha a tela de tutorial e volta para a tela anterior"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
  },
  stepCard: {
    marginBottom: spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  stepTitle: {
    ...typography.h3,
    flex: 1,
  },
  stepDescription: {
    ...typography.body,
    lineHeight: 22,
  },
  tipsCard: {
    marginTop: spacing.md,
  },
  tipsTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tip: {
    ...typography.body,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
