import { useMemo } from 'react';
import useEntryStore from '../store/entryStore';
import { parseISO, startOfDay, differenceInCalendarDays, isToday } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HabitWidget({ habitName }) {
  const entries = useEntryStore((s) => s.entries);
  const logHabit = useEntryStore((s) => s.logHabit);

  const habitEntries = entries.filter(e => e.type === 'habit' && e.habitName === habitName);

  const streak = useMemo(() => {
    if (habitEntries.length === 0) return 0;
    const sorted = [...habitEntries]
      .map(e => startOfDay(parseISO(e.timestamp)))
      .sort((a, b) => b - a);
    let count = 0, check = startOfDay(new Date());
    for (const date of sorted) {
      const diff = differenceInCalendarDays(check, date);
      if (diff <= 1) { count++; check = date; }
      else break;
    }
    return count;
  }, [habitEntries]);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const done = habitEntries.some(e => parseISO(e.timestamp).toISOString().split('T')[0] === dayStr);
      days.push({ day: dayStr.slice(5), value: done ? 1 : 0 });
    }
    return days;
  }, [habitEntries]);

  const todayDone = habitEntries.some(e => isToday(parseISO(e.timestamp)));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-2">{habitName}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-indigo-400">{streak}</span>
        <span className="text-zinc-500 text-sm">day streak</span>
      </div>

      <div className="h-16 my-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="day" hide />
            <YAxis domain={[0, 1]} hide />
            <Tooltip contentStyle={{ background: '#27272a', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={() => logHabit(habitName)}
        disabled={todayDone}
        className={`w-full py-2 rounded-lg text-sm font-medium transition ${
          todayDone
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        }`}
      >
        {todayDone ? '✓ Done Today' : 'Mark Done'}
      </button>
    </div>
  );
}