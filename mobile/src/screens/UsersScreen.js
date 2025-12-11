import React, { useEffect, useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import { listUsers } from '../data/repository';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius, shadows } from '../theme/theme';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/LoadingStates';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function UsersScreen(){
  const navigation = useNavigation();
  const [users,setUsers]=useState([]);

  const [refreshing,setRefreshing]=useState(false);
  const [query,setQuery]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  
  async function load(){
    try{
      setError('');
      setLoading(true);
      const data = await listUsers();
      setUsers(data);
    }catch(e){ 
      setError(String(e.message||e)); 
      Toast.show({type: 'error', text1: 'Erro ao carregar usuários', text2: e.message});
    }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  // Recarrega quando a tela recebe foco (após criar/editar usuário)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation]);

  useLayoutEffect(()=>{
    navigation.setOptions({
      headerRight:()=> (
        <Button 
          title="Novo" 
          variant="ghost" 
          size="small"
          onPress={()=>navigation.navigate('UserForm')}
        />
      )
    });
  },[navigation]);

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const lowerQuery = query.toLowerCase();
    return users.filter(u => 
      u.name?.toLowerCase().includes(lowerQuery) || 
      u.email?.toLowerCase().includes(lowerQuery)
    );
  }, [users, query]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  const UserCard = React.memo(({ item, onPress }) => {
    return (
      <Card 
        onPress={onPress}
        style={{marginBottom: spacing.sm}}
        variant="elevated"
      >
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs}}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: radius.round,
              backgroundColor: colors.primaryLight + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing.md,
            }}>
              <Text style={{fontSize: 18}}>{item.avatar || '👤'}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.xs}]}>
                {item.name}
              </Text>
              <Text style={[typography.bodySmall, {color: colors.textMuted, marginBottom: spacing.xs}]}>
                {item.email}
              </Text>
              <Text style={[typography.caption, {color: colors.textMuted}]}>
                Meta diária: {item.dailyGoalMeters || 1000}m
              </Text>
            </View>
          </View>
        </Card>
    );
  });

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && users.length === 0) {
    return <ErrorState onRetry={load} />;
  }

  return (
    <View style={{flex:1, backgroundColor: colors.backgroundSecondary}}>
      <View style={{padding: spacing.md, backgroundColor: colors.background, ...shadows.small, gap: spacing.md}}>
        <TextInput 
          placeholder="Buscar usuários..." 
          placeholderTextColor={colors.textMuted}
          value={query} 
          onChangeText={setQuery}
          accessibilityLabel="Campo de busca de usuários"
          accessibilityHint="Digite o nome ou e-mail do usuário para filtrar a lista"
          accessibilityRole="search"
          style={{
            borderWidth: 1.5,
            borderColor: colors.border,
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.background,
            ...typography.body,
            color: colors.text,
          }}
        />
        <Button 
          title="➕ Novo Usuário" 
          onPress={() => navigation.navigate('UserForm')}
          size="medium"
        />
      </View>
      
      <FlatList 
        data={filtered} 
        keyExtractor={item=>item.id}
        contentContainerStyle={{padding: spacing.md}}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
          />
        }
        ListHeaderComponent={
          <View style={{marginBottom: spacing.md}}>
            <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
              Total: {filtered.length} usuário{filtered.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState 
            title="Nenhum usuário encontrado"
            subtitle={query ? "Tente ajustar sua busca" : "Adicione seu primeiro usuário"}
            icon="👥"
          />
        }
        renderItem={({item})=> (
          <UserCard 
            item={item} 
            onPress={() => navigation.navigate('UserDetail', {user: item})}
          />
        )}
      />
    </View>
  );
}


