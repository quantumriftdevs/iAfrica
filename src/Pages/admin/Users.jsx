import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getUsers } from '../../utils/api';

const UsersPage = () => {
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">All Users</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No users found</div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </div>
    </div>
  );
};

export default UsersPage;
