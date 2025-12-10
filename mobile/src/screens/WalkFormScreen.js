import React, { useEffect, useState } from 'react';
import { View, TextInput, ScrollView, Alert, Modal, Text, TouchableOpacity, FlatList } from 'react-native';
import { addWalk, updateWalk, removeWalk } from '../data/repository';
import { UsersRepo } from '../storage/storage';
import Toast from 'react-native-toast-message';
import { colors, spacing, typography, radius, shadows } from '../theme/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function WalkFormScreen({route,navigation}){
  const editing = route?.params?.walk;
  const [userId,setUserId]=useState(editing?editing.userId:'');
  const [distance,setDistance]=useState(editing?String(editing.distanceMeters):'');
  const [users,setUsers]=useState([]);
  const [pickerOpen,setPickerOpen]=useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const selectedUser = users.find(u=>u.id===userId);

  useEffect(()=>{
    navigation.setOptions({ title: editing?'Editar Caminhada':'Nova Caminhada' });
    (async()=>{ const list=await UsersRepo.list(); setUsers(list); const u=list[0]; if(u && !userId) setUserId(u.id); })();
  },[editing]);

  function validate() {
    const newErrors = {};
    
    if (!userId) {
      newErrors.userId = 'Selecione um usuário';
    }
    
    if (!distance || distance.trim().length === 0) {
      newErrors.distance = 'Distância é obrigatória';
    } else {
      const distanceNum = Number(distance.trim());
      if (isNaN(distanceNum)) {
        newErrors.distance = 'Distância deve ser um número';
      } else if (distanceNum < 0) {
        newErrors.distance = 'Distância não pode ser negativa';
      } else if (distanceNum > 1000000) {
        newErrors.distance = 'Distância muito grande (máximo: 1.000.000m)';
      }
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
      const walk = { 
        userId, 
        distanceMeters: Math.round(Number(distance.trim())),
        startTime: editing?.startTime || new Date().toISOString(),
        duration: editing?.duration,
        polyline: editing?.polyline || []
      };
      
      if(editing){ 
        await updateWalk(editing.id, walk); 
        Toast.show({type:'success', text1:'Caminhada atualizada'}); 
      }
      else { 
        await addWalk(walk); 
        Toast.show({type:'success', text1:'Caminhada criada'}); 
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
  async function remove(){
    if(!editing) return;
    Alert.alert(
      'Remover Caminhada',
      'Deseja excluir esta caminhada? Esta ação não pode ser desfeita.',
      [
        { text:'Cancelar', style:'cancel' },
        { 
          text:'Excluir', 
          style: 'destructive',
          onPress: async ()=>{ 
            try {
              setLoading(true);
              await removeWalk(editing.id); 
              Toast.show({type:'success', text1:'Caminhada excluída'}); 
              navigation.goBack(); 
            } catch (error) {
              Toast.show({type: 'error', text1: 'Erro ao excluir', text2: error.message});
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  }

  return (
    <ScrollView style={{flex:1, backgroundColor: colors.backgroundSecondary}}>
      <View style={{padding: spacing.md}}>
        <Card variant="elevated">
          <View style={{marginBottom: spacing.lg}}>
            <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.xs}]}>
              {editing ? '✏️ Editar Caminhada' : '➕ Nova Caminhada'}
            </Text>
            <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
              {editing ? 'Atualize as informações da caminhada' : 'Registre uma nova caminhada'}
            </Text>
          </View>

          <View style={{gap: spacing.lg}}>
            <View>
              <Text style={[typography.body, {color: colors.text, marginBottom: spacing.sm, fontWeight: '600'}]}>
                Usuário
              </Text>
              <TouchableOpacity 
                onPress={()=>{
                  setPickerOpen(true);
                  if (errors.userId) {
                    setErrors({...errors, userId: null});
                  }
                }}
                accessibilityLabel="Selecionar usuário"
                accessibilityHint="Toque para abrir lista de usuários e selecionar um usuário para associar à caminhada"
                accessibilityRole="button"
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.userId ? colors.danger : colors.border,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.background,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...shadows.small,
                }}
              >
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                  {selectedUser && (
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: radius.round,
                      backgroundColor: colors.primaryLight + '20',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: spacing.sm,
                    }}>
                      <Text style={{fontSize: 16}}>👤</Text>
                    </View>
                  )}
                  <View style={{flex: 1}}>
                    <Text style={[typography.body, {color: selectedUser ? colors.text : colors.textMuted, fontWeight: selectedUser ? '600' : '400'}]}>
                      {selectedUser?.name || 'Selecionar usuário'}
                    </Text>
                    {selectedUser && (
                      <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
                        {selectedUser.email}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={{color: colors.primary, fontSize: 18}}>▼</Text>
              </TouchableOpacity>
              {errors.userId && (
                <Text style={[typography.caption, {color: colors.danger, marginTop: spacing.xs}]}>
                  {errors.userId}
                </Text>
              )}
            </View>

            <View>
              <Text style={[typography.body, {color: colors.text, marginBottom: spacing.sm, fontWeight: '600'}]}>
                Distância (metros)
              </Text>
              <TextInput 
                placeholder="Ex: 1000" 
                placeholderTextColor={colors.textMuted}
                value={distance} 
                onChangeText={(text) => {
                  // Permitir apenas números e ponto decimal
                  const numericText = text.replace(/[^0-9.]/g, '');
                  setDistance(numericText);
                  if (errors.distance) {
                    setErrors({...errors, distance: null});
                  }
                }}
                keyboardType="numeric"
                accessibilityLabel="Campo de distância em metros"
                accessibilityHint="Digite a distância percorrida em metros. Deve ser um número positivo."
                accessibilityRole="text"
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.distance ? colors.danger : colors.border,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.background,
                  ...typography.body,
                  color: colors.text,
                  ...shadows.small,
                }}
              />
              {errors.distance && (
                <Text style={[typography.caption, {color: colors.danger, marginTop: spacing.xs}]}>
                  {errors.distance}
                </Text>
              )}
            </View>

            <View style={{gap: spacing.md}}>
              <Button 
                title={editing ? "Atualizar Caminhada" : "Criar Caminhada"} 
                onPress={save}
                loading={loading}
                size="large"
              />
              {editing && (
                <Button 
                  title="🗑️ Excluir Caminhada" 
                  onPress={remove}
                  variant="danger"
                  size="large"
                  loading={loading}
                />
              )}
            </View>
          </View>
        </Card>
      </View>

      <Modal visible={pickerOpen} transparent animationType="slide">
        <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center'}}>
          <View style={{margin: spacing.lg, backgroundColor: colors.background, borderRadius: radius.lg, maxHeight:'60%', ...shadows.large}}>
            <View style={{padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border}}>
              <Text style={[typography.h3, {color: colors.text}]}>Escolher usuário</Text>
            </View>
            <FlatList 
              data={users} 
              keyExtractor={i=>i.id}
              renderItem={({item})=> (
                <TouchableOpacity 
                  onPress={()=>{ setUserId(item.id); setPickerOpen(false); }} 
                  style={{
                    padding: spacing.md, 
                    borderBottomWidth: 1, 
                    borderBottomColor: colors.borderLight,
                    backgroundColor: userId === item.id ? colors.primaryLight + '20' : 'transparent',
                  }}
                >
                  <Text style={[typography.body, {color: colors.text, fontWeight: userId === item.id ? '600' : '400'}]}>
                    {item.name}
                  </Text>
                  <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
                    {item.email}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{padding: spacing.lg}}>
                  <Text style={[typography.body, {color: colors.textMuted, textAlign: 'center'}]}>
                    Nenhum usuário disponível
                  </Text>
                </View>
              }
            />
            <View style={{padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border}}>
              <Button title="Cancelar" onPress={()=>setPickerOpen(false)} variant="secondary" />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


