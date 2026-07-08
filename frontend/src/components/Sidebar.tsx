import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { disconnectSocket } from '../services/socket';
import { RootState } from '../store';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Calendar, 
  LogOut, 
  Bot 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    disconnectSocket();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Leads', path: '/leads', icon: Target },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
  ];

  return (
    <aside className="w-64 glass-panel h-screen flex flex-col justify-between p-6 fixed left-0 top-0">
      <div className="flex flex-col gap-8">
        {/* Title Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500 rounded-lg text-white shadow-md">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Copilot Engine
            </h1>
            <span className="text-xs text-brand-400 font-medium">Digital Employee v1</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Profile Box */}
      <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold font-sans">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</h3>
            <span className="text-xs text-brand-400 font-semibold capitalize bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-sm font-medium transition-all duration-150"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
