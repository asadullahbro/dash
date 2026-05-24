import { useState } from 'react';
import useEntryStore from '../store/entryStore';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function NotesWidget() {
  const entries = useEntryStore((s) => s.entries);
  const addNote = useEntryStore((s) => s.addNote);
  const [text, setText] = useState('');

  const notes = entries.filter(e => e.type === 'note').sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addNote(text.trim());
      setText('');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
      <h3 className="text-lg font-semibold mb-3">Notes</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a quick note..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition">
          Add
        </button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
        {notes.slice(0, 10).map((note) => (
          <div key={note.id} className="flex justify-between items-start">
            <p className="text-zinc-300">{note.text}</p>
            <span className="text-zinc-600 text-xs ml-2 whitespace-nowrap">
              {formatDistanceToNow(parseISO(note.timestamp), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}