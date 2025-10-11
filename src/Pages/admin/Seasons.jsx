import React from 'react';
import DataTable from '../../components/admin/DataTable';

const SeasonsPage = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'start', label: 'Start' }
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Seasons</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  );
};

export default SeasonsPage;
