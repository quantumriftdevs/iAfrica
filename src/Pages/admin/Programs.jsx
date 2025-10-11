import React from 'react';
import DataTable from '../../components/admin/DataTable';

const ProgramsPage = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'courses', label: 'Courses' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Programs</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  );
};

export default ProgramsPage;
