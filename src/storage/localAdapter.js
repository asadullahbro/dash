import { get, set, del } from 'idb-keyval';

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
    // also remove related events (optional, keep for now)
  },
  async getEvents() {
    return (await get(EVENTS_KEY)) || [];
  },
  async addEvent(event) {
    const events = await this.getEvents();
    events.push({ ...event, id: crypto.randomUUID() });
    await set(EVENTS_KEY, events);
  },
  async updateEntryReason(entryId, reason) {
    const events = await this.getEvents();
    const updated = events.map(e => e.id === entryId ? { ...e, reason } : e);
    await set(EVENTS_KEY, updated);
  },
  async setHabits(habits) { await set(HABITS_KEY, habits); },
  async setEvents(events) { await set(EVENTS_KEY, events); },
};