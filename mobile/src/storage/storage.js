import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS={users:'users',walks:'walks'};

async function getAll(key){ const json=await AsyncStorage.getItem(key); return json?JSON.parse(json):[]; }
async function saveAll(key,arr){ await AsyncStorage.setItem(key, JSON.stringify(arr)); }

const withUserDefaults = (user)=>({
  avatar: '👤',
  dailyGoalMeters: 1000,
  ...user,
});

export const UsersRepo={
  async list(){ const list=await getAll(KEYS.users); return list.map(withUserDefaults); },
  async add(user){ const list=await getAll(KEYS.users); const id=Date.now().toString(); const item=withUserDefaults({...user,id}); list.push(item); await saveAll(KEYS.users,list); return item; },
  async update(id,user){ const list=await getAll(KEYS.users); const i=list.findIndex(x=>x.id===id); if(i>=0){ list[i]=withUserDefaults({...list[i],...user,id}); await saveAll(KEYS.users,list); return list[i]; } return null; },
  async remove(id){ const list=await getAll(KEYS.users); const next=list.filter(x=>x.id!==id); await saveAll(KEYS.users,next); },
};

export const WalksRepo={
  async listByUser(userId){ const list=await getAll(KEYS.walks); return list.filter(w=>w.userId===userId); },
  async add(walk){ const list=await getAll(KEYS.walks); const id=Date.now().toString(); const item={...walk,id}; list.push(item); await saveAll(KEYS.walks,list); return item; },
  async update(id,walk){ const list=await getAll(KEYS.walks); const i=list.findIndex(x=>x.id===id); if(i>=0){ list[i]={...list[i],...walk,id}; await saveAll(KEYS.walks,list); return list[i]; } return null; },
  async remove(id){ const list=await getAll(KEYS.walks); const next=list.filter(x=>x.id!==id); await saveAll(KEYS.walks,next); },
};


