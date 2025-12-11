import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Dimensions, RefreshControl, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { listUsers, updateUser, listWalksByUser } from '../data/repository';
import { spacing, radius, typography, shadows } from '../theme/theme';
import { Card } from '../components/Card';
import { notifyGoalReached } from '../utils/notifications';

const StatCard = React.memo(({ title, value, subtitle, icon, color }) => {
  const { colors: themeColors } = useTheme();
  const finalColor = color || themeColors.primary;
  
  const formatDistance = useCallback((meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  }, []);

  return (
    <Card style={{flex: 1}} variant="elevated">
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          backgroundColor: finalColor + '15',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.md,
        }}>
          <Text style={{fontSize: 24}}>{icon}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={[typography.bodySmall, {color: themeColors.textMuted, marginBottom: spacing.xs}]}>{title}</Text>
          <Text style={[typography.h2, {color: finalColor, fontWeight: '700'}]}>{formatDistance(value)}</Text>
          {subtitle && (
            <Text style={[typography.caption, {color: themeColors.textMuted, marginTop: spacing.xs}]}>{subtitle}</Text>
          )}
        </View>
      </View>
    </Card>
  );
});

export default function DashboardScreen(){
  const { colors } = useTheme();
  const [total,setTotal]=useState(0);
  const [today,setToday]=useState(0);
  const [week,setWeek]=useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [goalNotified, setGoalNotified] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [goalInput, setGoalInput] = useState('1000');
  const [savingGoal, setSavingGoal] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const usersList = await listUsers();
      setUsers(usersList);

      const currentUserId = selectedUserId || usersList[0]?.id || null;
      if (!selectedUserId && currentUserId) {
        setSelectedUserId(currentUserId);
      }

      if (!currentUserId) {
        setTotal(0); setToday(0); setWeek(0); setWeeklyData([]);
        return;
      }

      const currentUser = usersList.find(u => u.id === currentUserId);
      if (currentUser?.dailyGoalMeters) {
        setGoalInput(String(currentUser.dailyGoalMeters));
      }

      const userWalks = await listWalksByUser(currentUserId);

      const sum = (arr)=> arr.reduce((s,w)=> s + (w.distanceMeters||0), 0);

      setTotal(sum(userWalks));

      const startOfDay = new Date(); 
      startOfDay.setHours(0,0,0,0);
      const todayList = userWalks.filter(w=> w.startTime ? new Date(w.startTime) >= startOfDay : false);
      setToday(sum(todayList));

      const startOfWeek = new Date();
      const day = startOfWeek.getDay(); // 0..6
      const diff = (day+6)%7; // make Monday start
      startOfWeek.setDate(startOfWeek.getDate()-diff);
      startOfWeek.setHours(0,0,0,0);
      const weekList = userWalks.filter(w=> w.startTime ? new Date(w.startTime) >= startOfWeek : false);
      setWeek(sum(weekList));

      const weeklyChartData = [];
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayWalks = userWalks.filter(w => {
          if (!w.startTime) return false;
          const walkDate = new Date(w.startTime);
          return walkDate >= date && walkDate < nextDay;
        });
        
        weeklyChartData.push({
          x: days[date.getDay()],
          y: sum(dayWalks),
          date: date.toISOString().split('T')[0]
        });
      }
      
      setWeeklyData(weeklyChartData);

      const goalTarget = currentUser?.dailyGoalMeters || 1000;
      const todaySum = sum(todayList);
      if (todaySum >= goalTarget && !goalNotified) {
        await notifyGoalReached(todaySum);
        setGoalNotified(true);
      } else if (todaySum < goalTarget) {
        setGoalNotified(false);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [goalNotified, selectedUserId]);

  // Atualizar quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadDashboardData(true);
    }, [loadDashboardData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(false);
  }, [loadDashboardData]);

  const screenWidth = useMemo(() => Dimensions.get('window').width, []);
  const chartWidth = useMemo(() => screenWidth - (spacing.md * 2), [screenWidth]);
  
  const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);
  const goalTarget = useMemo(() => selectedUser?.dailyGoalMeters || 1000, [selectedUser]);
  const goalProgress = useMemo(() => Math.min((today / goalTarget) * 100, 100), [today, goalTarget]);
  const goalReached = useMemo(() => today >= goalTarget, [today, goalTarget]);

  const saveGoal = useCallback(async () => {
    if (!selectedUser) return;
    const numericGoal = Number(goalInput.trim());
    if (Number.isNaN(numericGoal) || numericGoal <= 0) {
      return;
    }
    try {
      setSavingGoal(true);
      const updated = await updateUser(selectedUser.id, { dailyGoalMeters: Math.round(numericGoal) });
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? {...u, ...updated} : u));
      setGoalNotified(false);
      await loadDashboardData(false);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    } finally {
      setSavingGoal(false);
    }
  }, [goalInput, selectedUser, loadDashboardData]);

  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[typography.body, {color: colors.textMuted}]}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{flex: 1, backgroundColor: colors.backgroundSecondary}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{padding: spacing.md, gap: spacing.lg}}>
        {/* Header */}
        <View>
          <Text style={[typography.h1, {color: colors.text, marginBottom: spacing.xs}]}>
            Dashboard
          </Text>
          <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
            Acompanhe seu progresso de caminhadas
          </Text>
        </View>

        {/* Seleção de usuário */}
        <Card variant="elevated">
          <Text style={[typography.bodySmall, {color: colors.textMuted, marginBottom: spacing.sm}]}>
            Filtrar por usuário
          </Text>
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            style={{
              padding: spacing.md,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: colors.border,
              backgroundColor: colors.background,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              ...shadows.small,
            }}
          >
            <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.sm}}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: radius.round,
                backgroundColor: colors.primaryLight + '20',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{fontSize: 18}}>{selectedUser?.avatar || '👤'}</Text>
              </View>
              <View>
                <Text style={[typography.body, {color: colors.text, fontWeight: '700'}]}>
                  {selectedUser?.name || 'Selecione um usuário'}
                </Text>
                {selectedUser && (
                  <Text style={[typography.caption, {color: colors.textMuted}]}>
                    {selectedUser.email}
                  </Text>
                )}
              </View>
            </View>
            <Text style={{color: colors.primary, fontSize: 18}}>▼</Text>
          </TouchableOpacity>
        </Card>

        {/* Stats Cards */}
        <View style={{flexDirection: 'row', gap: spacing.md}}>
          <StatCard 
            title="Hoje" 
            value={today} 
            icon="🚶‍♂️"
            color={colors.success}
            subtitle="Distância percorrida hoje"
          />
          <StatCard 
            title="Esta Semana" 
            value={week} 
            icon="📅"
            color={colors.info}
            subtitle="Distância desta semana"
          />
        </View>

        <StatCard 
          title="Total Geral" 
          value={total} 
          icon="🏆"
          color={colors.primary}
          subtitle="Distância total percorrida"
        />

        {/* Weekly Chart */}
        <Card variant="elevated">
          <View style={{marginBottom: spacing.lg}}>
            <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.xs}]}>
              📊 Atividade Semanal
            </Text>
            <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
              Distância percorrida nos últimos 7 dias
            </Text>
          </View>
          
          {weeklyData.length > 0 ? (
            <View style={{height: 200, justifyContent: 'center', alignItems: 'center', padding: spacing.md}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', width: '100%', height: 150, paddingBottom: spacing.md}}>
                {weeklyData.map((item, index) => {
                  const maxValue = Math.max(...weeklyData.map(d => d.y), 1);
                  const barHeight = maxValue > 0 ? Math.max((item.y / maxValue) * 120, 4) : 4;
                  return (
                    <View key={index} style={{flex: 1, alignItems: 'center', marginHorizontal: spacing.xs}}>
                      <View style={{
                        width: '80%',
                        height: barHeight,
                        backgroundColor: colors.primary,
                        borderRadius: radius.sm,
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        paddingBottom: spacing.xs,
                      }}>
                        {item.y > 0 && (
                          <Text style={[typography.caption, {color: colors.background, fontSize: 9, fontWeight: '600'}]}>
                            {item.y}m
                          </Text>
                        )}
                      </View>
                      <Text style={[typography.caption, {color: colors.textMuted, marginTop: spacing.xs, fontSize: 10}]}>
                        {item.x}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={{height: 200, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
                Nenhum dado disponível
              </Text>
            </View>
          )}
        </Card>

        {/* Goals Card */}
        <Card variant="elevated">
          <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.md}]}>
            🎯 Metas
          </Text>
          <View style={{gap: spacing.md}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={[typography.body, {color: colors.text, fontWeight: '600'}]}>Meta diária</Text>
              <Text style={[typography.bodySmall, {color: colors.textMuted, fontWeight: '600'}]}>{goalTarget}m</Text>
            </View>
            <View style={{
              height: 10, 
              backgroundColor: colors.borderLight, 
              borderRadius: radius.md, 
              overflow: 'hidden',
              ...shadows.small,
            }}>
              <View style={{
                height: '100%', 
                width: `${goalProgress}%`, 
                backgroundColor: goalReached ? colors.success : colors.primary,
                borderRadius: radius.md,
              }} />
            </View>
            <Text style={[typography.bodySmall, {
              color: goalReached ? colors.success : colors.textMuted, 
              textAlign: 'center',
              fontWeight: goalReached ? '600' : '400',
            }]}>
              {goalReached ? '🎉 Meta atingida!' : `${Math.max(0, goalTarget - today)}m restantes`}
            </Text>
            <View style={{marginTop: spacing.md}}>
              <Text style={[typography.bodySmall, {color: colors.textMuted, marginBottom: spacing.xs}]}>
                Ajustar meta diária (metros)
              </Text>
              <View style={{flexDirection: 'row', gap: spacing.sm}}>
                <TextInput
                  value={goalInput}
                  onChangeText={setGoalInput}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    borderWidth: 1.5,
                    borderColor: colors.border,
                    padding: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: colors.background,
                    color: colors.text,
                    ...typography.body,
                  }}
                />
                <TouchableOpacity
                  onPress={saveGoal}
                  disabled={savingGoal}
                  style={{
                    paddingHorizontal: spacing.lg,
                    justifyContent: 'center',
                    borderRadius: radius.md,
                    backgroundColor: savingGoal ? colors.textMuted : colors.primary,
                  }}
                >
                  <Text style={[typography.body, {color: colors.background, fontWeight: '700'}]}>
                    {savingGoal ? '...' : 'Salvar'}
                  </Text>
                </TouchableOpacity>
              </View>
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
                  onPress={()=>{ 
                    setSelectedUserId(item.id); 
                    setGoalInput(String(item.dailyGoalMeters || 1000));
                    setPickerOpen(false); 
                  }} 
                  style={{
                    padding: spacing.md, 
                    borderBottomWidth: 1, 
                    borderBottomColor: colors.borderLight,
                    backgroundColor: selectedUserId === item.id ? colors.primaryLight + '20' : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm
                  }}
                >
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.round,
                    backgroundColor: colors.primaryLight + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{fontSize: 18}}>{item.avatar || '👤'}</Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={[typography.body, {color: colors.text, fontWeight: '600'}]}>
                      {item.name}
                    </Text>
                    <Text style={[typography.caption, {color: colors.textMuted}]}>
                      {item.email}
                    </Text>
                  </View>
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
              <TouchableOpacity 
                onPress={()=>setPickerOpen(false)} 
                style={{
                  padding: spacing.md,
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <Text style={[typography.body, {color: colors.text}]}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


