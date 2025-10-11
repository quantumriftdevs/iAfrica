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

const AdminSidebar = () => {
  const location = useLocation();
  
  const items = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/programs', label: 'Programs', icon: GraduationCap },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/classes', label: 'Classes', icon: School },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/certificates', label: 'Certificates', icon: Award },
    { to: '/admin/seasons', label: 'Seasons', icon: CalendarDays }
  ];

  return (
    <aside className="w-64 bg-white shadow-sm py-6 px-4 h-full min-h-[100dvh] lg:min-h-screen">
      <nav className="space-y-1 flex flex-col h-full overflow-y-auto mt-2">
        <SiteBrand />

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
      </nav>
    </aside>
  );
};

export default AdminSidebar;
