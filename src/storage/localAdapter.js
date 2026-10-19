import { get, set } from 'idb-keyval';

const HABITS_KEY = 'habits_local';
const EVENTS_KEY = 'events_local';

export const localAdapter = {
  async getHabits() {
    return (await get(HABITS_KEY)) || [];
  },
  async addHabit(name, type) {
    const habits = await this.getHabits();
    const newHabit = { id: crypto.randomUUID(), name, type, created_at: new Date().toISOString() };
    habits.push(newHabit);
    await set(HABITS_KEY, habits);
    return newHabit;
  },
  async removeHabit(id) {
    const habits = await this.getHabits();
    const updated = habits.filter(h => h.id !== id);
    await set(HABITS_KEY, updated);
    const events = await this.getEvents();
    await set(EVENTS_KEY, events.filter(e => e.habit_id !== id));
  },
  async getEvents() {
    return (await get(EVENTS_KEY)) || [];
  },
  async addEvent(event) {
    const events = await this.getEvents();
    const saved = { ...event, id: crypto.randomUUID() };
    events.push(saved);
    await set(EVENTS_KEY, events);
    return saved;
  },
  async updateEntryReason(entryId, reason) {
    const events = await this.getEvents();
    const updated = events.map(e => e.id === entryId ? { ...e, reason } : e);
    await set(EVENTS_KEY, updated);
  },
  async setHabits(habits) { await set(HABITS_KEY, habits); },
  async setEvents(events) { await set(EVENTS_KEY, events); },
};