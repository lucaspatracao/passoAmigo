import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UsersScreen from './src/screens/UsersScreen';
import WalksScreen from './src/screens/WalksScreen';
import UserFormScreen from './src/screens/UserFormScreen';
import WalkFormScreen from './src/screens/WalkFormScreen';
import UserDetailScreen from './src/screens/UserDetailScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import Toast from 'react-native-toast-message';
import ActivityScreen from './src/screens/ActivityScreen';
import WalkMapScreen from './src/screens/WalkMapScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { LogoHeader } from './src/components/LogoHeader';
import { seedInitialData } from './src/storage/seed';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsHome(){
  return (
    <Tabs.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let icon = 'ellipse';
        if(route.name==='Dashboard') icon='speedometer-outline';
        else if(route.name==='Users') icon='people';
        else if(route.name==='Walks') icon='footsteps-outline';
        else if(route.name==='Activity') icon='fitness-outline';
        else if(route.name==='Settings') icon='settings-outline';
        return <Ionicons name={icon} size={size} color={color} />;
      },
    })}>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} />
      <Tabs.Screen name="Users" component={UsersScreen} options={{title:'Usuários'}} />
      <Tabs.Screen name="Walks" component={WalksScreen} options={{title:'Caminhadas'}}/>
      <Tabs.Screen name="Activity" component={ActivityScreen} options={{title:'Atividade'}}/>
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{title:'Configurações'}}/>
    </Tabs.Navigator>
  );
}

export default function App(){
  useEffect(() => {
    seedInitialData();
  }, []);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator 
            screenOptions={{ headerShown: false }}
            initialRouteName="Welcome"
          >
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Home" 
              component={TabsHome}
              options={{
                headerShown: true,
                header: () => <LogoHeader />,
              }}
            />
            <Stack.Screen 
              name="Tutorial" 
              component={TutorialScreen} 
              options={{title:'Tutorial', headerShown: true}} 
            />
            <Stack.Screen 
              name="UserDetail" 
              component={UserDetailScreen} 
              options={{title:'Usuário', headerShown: true}} 
            />
            <Stack.Screen 
              name="UserForm" 
              component={UserFormScreen} 
              options={{title:'Usuário', headerShown: true}} 
            />
            <Stack.Screen 
              name="WalkForm" 
              component={WalkFormScreen} 
              options={{title:'Caminhada', headerShown: true}} 
            />
            <Stack.Screen 
              name="WalkMap" 
              component={WalkMapScreen} 
              options={{title:'Mapa da Rota', headerShown: true}} 
            />
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
