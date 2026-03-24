import React from 'react';
import { Bell, Search, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass mb-6 z-10 sticky top-0" style={{ height: '72px', padding: '0 1.5rem' }}>
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={toggleSidebar} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-700" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-gray-200 mx-1"></div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
