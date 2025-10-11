import React from 'react';
import DataTable from '../../components/admin/DataTable';

const UsersPage = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'email', label: 'Email' }
  ];

  const data = [];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">All Users</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default UsersPage;
