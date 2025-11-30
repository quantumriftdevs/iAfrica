import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  BookOpen,
  School,
  Award,
  CreditCard,
  LogOut
} from 'lucide-react';
import { SiteBrand } from '../Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/ToastContext';

const StudentSidebar = () => {
  const location = useLocation();

  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/programs', label: 'Programs', icon: BookOpen },
    { to: '/my-courses', label: 'My Courses', icon: BookOpen },
    { to: '/my-classes', label: 'My Classes', icon: School },
    { to: '/my-certificates', label: 'Certificates', icon: Award },
    { to: '/payments', label: 'Payments', icon: CreditCard }
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl py-6 px-4 h-full min-h-[100dvh] lg:min-h-screen flex flex-col">
      <nav className="space-y-1 flex flex-col h-full overflow-y-auto">
        <div className="mb-8">
          <SiteBrand className="flex items-center space-x-3" />
        </div>

        {items.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
        <div className="mt-auto pt-6 border-t border-purple-700">
          <LogoutButton />
        </div>
      </nav>
    </aside>
  );
};

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handle = async () => {
    try {
      await logout();
    } catch {
      // ignore errors
    }
    try {
      localStorage.removeItem('iafrica-token');
    } catch {
      // ignore errors
    }
    toast.push('Logged out', { type: 'success' });
    navigate('/login');
  };

  return (
    <button onClick={handle} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-300 hover:bg-purple-700/50 hover:text-white transition-all duration-200 group font-medium text-sm">
      <LogOut size={20} className="text-gray-400 group-hover:text-white" />
      <span>Logout</span>
    </button>
  );
};

export default StudentSidebar;
