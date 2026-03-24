import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, FileSpreadsheet, ClipboardCheck, Settings, LogOut
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Courses', path: '/courses' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
  { icon: FileSpreadsheet, label: 'Marks & Reports', path: '/reports' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-screen text-white flex flex-col transition-all duration-300 z-20 shadow-xl shrink-0" style={{ backgroundColor: '#1e1b4b' }}>
      <div className="p-6 flex items-center justify-center border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #4f46e5, #ec4899)' }}>
            <span className="font-bold text-xl text-white">SP</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide">SPMS</h1>
            <p className="text-xs text-indigo-300">{user?.role === 'principal' ? 'Principal' : 'Teacher'} Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border-l-4 border-indigo-500'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700/50 space-y-2">
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-gray-300 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
