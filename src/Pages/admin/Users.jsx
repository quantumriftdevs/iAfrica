import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getUsers, createUser, updateUser, formatApiError } from '../../utils/api';
import { X, Plus, Users as UsersIcon } from 'lucide-react';
import { useToast } from '../../components/ui/ToastContext';

const UsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getUsers();
        if (!mounted) return;
        setUsers(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Users fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // create user modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const toast = useToast();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCreate = async (e) => {
      e.preventDefault();
      if (!form.name || !form.email) {
        toast.push('Name and email are required', { type: 'error' });
        return;
      }
      setCreating(true);
      try {
        const payload = { name: form.name, email: form.email, password: form.password || undefined, role: form.role };
        await createUser(payload);
        const res = await getUsers();
        setUsers(Array.isArray(res) ? res : []);
        setForm({ name: '', email: '', password: '', role: 'student' });
        setIsModalOpen(false);
        toast.push('User created successfully', { type: 'success' });
      } catch (err) {
        console.error('Create user error', err);
        toast.push(formatApiError(err) || 'Failed to create user', { type: 'error' });
      } finally {
        setCreating(false);
      }
    };

    // Edit user state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [updating, setUpdating] = useState(false);

    const handleEditChange = (e) => setEditingUser({ ...editingUser, [e.target.name]: e.target.value });

    const handleUpdate = async (e) => {
      e.preventDefault();
      if (!editingUser || !editingUser._id) return;
      setUpdating(true);
      try {
        const payload = { name: editingUser.name, email: editingUser.email, role: editingUser.role };
        await updateUser(editingUser._id, payload);
        const res = await getUsers();
        setUsers(Array.isArray(res) ? res : []);
        setIsEditModalOpen(false);
        setEditingUser(null);
        toast.push('User updated successfully', { type: 'success' });
      } catch (err) {
        console.error('Update user error', err);
        toast.push(formatApiError(err) || 'Failed to update user', { type: 'error' });
      } finally {
        setUpdating(false);
      }
    };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'email', label: 'Email' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Users Management</h2>
            <p className="text-gray-600">Manage all users in your platform</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl">
            <Plus size={18} /> Create User
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Users</h3>
            <p className="text-gray-600 text-sm mt-1">Complete list of registered users</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <UsersIcon size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No users found</p>
            </div>
          ) : (
            <DataTable columns={columns} data={users} />
          )}
        </div>

        {/* Create User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="relative p-6 border-b border-gray-100">
                <h4 className="text-2xl font-bold text-gray-900">Create User</h4>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password (optional)</label>
                  <input name="password" value={form.password} onChange={handleChange} placeholder="••••••••" type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select name="role" value={form.role} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                  <button type="submit" disabled={creating} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{creating ? 'Creating...' : 'Create User'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="relative p-6 border-b border-gray-100">
                <h4 className="text-2xl font-bold text-gray-900">Edit User</h4>
                <button onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-500" /></button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input name="name" value={editingUser.name} onChange={handleEditChange} placeholder="John Doe" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input name="email" value={editingUser.email} onChange={handleEditChange} placeholder="john@example.com" type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select name="role" value={editingUser.role} onChange={handleEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                  <button type="submit" disabled={updating} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{updating ? 'Updating...' : 'Update User'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
