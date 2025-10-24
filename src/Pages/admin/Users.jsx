import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getUsers, createUser, updateUser, formatApiError } from '../../utils/api';
import { X } from 'lucide-react';
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
        toast.push('User created', { type: 'success' });
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

    // const openEdit = (user) => {
    //   setEditingUser({ id: user._id || user._id, name: user.name || '', email: user.email || '', role: user.role || 'student' });
    //   setIsEditModalOpen(true);
    // };

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
        toast.push('User updated', { type: 'success' });
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
    { key: 'email', label: 'Email' },
    // { key: 'actions', label: 'Actions', render: (_val, row) => (
    //   <div className="flex items-center gap-2">
    //     <button onClick={() => openEdit(row)} className="text-blue-600 hover:underline">Edit</button>
    //     <button onClick={() => handleDelete(row._id || row._id)} className="text-red-600 hover:underline">Delete</button>
    //   </div>
    // ) }
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">All Users</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Users</h3>
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded">Create User</button>
        </div>
        {loading ? (
          <div className="py-8 text-center">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No users found</div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Create User</h4>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 gap-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="p-3 border rounded" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="p-3 border rounded" />
              <input name="password" value={form.password} onChange={handleChange} placeholder="Password (optional)" className="p-3 border rounded" />
              <select name="role" value={form.role} onChange={handleChange} className="p-3 border rounded">
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={creating} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{creating ? 'Creating...' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Edit User</h4>
              <button onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 gap-4">
              <input name="name" value={editingUser.name} onChange={handleEditChange} placeholder="Full name" className="p-3 border rounded" />
              <input name="email" value={editingUser.email} onChange={handleEditChange} placeholder="Email" className="p-3 border rounded" />
              <select name="role" value={editingUser.role} onChange={handleEditChange} className="p-3 border rounded">
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={updating} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{updating ? 'Updating...' : 'Update User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
