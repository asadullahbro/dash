import { useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isToday,
} from 'date-fns';
import useEntryStore from '../store/entryStore';

export default function MonthGrid() {
  const entries = useEntryStore(s => s.entries);
  const [selectedDay, setSelectedDay] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Gather per‑day activity types (yes / no / skip)
  const dayActivity = useMemo(() => {
    const map = {};
    days.forEach(day => {
      const dayEntries = entries.filter(e =>
        isSameDay(parseISO(e.timestamp), day)
      );
      const hasYes = dayEntries.some(e => e.value === true);
      const hasNo = dayEntries.some(e => e.value === false);
      const hasSkip = dayEntries.some(e => e.skipped);
      map[day.toISOString()] = { hasYes, hasNo, hasSkip, entries: dayEntries };
    });
    return map;
  }, [days, entries]);

  const handleDayClick = (day) => {
    setSelectedDay(prev =>
      prev && isSameDay(prev, day) ? null : day
    );
  };

  const selectedDayData = selectedDay
    ? dayActivity[selectedDay.toISOString()]
    : null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-stone-400 hover:text-stone-600 transition"
      >
        {format(today, 'MMMM yyyy')} {expanded ? '▾' : '▸'}
      </button>

      {expanded && (
        <div className="mt-2">
          {/* Day-of‑week labels – minimal */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-stone-400 mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const isTodayDate = isToday(day);
              const dayKey = day.toISOString();
              const { hasYes, hasNo, hasSkip } = dayActivity[dayKey] || {};
              const dayNumber = format(day, 'd');

              return (
                <button
                  key={dayKey}
                  onClick={() => handleDayClick(day)}
                  className={`
                    w-8 h-8 rounded-full flex flex-col items-center justify-center
                    text-xs font-medium transition
                    ${isTodayDate ? 'ring-1 ring-stone-300' : ''}
                    hover:bg-stone-50
                  `}
                  title={format(day, 'MMM d')}
                >
                  <span className="leading-none">{dayNumber}</span>
                  {/* Activity dots – only show if any entry exists */}
                  <span className="flex gap-0.5 mt-0.5">
                    {hasYes && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {hasNo && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                    {hasSkip && <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Day detail popup */}
          {selectedDayData && (
            <div className="mt-2 p-2 bg-stone-50 border border-stone-200 rounded-md text-sm">
              <p className="text-xs text-stone-500 mb-1">
                {format(selectedDay, 'MMM d')}
              </p>
              {selectedDayData.entries.length === 0 ? (
                <p className="text-stone-300 text-xs">no entries</p>
              ) : (
                <ul className="space-y-1">
                  {selectedDayData.entries.map(e => (
                    <li key={e.id} className="flex items-center gap-2 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          e.value === true
                            ? 'bg-emerald-400'
                            : e.value === false
                            ? 'bg-rose-400'
                            : 'bg-stone-300'
                        }`}
                      />
                      <span className="text-stone-600">{e.habitName}</span>
                      {e.reason && (
                        <span className="text-stone-400 italic ml-auto">
                          ({e.reason})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}