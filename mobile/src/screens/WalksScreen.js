import React, { useEffect, useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { listWalksByUser } from '../data/repository';
import { UsersRepo } from '../storage/storage';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius, shadows } from '../theme/theme';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/LoadingStates';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function WalksScreen(){
  const navigation=useNavigation();
  const [walks,setWalks]=useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('all');

  const [refreshing,setRefreshing]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  
  async function load(){
    try{
      setError('');
      setLoading(true);
      const usersList = await UsersRepo.list();
      setUsers(usersList);

      if (selectedUserId === 'all') {
        const aggregated = [];
        for (const user of usersList) {
          const list = await listWalksByUser(user.id);
          aggregated.push(...list.map(w => ({...w, userName: user.name, userAvatar: user.avatar})));
        }
        // mais recentes primeiro
        aggregated.sort((a,b)=> new Date(b.startTime||0) - new Date(a.startTime||0));
        setWalks(aggregated);
      } else {
        const userWalks = await listWalksByUser(selectedUserId);
        const userInfo = usersList.find(u => u.id === selectedUserId);
        setWalks(userWalks.map(w => ({...w, userName: userInfo?.name, userAvatar: userInfo?.avatar})));
      }
    }catch(e){ 
      setError(String(e.message||e)); 
      Toast.show({type: 'error', text1: 'Erro ao carregar caminhadas', text2: e.message});
    }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[selectedUserId]);
  
  // Recarrega quando a tela recebe foco (após salvar caminhada)
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
          title="Nova" 
          variant="ghost" 
          size="small"
          onPress={()=>navigation.navigate('WalkForm')}
        />
      )
    });
  },[navigation]);

  const totalDistance = useMemo(() => 
    walks.reduce((s,w)=>s+(w.distanceMeters||0),0), 
    [walks]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  if (loading && walks.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && walks.length === 0) {
    return <ErrorState onRetry={load} />;
  }

  return (
    <View style={{flex:1, backgroundColor: colors.backgroundSecondary}}>
      <View style={{padding: spacing.md, backgroundColor: colors.background, ...shadows.small}}>
        <Text style={[typography.bodySmall, {color: colors.textMuted, marginBottom: spacing.xs}]}>
          Filtrar por usuário
        </Text>
        <FlatList
          horizontal
          data={[{id:'all', name:'Todos', avatar:'🌐'}, ...users]}
          keyExtractor={item=>item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: spacing.sm}}
          renderItem={({item})=>(
            <TouchableOpacity
              onPress={()=>setSelectedUserId(item.id)}
              style={{
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: radius.round,
                borderWidth: 1.5,
                borderColor: selectedUserId===item.id ? colors.primary : colors.border,
                backgroundColor: selectedUserId===item.id ? colors.primaryLight + '20' : colors.background,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs
              }}
            >
              <Text style={{fontSize: 16}}>{item.avatar || '👤'}</Text>
              <Text style={[typography.bodySmall, {color: colors.text, fontWeight: '700'}]}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList 
        data={walks} 
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
              Total: {totalDistance} m ({walks.length} caminhada{walks.length !== 1 ? 's' : ''})
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState 
            title="Nenhuma caminhada registrada"
            subtitle="Comece uma nova caminhada para acompanhar seu progresso"
            icon="🚶‍♂️"
          />
        }
        renderItem={({item})=> (
          <WalkCard 
            item={item} 
            onPress={() => navigation.navigate('WalkForm', {walk: item})}
            onMapPress={() => {
              if (item.polyline && item.polyline.length >= 2) {
                navigation.navigate('WalkMap', { walk: item });
              } else {
                Toast.show({
                  type: 'info',
                  text1: 'Rota não disponível',
                  text2: 'Esta caminhada não possui dados de GPS salvos'
                });
              }
            }}
          />
        )}
      />
    </View>
  );
}

const WalkCard = React.memo(({ item, onPress, onMapPress }) => {
  return (
    <Card 
      onPress={onPress}
      style={{marginBottom: spacing.sm}}
      variant="elevated"
    >
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: radius.round,
            backgroundColor: colors.accentLight + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
          }}>
            <Text style={{fontSize: 18}}>🚶</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.xs}]}>
              {item.distanceMeters||0} m
            </Text>
            <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
              {item.startTime ? new Date(item.startTime).toLocaleString('pt-BR') : '-'}
            </Text>
            {item.userName && (
              <Text style={[typography.caption, {color: colors.textMuted, marginTop: spacing.xs}]}>
                👤 {item.userName}
              </Text>
            )}
          </View>
          {item.polyline && item.polyline.length >= 2 && (
            <Button
              title="Ver Rota"
              onPress={onMapPress}
              variant="secondary"
              size="small"
              style={{marginLeft: spacing.sm}}
            />
          )}
        </View>
      </Card>
  );
});


