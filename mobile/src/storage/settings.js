import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'app_settings';

export async function loadSettings(){
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : {};
}

export async function saveSettings(settings){
  const current = await loadSettings();
  const next = { ...current, ...settings };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function getDarkMode(){
  const settings = await loadSettings();
  return settings.darkMode === true;
}

export async function setDarkMode(enabled){
  return await saveSettings({ darkMode: enabled });
}


