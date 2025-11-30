import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    // Prevent body scroll when mobile sidebar is open
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex relative h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 rounded-lg bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all"
      >
        {isSidebarOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
      </button>

      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:relative top-0 left-0 bottom-0 z-40 lg:h-auto overflow-y-auto
        ${!isSidebarOpen && 'lg:block hidden'}
      `}>
        <AdminSidebar />
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 lg:hidden z-30 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-h-screen flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
