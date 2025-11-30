import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import { PlusSquare, Users, BookOpen, DollarSign, UserCheck, X, Mail, Phone } from 'lucide-react';
import { getPrograms, getLecturers, createUser, formatApiError } from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, lecturers: 0, programs: 0, revenue: 0 });
  const [users, setUsers] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'lecturer', password: '' });

  const columns = [
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

        const programs = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];
        const lecturers = (lecturersRes.status === 'fulfilled' && Array.isArray(lecturersRes.value)) ? lecturersRes.value : [];
        setStats({
          students: 0,
          lecturers: lecturers.length,
          programs: programs.length,
          revenue: 0
        });

        setUsers(lecturers.map((l, idx) => ({ id: l._id || idx + 1, name: l.name || l.fullName || 'N/A', role: 'Lecturer', email: l.email || '' })));
      } catch (e) {
        console.error('Admin dashboard data fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
            <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl">
            <PlusSquare size={18} /> Create User
          </button>
        </div>

        <main className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              [
                { title: 'Active Students', value: stats.students || '0', icon: Users, color: 'bg-blue-500' },
                { title: 'Lecturers', value: stats.lecturers || '0', icon: UserCheck, color: 'bg-purple-500' },
                { title: 'Programs', value: stats.programs || '0', icon: BookOpen, color: 'bg-orange-500' },
                { title: 'Revenue', value: stats.revenue ? `$${stats.revenue}` : '$0', icon: DollarSign, color: 'bg-green-500' }
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{s.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
                    </div>
                    <div className={`${s.color} p-3 rounded-full text-white`}>
                      <s.icon size={24} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Recent Users</h3>
              <p className="text-gray-600 text-sm mt-1">Latest user registrations and assignments</p>
            </div>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No users to display</p>
              </div>
            ) : (
              <DataTable columns={columns} data={users} />
            )}
          </div>
        </main>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create User</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" type="email" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="lecturer">Lecturer</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button disabled={creating} onClick={async () => {
                setCreating(true);
                try {
                  const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, password: form.password };
                  await createUser(payload);
                  setIsCreateOpen(false);
                  setForm({ name: '', email: '', phone: '', role: 'lecturer', password: '' });
                  toast.push('User created successfully', { type: 'success' });
                } catch (err) {
                  console.error('Create user failed', err);
                  toast.push(formatApiError(err) || 'Failed to create user', { type: 'error' });
                } finally {
                  setCreating(false);
                }
              }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{creating ? 'Creating...' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
