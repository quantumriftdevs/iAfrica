import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  School, 
  CreditCard, 
  Award,
  CalendarDays
} from 'lucide-react';
import { SiteBrand } from '../Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/ToastContext';

const AdminSidebar = () => {
  const location = useLocation();
  
  const items = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/programs', label: 'Programs', icon: GraduationCap },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/classes', label: 'Classes', icon: School },
    { to: '/admin/grades', label: 'Grades', icon: GraduationCap },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/certificates', label: 'Certificates', icon: Award },
    { to: '/admin/seasons', label: 'Seasons', icon: CalendarDays }
  ];

  return (
    <aside className="w-64 bg-white shadow-sm py-6 px-4 h-full min-h-[100dvh] lg:min-h-screen">
      <nav className="space-y-1 flex flex-col h-full overflow-y-auto mt-2">
        <SiteBrand />
        {/* Logout area */}
        

        {items.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150
                ${isActive 
                  ? 'bg-green-50 text-green-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-green-600' : 'text-gray-400'} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        <div className="mt-auto">
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
    <button onClick={handle} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-50">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
      <span className="font-medium">Logout</span>
    </button>
  );
};

export default AdminSidebar;
