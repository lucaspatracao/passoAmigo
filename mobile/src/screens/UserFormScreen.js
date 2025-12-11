import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { addUser, updateUser } from '../data/repository';
import Toast from 'react-native-toast-message';
import { colors, spacing, typography, radius, shadows } from '../theme/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function UserFormScreen({route,navigation}){
  const editing = route?.params?.user;
  const [name,setName]=useState(editing?editing.name:'');
  const [email,setEmail]=useState(editing?editing.email:'');
  const [avatar,setAvatar]=useState(editing?.avatar || '👤');
  const [dailyGoal,setDailyGoal]=useState(editing?.dailyGoalMeters ? String(editing.dailyGoalMeters) : '1000');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(()=>{ navigation.setOptions({ title: editing?'Editar Usuário':'Novo Usuário' }); },[editing]);

  const emojiOptions = useMemo(() => ['👤','🚶‍♂️','🚶‍♀️','🏃‍♂️','🏃‍♀️','🚴‍♂️','🚴‍♀️','🧘‍♂️','🧘‍♀️','⛰️','🌞','🌿'], []);

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validate() {
    const newErrors = {};
    
    if (!name || name.trim().length === 0) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (name.trim().length > 60) {
      newErrors.name = 'Nome deve ter no máximo 60 caracteres';
    }
    
    if (!email || email.trim().length === 0) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'E-mail inválido';
    }
    const goalValue = Number(dailyGoal.trim());
    if (dailyGoal.trim().length === 0 || Number.isNaN(goalValue)) {
      newErrors.dailyGoal = 'Meta diária deve ser um número';
    } else if (goalValue < 1) {
      newErrors.dailyGoal = 'Meta mínima é 1 metro';
    } else if (goalValue > 100000) {
      newErrors.dailyGoal = 'Meta muito alta (máx. 100.000m)';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function save(){
    if (!validate()) {
      return;
    }
    
    try{
      setLoading(true);
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar,
        dailyGoalMeters: Math.round(Number(dailyGoal.trim()))
      };
      
      if(editing){ 
        await updateUser(editing.id, userData); 
        Toast.show({type:'success', text1:'Usuário atualizado'}); 
      }
      else{ 
        await addUser(userData); 
        Toast.show({type:'success', text1:'Usuário criado'}); 
      }
      navigation.goBack();
    }catch(e){ 
      let errorMessage = 'Erro ao salvar';
      if (e.message) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      Toast.show({type:'error', text1:'Erro ao salvar', text2: errorMessage}); 
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{flex:1, backgroundColor: colors.backgroundSecondary}}>
      <View style={{padding: spacing.md}}>
        <Card variant="elevated">
          <View style={{marginBottom: spacing.lg}}>
            <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.xs}]}>
              {editing ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
            </Text>
            <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
              {editing ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário'}
            </Text>
          </View>

          <View style={{gap: spacing.lg}}>
            <View>
              <Text style={[typography.body, {color: colors.text, marginBottom: spacing.sm, fontWeight: '600'}]}>
                Nome
              </Text>
              <TextInput 
                placeholder="Nome completo" 
                placeholderTextColor={colors.textMuted}
                value={name} 
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) {
                    setErrors({...errors, name: null});
                  }
                }}
                accessibilityLabel="Campo de nome do usuário"
                accessibilityHint="Digite o nome completo do usuário. Deve ter entre 2 e 60 caracteres."
                accessibilityRole="text"
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.name ? colors.danger : colors.border,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.background,
                  ...typography.body,
                  color: colors.text,
                  ...shadows.small,
                }}
              />
              {errors.name && (
                <Text style={[typography.caption, {color: colors.danger, marginTop: spacing.xs}]}>
                  {errors.name}
                </Text>
              )}
            </View>

            <View>
              <Text style={[typography.body, {color: colors.text, marginBottom: spacing.sm, fontWeight: '600'}]}>
                E-mail
              </Text>
              <TextInput 
                placeholder="email@exemplo.com" 
                placeholderTextColor={colors.textMuted}
                value={email} 
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({...errors, email: null});
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Campo de e-mail do usuário"
                accessibilityHint="Digite o endereço de e-mail válido do usuário."
                accessibilityRole="text"
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.email ? colors.danger : colors.border,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.background,
                  ...typography.body,
                  color: colors.text,
                  ...shadows.small,
                }}
              />
              {errors.email && (
                <Text style={[typography.caption, {color: colors.danger, marginTop: spacing.xs}]}>
                  {errors.email}
                </Text>
              )}
            </View>

            <View>
              <Text style={[typography.body, {color: colors.text, marginBottom: spacing.sm, fontWeight: '600'}]}>
                Avatar
              </Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm}}>
                {emojiOptions.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setAvatar(emoji)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: radius.md,
                      borderWidth: avatar === emoji ? 2 : 1.5,
                      borderColor: avatar === emoji ? colors.primary : colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.background,
                      ...shadows.small,
                    }}
                    accessibilityLabel={`Selecionar avatar ${emoji}`}
                    accessibilityRole="button"
                  >
                    <Text style={{fontSize: 24}}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={[typography.body, {color: colors.text, marginBottom: spacing.sm, fontWeight: '600'}]}>
                Meta diária (metros)
              </Text>
              <TextInput 
                placeholder="Ex: 1000" 
                placeholderTextColor={colors.textMuted}
                value={dailyGoal} 
                onChangeText={(text) => {
                  const numeric = text.replace(/[^0-9]/g,'');
                  setDailyGoal(numeric);
                  if (errors.dailyGoal) {
                    setErrors({...errors, dailyGoal: null});
                  }
                }}
                keyboardType="numeric"
                accessibilityLabel="Campo de meta diária"
                accessibilityHint="Informe a meta diária de distância em metros"
                accessibilityRole="text"
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.dailyGoal ? colors.danger : colors.border,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.background,
                  ...typography.body,
                  color: colors.text,
                  ...shadows.small,
                }}
              />
              {errors.dailyGoal && (
                <Text style={[typography.caption, {color: colors.danger, marginTop: spacing.xs}]}>
                  {errors.dailyGoal}
                </Text>
              )}
            </View>

            <Button 
              title={editing ? "Atualizar Usuário" : "Criar Usuário"} 
              onPress={save}
              loading={loading}
              size="large"
              accessibilityLabel={editing ? "Botão para atualizar usuário" : "Botão para criar novo usuário"}
              accessibilityHint={editing ? "Salva as alterações feitas no usuário" : "Cria um novo usuário com os dados informados"}
              accessibilityRole="button"
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}


