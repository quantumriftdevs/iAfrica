import React from 'react';
import DataTable from '../../components/lecturer/DataTable';

const LecturerResources = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'course', label: 'Course' },
    { key: 'uploaded', label: 'Uploaded' }
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Resources</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  );
};

export default LecturerResources;
