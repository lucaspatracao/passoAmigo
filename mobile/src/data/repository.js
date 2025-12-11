import { UsersRepo, WalksRepo } from '../storage/storage';
import { Backend, usingBackend } from '../api/api';

// Users
export async function listUsers(){
  return (await usingBackend()) ? Backend.listUsers() : UsersRepo.list();
}

export async function addUser(user){
  if(await usingBackend()) return Backend.createUser(user);
  return UsersRepo.add(user);
}

export async function updateUser(id, user){
  if(await usingBackend()) return Backend.updateUser(id, user);
  return UsersRepo.update(id, user);
}

export async function removeUser(id){
  if(await usingBackend()) return Backend.deleteUser(id);
  return UsersRepo.remove(id);
}

// Walks
export async function listWalksByUser(userId){
  if(await usingBackend()) return Backend.listWalksByUser(userId);
  return WalksRepo.listByUser(userId);
}

export async function addWalk(walk){
  if(await usingBackend()) return Backend.createWalk(walk);
  return WalksRepo.add(walk);
}

export async function updateWalk(id, walk){
  if(await usingBackend()) return Backend.updateWalk(id, walk);
  return WalksRepo.update(id, walk);
}

export async function removeWalk(id){
  if(await usingBackend()) return Backend.deleteWalk(id);
  return WalksRepo.remove(id);
}


