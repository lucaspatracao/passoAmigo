import React, { useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { UsersRepo } from '../storage/storage';
import { colors, spacing, typography, radius, shadows } from '../theme/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import Toast from 'react-native-toast-message';
import { confirm } from '../components/ConfirmDialog';

export default function UserDetailScreen({ route, navigation }){
  const user = route?.params?.user;
  const [loading, setLoading] = useState(false);

  useLayoutEffect(()=>{
    navigation.setOptions({ title: user?.name || 'Detalhes do Usuário' });
  },[user]);

  if(!user){
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center', backgroundColor: colors.backgroundSecondary}}>
        <Text style={[typography.body, {color: colors.textMuted}]}>Usuário não encontrado.</Text>
      </View>
    );
  }

  async function handleDelete(){
    const confirmed = await confirm({
      title: 'Remover Usuário',
      message: `Deseja excluir "${user.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      await UsersRepo.remove(user.id); 
      Toast.show({type: 'success', text1: 'Usuário excluído com sucesso!'});
      navigation.goBack(); 
    } catch (error) {
      Toast.show({type: 'error', text1: 'Erro ao excluir usuário', text2: error.message});
    } finally {
      setLoading(false);
    }
  }

  const avatarIcon = user.avatar || '👤';

  return (
    <ScrollView style={{flex:1, backgroundColor: colors.backgroundSecondary}}>
      <View style={{padding: spacing.md}}>
        <Card variant="elevated" style={{marginBottom: spacing.lg}}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg}}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: radius.round,
              backgroundColor: colors.primaryLight + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing.md,
            }}>
              <Text style={{fontSize: 32}}>{avatarIcon}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[typography.h2, {color: colors.text, marginBottom: spacing.xs}]}>
                {user.name}
              </Text>
              <Text style={[typography.bodySmall, {color: colors.textMuted, marginBottom: spacing.xs}]}>
                {user.email}
              </Text>
              <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
                Meta diária: {user.dailyGoalMeters || 1000}m
              </Text>
            </View>
          </View>
        </Card>

        <View style={{gap: spacing.md}}>
          <Button 
            title="✏️ Editar Usuário" 
            onPress={()=> navigation.navigate('UserForm',{ user })} 
            variant="secondary"
            size="large"
          />
          <Button 
            title="🗑️ Excluir Usuário" 
            onPress={handleDelete}
            variant="danger"
            size="large"
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
}


