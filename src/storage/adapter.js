import { supabase } from '../lib/supabaseClient';
import { localAdapter } from './localAdapter';
import useAuthStore from '../store/authStore';

function isGuest() {
  return useAuthStore.getState().isGuest;
}

export const storageAdapter = {
  async getHabits() {
    if (isGuest()) return localAdapter.getHabits();
    const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  async addHabit(name, type) {
    if (isGuest()) return localAdapter.addHabit(name, type);
    const { data, error } = await supabase.from('habits').insert({ name, type }).select().single();
    if (error) throw error;
    return data;
  },
  async removeHabit(id) {
    if (isGuest()) return localAdapter.removeHabit(id);
    const { error } = await supabase.from('habits').delete().match({ id });
    if (error) throw error;
  },
  async getEvents() {
    if (isGuest()) return localAdapter.getEvents();
    const { data, error } = await supabase.from('entries').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  },
  async addEvent(event) {
    if (isGuest()) return localAdapter.addEvent(event);
    const { error } = await supabase.from('entries').insert(event);
    if (error) throw error;
  },
  async updateEntryReason(entryId, reason) {
    if (isGuest()) return localAdapter.updateEntryReason(entryId, reason);
    const { error } = await supabase.from('entries').update({ reason }).match({ id: entryId });
    if (error) throw error;
  },
  // Helpers for guest only (not used in Supabase flow)
  async setHabits(habits) { await localAdapter.setHabits(habits); },
  async setEvents(events) { await localAdapter.setEvents(events); },
};