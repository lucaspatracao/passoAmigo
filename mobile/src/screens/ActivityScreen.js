import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Alert, ScrollView, Modal, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { addWalk } from '../data/repository';
import { UsersRepo } from '../storage/storage';
import { colors, spacing, typography, radius, shadows } from '../theme/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingStates';
import Logger from '../utils/logger';
import { PermissionManager } from '../utils/permissions';
import { notifyWalkSaved } from '../utils/notifications';
import { useFocusEffect } from '@react-navigation/native';

function haversine(a, b){
  const toRad = (v)=> v*Math.PI/180;
  const R = 6371000; // meters
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

export default function ActivityScreen(){
  const [recording,setRecording]=useState(false);
  const [paused,setPaused]=useState(false);
  const [distance,setDistance]=useState(0);
  const [userId,setUserId]=useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const polylineRef = useRef([]);
  const watchRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(()=>{ 
    loadUsers();
    requestLocationPermission();
    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  useEffect(() => {
    if (recording && !paused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording, paused]);

  async function loadUsers() {
    try {
      const userList = await UsersRepo.list();
      setUsers(userList);
      if (userList.length > 0) {
        setSelectedUser(userList[0]);
        setUserId(userList[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  async function requestLocationPermission() {
    try {
      Logger.userAction('Request location permission');
      const result = await PermissionManager.ensureLocationPermission();
      setPermissionGranted(result.granted);
      
      if (result.granted) {
        Toast.show({type: 'success', text1: 'Permissão concedida!', text2: 'Agora você pode registrar caminhadas'});
      }
    } catch (error) {
      Logger.error('Error requesting location permission', error);
      Toast.show({type: 'error', text1: 'Erro ao solicitar permissão', text2: error.message});
    }
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  async function start(){
    if (!permissionGranted) {
      Toast.show({type: 'error', text1: 'Permissão necessária', text2: 'Habilite a localização nas configurações'});
      return;
    }

    if (!selectedUser) {
      Toast.show({type: 'error', text1: 'Usuário necessário', text2: 'Selecione um usuário antes de iniciar'});
      return;
    }

    const startTime = Date.now();
    
    try{
      Logger.userAction('Start walk', { userId: selectedUser.id, userName: selectedUser.name });
      setLoading(true);
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
      setRecording(true); 
      setPaused(false); 
      setDistance(0); 
      setElapsedTime(0);
      setStartTime(new Date());
      polylineRef.current = [];

      // Captura posição inicial para evitar atraso e reutilizar ponto anterior
      const initialPosition = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (initialPosition?.coords) {
        const { latitude, longitude } = initialPosition.coords;
        polylineRef.current = [latitude, longitude];
      }
      
      // Configuração otimizada para GPS mais preciso e atualizações mais frequentes
      // Reduzido timeInterval para 500ms para melhor responsividade na contagem
      watchRef.current = await Location.watchPositionAsync({ 
        accuracy: Location.Accuracy.High, 
        distanceInterval: 1, // Atualiza a cada 1 metro (mais preciso)
        timeInterval: 500, // Atualiza a cada 0.5 segundo (mais responsivo)
        mayShowUserSettingsDialog: true
      }, (loc)=>{
        if(!paused && loc.coords){
          const { latitude, longitude, accuracy } = loc.coords;
          
          // Filtrar pontos com baixa precisão (acima de 20 metros de erro)
          if (accuracy && accuracy > 20) {
            Logger.debug('GPS low accuracy', { accuracy });
            return;
          }
          
          const pts = polylineRef.current;
          if(pts.length >= 2){
            const last = { 
              latitude: pts[pts.length-2], 
              longitude: pts[pts.length-1] 
            };
            const current = { latitude, longitude };
            const d = haversine(last, current);
            
            // Filtrar distâncias impossíveis (mais de 50m em 1 segundo = ~180 km/h)
            if (d > 0 && d < 50) {
              setDistance(prev=> prev + d);
              pts.push(latitude, longitude);
              polylineRef.current = pts;
            } else if (d >= 50) {
              Logger.debug('GPS jump detected', { distance: d, accuracy });
            }
          } else {
            // Primeiro ponto
            pts.push(latitude, longitude);
            polylineRef.current = pts;
          }
        }
      });
      
      Logger.performance('Start walk', Date.now() - startTime);
      Toast.show({type: 'success', text1: 'Caminhada iniciada!', text2: 'Boa caminhada!'});
    }catch(e){ 
      Logger.error('Error starting walk', e);
      Toast.show({type:'error', text1:'Erro ao iniciar', text2:String(e.message||e)}); 
    } finally {
      setLoading(false);
    }
  }

  function pause(){ 
    setPaused(p => {
      const newPaused = !p;
      Logger.userAction(newPaused ? 'Pause walk' : 'Resume walk', { 
        distance: Math.round(distance), 
        elapsedTime 
      });
      Toast.show({
        type: 'info', 
        text1: newPaused ? 'Caminhada pausada' : 'Caminhada retomada'
      });
      return newPaused;
    });
  }

  async function stop(){
    if (!selectedUser) {
      Toast.show({type:'error', text1:'Erro', text2:'Usuário não selecionado'});
      return;
    }

    if (distance < 1) {
      Alert.alert(
        'Caminhada muito curta',
        'A distância registrada é muito pequena. Deseja salvar mesmo assim?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => {
            setRecording(false);
            setPaused(false);
            setDistance(0);
            setElapsedTime(0);
            setStartTime(null);
            if(watchRef.current){ 
              watchRef.current.remove(); 
              watchRef.current=null; 
            }
          }},
          { text: 'Salvar', onPress: () => saveWalk() }
        ]
      );
      return;
    }

    await saveWalk();
  }

  async function saveWalk() {
    try{
      const finalDistance = Math.round(distance);
      const finalDuration = elapsedTime;
      const finalUserId = selectedUser?.id;
      
      if (!finalUserId) {
        throw new Error('Usuário não selecionado');
      }

      Logger.userAction('Stop walk', { 
        distance: finalDistance, 
        elapsedTime: finalDuration,
        userId: finalUserId 
      });
      
      setLoading(true);
      
      // Parar GPS primeiro
      if(watchRef.current){ 
        watchRef.current.remove(); 
        watchRef.current=null; 
      }
      
      const walk = { 
        userId: finalUserId, 
        distanceMeters: finalDistance, 
        polyline: polylineRef.current || [], 
        startTime: startTime?.toISOString() || new Date().toISOString(),
        duration: finalDuration
      };
      
      // Validar antes de salvar
      if (!walk.userId || walk.distanceMeters < 0) {
        throw new Error('Dados inválidos para salvar caminhada');
      }
      
      const savedWalk = await addWalk(walk);
      
      if (!savedWalk || !savedWalk.id) {
        throw new Error('Falha ao salvar caminhada - nenhum ID retornado');
      }
      
      Logger.info('Walk saved successfully', { 
        id: savedWalk.id,
        distance: walk.distanceMeters, 
        duration: walk.duration,
        userId: walk.userId 
      });
      
      // Resetar estado
      setRecording(false);
      setPaused(false);
      setDistance(0);
      setElapsedTime(0);
      setStartTime(null);
      polylineRef.current = [];
      
      // Notificar
      await notifyWalkSaved(finalDistance, finalDuration);
      
      Toast.show({
        type:'success', 
        text1:'Caminhada salva!', 
        text2: `${finalDistance}m em ${formatTime(finalDuration)}`
      });
    }catch(e){ 
      Logger.error('Error saving walk', e);
      const errorMsg = e?.message || String(e) || 'Erro desconhecido ao salvar';
      Toast.show({
        type:'error', 
        text1:'Erro ao salvar', 
        text2: errorMsg
      }); 
      
      // Não resetar estado se houve erro - permite tentar novamente
      if(watchRef.current){ 
        watchRef.current.remove(); 
        watchRef.current=null; 
      }
    } finally {
      setLoading(false);
    }
  }

  function selectUser(user) {
    setSelectedUser(user);
    setUserId(user.id);
    setShowUserModal(false);
  }

  if (!permissionGranted) {
    return (
      <View style={{flex: 1, backgroundColor: colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center', padding: spacing.lg}}>
        <Text style={[typography.h2, {color: colors.text, marginBottom: spacing.md, textAlign: 'center'}]}>
          📍 Permissão de Localização
        </Text>
        <Text style={[typography.body, {color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg}]}>
          É necessário permitir acesso à localização para registrar caminhadas e calcular distâncias.
        </Text>
        <Button 
          title="Solicitar Permissão" 
          onPress={requestLocationPermission}
          style={{marginBottom: spacing.md}}
        />
        <Text style={[typography.caption, {color: colors.textMuted, textAlign: 'center'}]}>
          Vá para Configurações → Privacidade → Localização se necessário
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{flex: 1, backgroundColor: colors.backgroundSecondary}}>
      <View style={{padding: spacing.md, gap: spacing.lg}}>
        {/* Header */}
        <View>
          <Text style={[typography.h1, {color: colors.text, marginBottom: spacing.xs}]}>
            🚶‍♂️ Caminhada
          </Text>
          <Text style={[typography.bodySmall, {color: colors.textMuted}]}>
            Registre sua atividade física
          </Text>
        </View>

        {/* User Selection */}
        <Card variant="elevated">
          <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.md}]}>
            👤 Usuário
          </Text>
          <TouchableOpacity 
            onPress={() => setShowUserModal(true)}
            accessibilityLabel="Selecionar usuário para caminhada"
            accessibilityHint="Toque para abrir lista de usuários e selecionar um usuário"
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: colors.border,
              ...shadows.small,
            }}
          >
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: radius.round,
                backgroundColor: colors.primaryLight + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
              }}>
                <Text style={{fontSize: 18}}>{selectedUser?.avatar || '👤'}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={[typography.body, {color: colors.text, fontWeight: '700'}]}>
                  {selectedUser ? selectedUser.name : 'Selecionar usuário'}
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

        {/* Stats */}
        <View style={{flexDirection: 'row', gap: spacing.md}}>
          <Card style={{flex: 1}} variant="elevated">
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs}}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: radius.md,
                backgroundColor: colors.primaryLight + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.sm,
              }}>
                <Text style={{fontSize: 16}}>📏</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={[typography.bodySmall, {color: colors.textMuted, marginBottom: spacing.xs}]}>
                  Distância
                </Text>
                <Text style={[typography.h2, {color: colors.primary, fontWeight: '700'}]}>
                  {distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${Math.round(distance)} m`}
                </Text>
              </View>
            </View>
          </Card>
          <Card style={{flex: 1}} variant="elevated">
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs}}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: radius.md,
                backgroundColor: colors.infoLight + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.sm,
              }}>
                <Text style={{fontSize: 16}}>⏱️</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={[typography.bodySmall, {color: colors.textMuted, marginBottom: spacing.xs}]}>
                  Tempo
                </Text>
                <Text style={[typography.h2, {color: colors.info, fontWeight: '700'}]}>
                  {formatTime(elapsedTime)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Controls */}
        <Card variant="elevated">
          <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.lg}]}>
            🎮 Controles
          </Text>
          
          {loading && (
            <View style={{marginBottom: spacing.md}}>
              <LoadingSpinner />
            </View>
          )}

          <View style={{gap: spacing.md}}>
            {!recording ? (
              <Button 
                title="🚀 Iniciar Caminhada" 
                onPress={start}
                disabled={!selectedUser || loading}
                size="large"
                accessibilityLabel="Iniciar caminhada com GPS"
                accessibilityHint="Inicia o rastreamento GPS para registrar uma nova caminhada"
              />
            ) : (
              <View style={{flexDirection: 'row', gap: spacing.md}}>
                <Button 
                  title={paused ? "▶️ Retomar" : "⏸️ Pausar"} 
                  onPress={pause}
                  variant="secondary"
                  style={{flex: 1}}
                  disabled={loading}
                  accessibilityLabel={paused ? "Retomar caminhada" : "Pausar caminhada"}
                  accessibilityHint={paused ? "Retoma o rastreamento GPS da caminhada" : "Pausa temporariamente o rastreamento GPS"}
                />
                <Button 
                  title="🏁 Finalizar" 
                  onPress={stop}
                  variant="danger"
                  style={{flex: 1}}
                  disabled={loading}
                  accessibilityLabel="Finalizar e salvar caminhada"
                  accessibilityHint="Finaliza a caminhada e salva os dados registrados"
                />
              </View>
            )}
          </View>

          {recording && (
            <View style={{
              marginTop: spacing.md,
              padding: spacing.md,
              backgroundColor: paused ? colors.warning + '20' : colors.success + '20',
              borderRadius: radius.md,
              borderLeftWidth: 4,
              borderLeftColor: paused ? colors.warning : colors.success
            }}>
              <Text style={[typography.bodySmall, {color: paused ? colors.warning : colors.success, fontWeight: '600'}]}>
                {paused ? '⏸️ Caminhada pausada' : '🚶‍♂️ Caminhada em andamento'}
              </Text>
            </View>
          )}
        </Card>

        {/* Tips */}
        <Card variant="elevated">
          <Text style={[typography.h3, {color: colors.text, marginBottom: spacing.md}]}>
            💡 Dicas
          </Text>
          <View style={{gap: spacing.sm}}>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
              <Text style={[typography.bodySmall, {color: colors.primary, marginRight: spacing.sm}]}>•</Text>
              <Text style={[typography.bodySmall, {color: colors.textMuted, flex: 1}]}>
                Mantenha o app aberto durante a caminhada
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
              <Text style={[typography.bodySmall, {color: colors.primary, marginRight: spacing.sm}]}>•</Text>
              <Text style={[typography.bodySmall, {color: colors.textMuted, flex: 1}]}>
                Use pausar para paradas temporárias
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
              <Text style={[typography.bodySmall, {color: colors.primary, marginRight: spacing.sm}]}>•</Text>
              <Text style={[typography.bodySmall, {color: colors.textMuted, flex: 1}]}>
                A distância é calculada automaticamente via GPS
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* User Selection Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{flex: 1, backgroundColor: colors.background}}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border
          }}>
            <Text style={[typography.h2, {color: colors.text}]}>Selecionar Usuário</Text>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Text style={[typography.body, {color: colors.primary}]}>Fechar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{flex: 1}}>
            <View style={{paddingHorizontal: spacing.md, paddingTop: spacing.md}}>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => selectUser(user)}
                  style={{
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                    backgroundColor: selectedUser?.id === user.id ? colors.primaryLight + '20' : 'transparent',
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
                    <Text style={{fontSize: 18}}>{user.avatar || '👤'}</Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={[typography.body, {color: colors.text, fontWeight: selectedUser?.id === user.id ? '700' : '600'}]}>
                      {user.name}
                    </Text>
                    <Text style={[typography.caption, {color: colors.textMuted}]}>
                      {user.email}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}


