import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography, radius, shadows } from '../theme/theme';
import { loadSettings, saveSettings } from '../storage/settings';
import { invalidateConfigCache } from '../api/api';
import { exportToCSV, exportToJSON } from '../utils/export';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function SettingsScreen(){
  const { colors } = useTheme();
  const initial = (Constants?.expoConfig?.extra) || {};
  const [baseUrl,setBaseUrl]=useState(initial.apiBaseUrl||'http://10.0.2.2:8080');
  const [useBackend, setUseBackend] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(()=>{ (async()=>{
    const stored = await loadSettings();
    if(stored.apiBaseUrl) setBaseUrl(stored.apiBaseUrl);
    if(typeof stored.useBackend === 'boolean') setUseBackend(stored.useBackend);
  })(); },[]);

  async function apply(){
    try {
      await saveSettings({ apiBaseUrl: baseUrl, useBackend: useBackend });
      invalidateConfigCache(); // Limpa cache para aplicar mudanças imediatamente
      Alert.alert('Configurações salvas','As configurações foram aplicadas com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar configurações: ' + error.message);
    }
  }

  async function handleExportCSV() {
    try {
      setExporting(true);
      const result = await exportToCSV();
      Toast.show({
        type: 'success',
        text1: 'Exportação concluída!',
        text2: result.message
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao exportar',
        text2: error.message
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleExportJSON() {
    try {
      setExporting(true);
      const result = await exportToJSON();
      Toast.show({
        type: 'success',
        text1: 'Exportação concluída!',
        text2: result.message
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao exportar',
        text2: error.message
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView style={{flex:1, backgroundColor: colors.backgroundSecondary}}>
      <View style={{padding: spacing.md}}>
        <Card variant="elevated" style={{marginBottom: spacing.lg}}>
          <Text style={[typography.h2, {color: colors.text, marginBottom: spacing.lg}]}>
            ⚙️ Configurações de Conexão
          </Text>
          
          <View style={{marginBottom: spacing.lg, padding: spacing.md, backgroundColor: colors.primaryLight + '10', borderRadius: radius.md}}>
            <Text style={[typography.body, {color: colors.text, fontWeight: '600', marginBottom: spacing.xs}]}>
              💾 Onde salvar seus dados?
            </Text>
            <Text style={[typography.bodySmall, {color: colors.textMuted, lineHeight: 20}]}>
              Por padrão, seus dados são salvos apenas no seu celular. Se você quiser salvar na nuvem e acessar de outros dispositivos, ative a opção "Usar Backend" abaixo e configure o endereço do servidor.
            </Text>
          </View>

          <View style={{marginBottom: spacing.lg}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm}}>
              <View style={{flex: 1}}>
                <Text style={[typography.body, {color: colors.text, fontWeight: '600'}]}>
                  Usar Backend
                </Text>
                <Text style={[typography.bodySmall, {color: colors.textMuted, marginTop: spacing.xs}]}>
                  {useBackend 
                    ? 'Seus dados serão salvos na nuvem e poderão ser acessados de outros dispositivos' 
                    : 'Seus dados serão salvos apenas no seu celular'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setUseBackend(!useBackend)}
                accessibilityLabel={useBackend ? "Desativar uso de backend" : "Ativar uso de backend"}
                accessibilityHint={useBackend ? "Desativa o uso do backend e usa armazenamento local" : "Ativa o uso do backend para salvar dados na nuvem"}
                accessibilityRole="switch"
                accessibilityState={{ checked: useBackend }}
                style={{
                  width: 50,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: useBackend ? colors.success : colors.border,
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                }}
              >
                <View style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: colors.background,
                  alignSelf: useBackend ? 'flex-end' : 'flex-start',
                }} />
              </TouchableOpacity>
            </View>
          </View>

          {useBackend && (
            <View style={{marginBottom: spacing.lg}}>
              <Text style={[typography.body, {color: colors.text, marginBottom: spacing.sm, fontWeight: '600'}]}>
                API Base URL
              </Text>
              <TextInput 
                value={baseUrl} 
                onChangeText={setBaseUrl}
                placeholder="http://10.0.2.2:8080"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Campo de URL da API do backend"
                accessibilityHint="Digite a URL base da API do backend"
                accessibilityRole="text"
                style={{
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.background,
                  ...typography.body,
                  color: colors.text,
                  ...shadows.small,
                }}
              />
              <View style={{marginTop: spacing.sm, gap: spacing.xs}}>
                <Text style={[typography.caption, {color: colors.textMuted, lineHeight: 18}]}>
                  📱 <Text style={{fontWeight: '600'}}>Testando no computador:</Text> Use http://10.0.2.2:8080
                </Text>
                <Text style={[typography.caption, {color: colors.textMuted, lineHeight: 18}]}>
                  📱 <Text style={{fontWeight: '600'}}>Usando no celular ou APK:</Text> Use o endereço IP do seu computador (ex: http://192.168.1.100:8080)
                </Text>
                <Text style={[typography.caption, {color: colors.textMuted, lineHeight: 18}]}>
                  💡 <Text style={{fontWeight: '600'}}>Como descobrir o IP:</Text> No Windows, abra o Prompt de Comando e digite "ipconfig". Procure por "IPv4" na seção da sua conexão Wi-Fi.
                </Text>
              </View>
            </View>
          )}

          <Button 
            title="Aplicar Configurações" 
            onPress={apply}
            style={{marginBottom: spacing.lg}}
            disabled={useBackend && !baseUrl.trim()}
            accessibilityLabel="Aplicar configurações de conexão"
            accessibilityHint="Salva e aplica as configurações de backend e URL da API"
          />
        </Card>

        {/* Exportação */}
        <Card variant="elevated" style={{marginBottom: spacing.lg}}>
          <Text style={[typography.h2, {color: colors.text, marginBottom: spacing.lg}]}>
            📤 Exportar Dados
          </Text>
          
          <View style={{gap: spacing.md}}>
            <Button 
              title="📄 Exportar CSV" 
              onPress={handleExportCSV}
              disabled={exporting}
              variant="secondary"
              accessibilityLabel="Exportar dados em formato CSV"
              accessibilityHint="Copia os dados de usuários e caminhadas em formato CSV para a área de transferência"
            />
            <Button 
              title="📋 Exportar JSON" 
              onPress={handleExportJSON}
              disabled={exporting}
              variant="secondary"
              accessibilityLabel="Exportar dados em formato JSON"
              accessibilityHint="Copia os dados completos incluindo rotas GPS em formato JSON para a área de transferência"
            />
            <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
              Os dados serão copiados para a área de transferência. Cole em um editor de texto e salve como arquivo.
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}


