import React, { useEffect, useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { listUsers, removeUser } from '../data/repository';
import { confirm } from '../components/ConfirmDialog';
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
  const [actionLoading, setActionLoading] = useState(null); // Para loading de ações específicas
  
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

  const handleDelete = useCallback(async (userId) => {
    const user = users.find(u => u.id === userId);
    const confirmed = await confirm({
      title: 'Excluir Usuário',
      message: `Deseja realmente excluir "${user?.name || 'este usuário'}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
    
    if (!confirmed) return;

    try {
      setActionLoading(userId);
      await removeUser(userId);
      Toast.show({type:'success', text1:'Usuário excluído com sucesso!'});
      await load(); // Refresh automático após exclusão
    } catch (error) {
      Toast.show({type: 'error', text1: 'Erro ao excluir usuário', text2: error.message});
    } finally {
      setActionLoading(null);
    }
  }, [users]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  const RightActions = ({ userId, loading }) => (
    <View style={{justifyContent:'center', alignItems:'flex-end', backgroundColor: colors.dangerLight + '20'}}>
      <TouchableOpacity 
        onPress={() => handleDelete(userId)} 
        disabled={loading}
        style={{
          backgroundColor: loading ? colors.textMuted : colors.danger, 
          paddingVertical:20, 
          paddingHorizontal:16,
          opacity: loading ? 0.6 : 1,
          borderRadius: radius.sm,
          marginRight: spacing.sm,
          ...shadows.small,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <Text style={{color: colors.background, fontWeight:'700', fontSize: 14}}>Excluir</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const UserCard = React.memo(({ item, onPress, onDelete, actionLoading }) => {
    return (
      <Swipeable renderRightActions={() => <RightActions userId={item.id} loading={actionLoading} />}>
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
      </Swipeable>
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
            onDelete={() => handleDelete(item.id)}
            actionLoading={actionLoading === item.id}
          />
        )}
      />
    </View>
  );
}


