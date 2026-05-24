export default function Sidebar({ user, onLogout, onClose }) {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white">dash</h2>
        {onClose && (
          <button onClick={onClose} className="text-zinc-400">✕</button>
        )}
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 mb-6">
        {user?.picture ? (
          <img src={user.picture} alt="" className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <p className="text-white font-medium text-sm">{user?.name}</p>
          <p className="text-zinc-500 text-xs">{user?.email}</p>
        </div>
      </div>

      {/* Navigation (simple for now) */}
      <nav className="flex-1 space-y-1">
        <SidebarItem label="Dashboard" active />
        <SidebarItem label="Insights" />
        <SidebarItem label="Settings" />
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-2 text-sm text-zinc-400 hover:text-white transition text-left"
      >
        Sign out
      </button>
    </div>
  );
}

function SidebarItem({ label, active }) {
  return (
    <a
      href="#"
      className={`block px-3 py-2 rounded-lg text-sm ${
        active
          ? 'bg-zinc-800 text-white'
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
      }`}
    >
      {label}
    </a>
  );
}