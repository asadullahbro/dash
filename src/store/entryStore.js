import { create } from 'zustand';
import { storageAdapter } from '../storage/adapter';
import useAuthStore from './authStore';

async function logEvent(set, habitId, fields) {
  const event = {
    habit_id: habitId,
    reason: '',
    timestamp: new Date().toISOString(),
    ...fields,
  };
  try {
    const saved = await storageAdapter.addEvent(event);
    set((state) => ({ entries: [...state.entries, saved] }));
    return saved.id; // for reason prompt
  } catch (err) {
    console.error('Failed to log entry', err);
  }
}

const useEntryStore = create((set) => ({
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

  // ----- Log actions -----
  // Stores the row the adapter saved, so its id matches the database.
  logYes: (habitId) => logEvent(set, habitId, { value: true, skipped: false }),
  logNo: (habitId) => logEvent(set, habitId, { value: false, skipped: false }),
  skipHabit: (habitId) => logEvent(set, habitId, { value: null, skipped: true }),

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