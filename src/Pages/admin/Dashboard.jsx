import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import { SiteBrand } from '../../components/Header';
import { PlusSquare } from 'lucide-react';
import { getPrograms, getLecturers } from '../../utils/api';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, lecturers: 0, programs: 0, revenue: 0 });
  const [users, setUsers] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'email', label: 'Email' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [programsRes, lecturersRes] = await Promise.allSettled([
          getPrograms(),
          getLecturers()
        ]);

        if (!mounted) return;

        // compute simple stats from results; if result is rejected or empty, keep 0 and show empty states later
        const programs = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];
        const lecturers = (lecturersRes.status === 'fulfilled' && Array.isArray(lecturersRes.value)) ? lecturersRes.value : [];
        setStats({
          students: 0, // students count isn't provided by current API endpoints, set 0 and let UI show empty state
          lecturers: lecturers.length,
          programs: programs.length,
          revenue: 0
        });

        // For users table show lecturers as users for now
        setUsers(lecturers.map((l, idx) => ({ id: l.id || idx + 1, name: l.name || l.fullName || 'N/A', role: 'Lecturer', email: l.email || '' })));
      } catch (e) {
        // swallow - UI will show empty states when arrays are empty
        console.error('Admin dashboard data fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

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
            {loading ? (
              <div className="col-span-4 text-center py-8">Loading stats...</div>
            ) : (
              [
                { title: 'Active Students', value: stats.students || '—' },
                { title: 'Lecturers', value: stats.lecturers || '—' },
                { title: 'Programs', value: stats.programs || '—' },
                { title: 'Revenue', value: stats.revenue ? `$${stats.revenue}` : '—' }
              ].map((s, i) => (
                <StatsCard key={i} title={s.title} value={s.value} />
              ))
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
            {loading ? (
              <div className="py-8 text-center">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No users to display</div>
            ) : (
              <DataTable columns={columns} data={users} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
