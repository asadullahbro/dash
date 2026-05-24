import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useAuthStore from '../store/authStore';
import useEntryStore from '../store/entryStore';
import { parseISO, isToday, startOfDay, differenceInCalendarDays } from 'date-fns';
import MonthGrid from '../components/MonthGrid';
import { useNavigate } from 'react-router-dom';

// ----- Helpers (updated to use habit_id) -----
function getDailyState(entries, habitId) {
  const todayEntry = entries.find(
    (e) => e.habit_id === habitId && isToday(parseISO(e.timestamp))
  );
  if (!todayEntry) return 'pending';
  if (todayEntry.skipped) return 'skip';
  return todayEntry.value ? 'yes' : 'no';
}

function computeStreak(entries, habitId) {
  const pastYesDays = entries
    .filter(
      (e) =>
        e.habit_id === habitId &&
        e.value === true &&
        !isToday(parseISO(e.timestamp))
    )
    .map((e) => startOfDay(parseISO(e.timestamp)).toISOString());

  const uniqueDays = [...new Set(pastYesDays)].sort((a, b) => b.localeCompare(a));

  let streak = 0;
  let cursor = startOfDay(new Date());
  cursor.setDate(cursor.getDate() - 1); // start from yesterday

  for (const dayStr of uniqueDays) {
    const day = new Date(dayStr);
    const diff = differenceInCalendarDays(cursor, day);
    if (diff === 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (diff === 1 && streak === 0) {
      streak++;
      cursor = day;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ----- HabitCard (now accepts habitId) -----
function HabitCard({ habitName, habitId, streak, onYes, onNo, onSkip }) {
  const [leaving, setLeaving] = useState(false);

  const handleAction = (action) => {
    setLeaving(true);
    setTimeout(() => action(habitId), 300);
  };

  return (
    <div
      className={`relative w-full bg-stone-50 border border-stone-200 rounded-lg px-5 py-4 transition-all duration-300 ${
        leaving ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{habitName}</p>
          {streak > 0 && <p className="text-xs text-stone-400">{streak} day streak</p>}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => handleAction(onYes)} className="text-xs px-3 py-1 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition">yes</button>
        <button onClick={() => handleAction(onNo)} className="text-xs px-3 py-1 rounded-full border border-stone-300 text-stone-500 hover:bg-stone-100 transition">no</button>
        <button onClick={() => handleAction(onSkip)} className="text-xs px-3 py-1 rounded-full border border-stone-200 text-stone-400 hover:bg-stone-50 transition">skip</button>
      </div>
    </div>
  );
}

// ----- Reason prompt (unchanged) -----
function ReasonPrompt({ habitName, onSave, onDismiss }) {
  const [inputVisible, setInputVisible] = useState(false);
  const [reason, setReason] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    onSave(habitName, reason.trim() || '');
    setInputVisible(false);
    setReason('');
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white border border-stone-200 rounded-lg shadow-md px-4 py-3 flex items-center gap-3 text-sm transition-all">
      {!inputVisible ? (
        <>
          <span className="text-stone-500">
            add a reason for <span className="text-stone-700">{habitName}</span>?
          </span>
          <button
            onClick={() => setInputVisible(true)}
            className="text-xs px-2 py-1 rounded border border-stone-300 text-stone-600 hover:bg-stone-100"
          >
            add
          </button>
          <button onClick={onDismiss} className="text-xs px-2 py-1 rounded text-stone-400 hover:text-stone-600">
            later
          </button>
        </>
      ) : (
        <form onSubmit={handleSave} className="flex gap-2 items-center">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="optional"
            className="border border-stone-200 rounded px-2 py-1 text-sm w-40 focus:outline-none focus:border-stone-400"
            autoFocus
          />
          <button type="submit" className="text-xs px-2 py-1 bg-stone-800 text-white rounded">save</button>
          <button type="button" onClick={onDismiss} className="text-xs px-2 py-1 text-stone-400 hover:text-stone-600">
            cancel
          </button>
        </form>
      )}
    </div>
  );
}

// ----- Main Dashboard -----
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const habits = useEntryStore((s) => s.habits);
  const entries = useEntryStore((s) => s.entries);
  const isLoaded = useEntryStore((s) => s.isLoaded);
  const load = useEntryStore((s) => s.load);
  const addHabit = useEntryStore((s) => s.addHabit);
  const logYes = useEntryStore((s) => s.logYes);
  const logNo = useEntryStore((s) => s.logNo);
  const skipHabit = useEntryStore((s) => s.skipHabit);
  const updateEntryReason = useEntryStore((s) => s.updateEntryReason);
  const isGuest = useAuthStore((s) => s.isGuest);
  const navigate = useNavigate();

  const [newHabit, setNewHabit] = useState('');
  const [habitType, setHabitType] = useState('build');
  const [visible, setVisible] = useState(false);

  // Gentle reason prompt state
  const [prompt, setPrompt] = useState(null); // { habitName, entryId }
  const promptTimer = useRef(null);

  // Load data once
  useEffect(() => {
    load();
    const timer = setTimeout(() => setVisible(true), 100);
    return () => {
      clearTimeout(timer);
      clearTimeout(promptTimer.current);
    };
  }, [load]);

  // Pending habits
  const pendingHabits = useMemo(
    () => habits.filter((h) => getDailyState(entries, h.id) === 'pending'),
    [habits, entries]
  );

  // Streaks
  const streaks = useMemo(() => {
    const map = {};
    pendingHabits.forEach((h) => {
      map[h.id] = computeStreak(entries, h.id);
    });
    return map;
  }, [pendingHabits, entries]);

  // Build / break counts
  const buildCount = habits.filter((h) => h.type === 'build').length;
  const breakCount = habits.filter((h) => h.type === 'break').length;

  // Actions
  const handleAddHabit = useCallback(
    async (e) => {
      e.preventDefault();
      const name = newHabit.trim();
      if (!name) return;
      await addHabit(name, habitType);
      setNewHabit('');
    },
    [newHabit, habitType, addHabit]
  );

  const handleYes = useCallback((id) => logYes(id), [logYes]);
  const handleSkip = useCallback((id) => skipHabit(id), [skipHabit]);

  const handleNo = useCallback(
    async (id) => {
      const entryId = await logNo(id); // returns temp id of saved event
      // Show prompt – need habit name for display
      const habit = habits.find((h) => h.id === id);
      if (habit) {
        clearTimeout(promptTimer.current);
        setPrompt({ habitName: habit.name, entryId });
        promptTimer.current = setTimeout(() => setPrompt(null), 7000);
      }
    },
    [logNo, habits]
  );

  const handleSaveReason = useCallback(
    (habitName, reason) => {
      if (prompt?.entryId) {
        updateEntryReason(prompt.entryId, reason);
      }
      setPrompt(null);
      clearTimeout(promptTimer.current);
    },
    [prompt, updateEntryReason]
  );

  const handleDismissPrompt = useCallback(() => {
    setPrompt(null);
    clearTimeout(promptTimer.current);
  }, []);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-stone-300 text-sm">...</p>
      </div>
    );
  }

  const isEmpty = habits.length === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-xl mx-auto px-4 py-6 flex items-center justify-between border-b border-stone-100">
        <h1 className="text-lg font-light tracking-tight">dash</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-stone-400">{user?.name?.split(' ')[0]}</span>
          <button onClick={logout} className="text-stone-300 hover:text-black transition">
            (logout)
          </button>
        </div>
      </div>
      {isGuest && (
  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-center text-amber-800">
    You're a guest — data is stored locally.{' '}
    <button
      onClick={() => {
        // sign out guest, then go to login
        logout(); // this will clear guest state and return to login
        // Actually we want to keep guest data? Better: redirect to login page with a parameter? 
        // For simplicity, sign out and go to login.
      }}
      className="underline font-medium hover:text-amber-900"
    >
      Sign in to save across devices
    </button>
  </div>
)}

      {/* Calendar (collapsible) */}
      <div className="max-w-xl mx-auto px-4 mt-4">
        <MonthGrid />
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Add habit form */}
        <form onSubmit={handleAddHabit} className="mb-10 space-y-3">
          <div className="flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setHabitType('build')}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                habitType === 'build'
                  ? 'border-stone-800 bg-stone-800 text-white'
                  : 'border-stone-200 text-stone-500'
              }`}
            >
              build
            </button>
            <button
              type="button"
              onClick={() => setHabitType('break')}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                habitType === 'break'
                  ? 'border-stone-800 bg-stone-800 text-white'
                  : 'border-stone-200 text-stone-500'
              }`}
            >
              break
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="name"
              className="flex-1 border-b border-stone-200 py-2 text-sm focus:outline-none focus:border-stone-400 transition"
            />
            <button type="submit" className="text-sm text-stone-400 hover:text-black transition">
              add
            </button>
          </div>
        </form>

        {/* Passive summary */}
        {habits.length > 0 && (
          <p className="text-xs text-stone-300 text-right mb-4">
            {buildCount} build · {breakCount} break
          </p>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="text-center py-20">
            <p className="text-stone-400 text-sm">nothing here yet</p>
          </div>
        )}

        {/* Pending habits */}
        {!isEmpty && pendingHabits.length > 0 && (
          <div className="space-y-3">
            {pendingHabits.map((h, i) => (
              <div
                key={h.id}
                className={`transition-all duration-700 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <HabitCard
                  habitName={h.name}
                  habitId={h.id}
                  streak={streaks[h.id]}
                  onYes={handleYes}
                  onNo={handleNo}
                  onSkip={handleSkip}
                />
              </div>
            ))}
          </div>
        )}

        {/* All habits answered today */}
        {!isEmpty && pendingHabits.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-400 text-sm">all checked in</p>
          </div>
        )}

        {/* Gentle reason prompt (if active) */}
        {prompt && (
          <ReasonPrompt
            habitName={prompt.habitName}
            onSave={handleSaveReason}
            onDismiss={handleDismissPrompt}
          />
        )}
      </div>
    </div>
  );
}