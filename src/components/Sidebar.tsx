import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, BookOpen, Archive, Search, Circle, LogOut } from 'lucide-react';
import { useApp } from '../context';

const quote = {
  text: 'The quieter you become, the clearer you see.',
};

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useApp();

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Overview' },
    { to: '/journal', icon: BookOpen, label: 'Journal' },
    { to: '/archive', icon: Archive, label: 'Archive' },
    { to: '/search', icon: Search, label: 'Search' },
  ];

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'Y';

  return (
    <aside className="w-[200px] min-w-[200px] h-screen flex flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-700 tracking-wide">Reflect</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/' || location.pathname.startsWith('/record')
            : location.pathname === to;

          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Quote */}
      <div className="px-5 pb-5">
        <div className="mb-4">
          <span className="text-gray-200 text-2xl leading-none">"</span>
          <p className="text-xs text-gray-400 leading-relaxed mt-1">{quote.text}</p>
        </div>

        {/* User + Sign out */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-gray-500">{userInitial}</span>
            </div>
            <span className="text-xs text-gray-600 truncate max-w-[80px]">
              {user?.email ?? 'You'}
            </span>
          </div>

          <button
            onClick={() => signOut()}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
