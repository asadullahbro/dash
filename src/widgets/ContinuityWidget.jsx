import { useMemo } from 'react';
import useEntryStore from '../store/entryStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfDay, subDays, format } from 'date-fns';

export default function ContinuityWidget() {
  const entries = useEntryStore((s) => s.entries);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const count = entries.filter(e => {
        const entryDate = startOfDay(new Date(e.timestamp));
        return entryDate.getTime() === date.getTime();
      }).length;
      days.push({ date: format(date, 'MMM dd'), score: count });
    }
    return days;
  }, [entries]);

  const totalActions = entries.length;
  const activeDays = new Set(entries.map(e => startOfDay(new Date(e.timestamp)).toISOString())).size;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-1">Continuity</h3>
      <p className="text-zinc-400 text-sm mb-4">Last 30 days</p>

      <div className="flex gap-4 mb-4">
        <div>
          <p className="text-2xl font-bold text-white">{totalActions}</p>
          <p className="text-xs text-zinc-500">entries</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{activeDays}</p>
          <p className="text-xs text-zinc-500">active days</p>
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
            />
            <Area type="monotone" dataKey="score" stroke="#818cf8" fill="url(#colorScore)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}