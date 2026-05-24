import { create } from 'zustand';
import { storageAdapter } from '../storage/adapter';
import useAuthStore from './authStore';

const useEntryStore = create((set, get) => ({
  // ----- State -----
  habits: [],     // [{ id, name, type }]
  entries: [],    // [{ id, habit_id, value, skipped, reason, timestamp }]
  isLoaded: false,

  // ----- Load all data for current user -----
load: async () => {
  const isLoggedIn = useAuthStore.getState().isLoggedIn;
  if (!isLoggedIn) {
    set({ habits: [], entries: [], isLoaded: true });
    return;
  }
  try {
    const [habits, entries] = await Promise.all([
      storageAdapter.getHabits(),
      storageAdapter.getEvents(),
    ]);
    set({ habits, entries, isLoaded: true });
  } catch (err) {
    console.error('Failed to load data', err);
    set({ isLoaded: true });
  }
},

  // ----- Habit management -----
  addHabit: async (name, type = 'build') => {
    try {
      const newHabit = await storageAdapter.addHabit(name, type);
      set((state) => ({ habits: [...state.habits, newHabit] }));
    } catch (err) {
      console.error('Failed to add habit', err);
    }
  },

  removeHabit: async (id) => {
    try {
      await storageAdapter.removeHabit(id);
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
        entries: state.entries.filter((e) => e.habit_id !== id),
      }));
    } catch (err) {
      console.error('Failed to remove habit', err);
    }
  },

  // ----- Log actions (now using habit_id) -----
  logYes: async (habitId) => {
    const event = {
      habit_id: habitId,
      value: true,
      skipped: false,
      reason: '',
      timestamp: new Date().toISOString(),
    };
    try {
      await storageAdapter.addEvent(event);
      // Fetch the latest event id? Not needed, we can just push a temp entry (or re-fetch)
      // For immediate UI, push a temp object with a generated id
      set((state) => ({
        entries: [...state.entries, { ...event, id: crypto.randomUUID() }],
      }));
    } catch (err) {
      console.error('Failed to log yes', err);
    }
  },

  logNo: async (habitId) => {
    const tempId = crypto.randomUUID();
    const event = {
      habit_id: habitId,
      value: false,
      skipped: false,
      reason: '',
      timestamp: new Date().toISOString(),
    };
    try {
      await storageAdapter.addEvent(event);
      set((state) => ({
        entries: [...state.entries, { ...event, id: tempId }],
      }));
      return tempId; // for reason prompt
    } catch (err) {
      console.error('Failed to log no', err);
    }
  },

  skipHabit: async (habitId) => {
    const event = {
      habit_id: habitId,
      value: null,
      skipped: true,
      reason: '',
      timestamp: new Date().toISOString(),
    };
    try {
      await storageAdapter.addEvent(event);
      set((state) => ({
        entries: [...state.entries, { ...event, id: crypto.randomUUID() }],
      }));
    } catch (err) {
      console.error('Failed to skip habit', err);
    }
  },

  updateEntryReason: async (entryId, reason) => {
    try {
      await storageAdapter.updateEntryReason(entryId, reason);
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === entryId ? { ...e, reason } : e
        ),
      }));
    } catch (err) {
      console.error('Failed to update reason', err);
    }
  },
}));

export default useEntryStore;