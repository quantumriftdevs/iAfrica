import React from 'react';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import { SiteBrand } from '../../components/Header';
import { Bell, PlusSquare, FileText, Users } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { title: 'Active Students', value: '1,024' },
    { title: 'Lecturers', value: '48' },
    { title: 'Programs', value: '32' },
    { title: 'Revenue', value: '$12,340' }
  ];

  const users = [
    { id: 1, name: 'Ada Lovelace', role: 'Student', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', role: 'Lecturer', email: 'alan@example.com' }
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'email', label: 'Email' }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500"><PlusSquare size={16} /> Create User</button>
        </div>
      </div>

      <div className="gap-6">
        <main className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <StatsCard key={i} title={s.title} value={s.value} />
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
            <DataTable columns={columns} data={users} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
