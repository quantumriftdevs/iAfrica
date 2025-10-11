import React from 'react';
import DataTable from '../../components/lecturer/DataTable';

const LecturerClasses = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'students', label: 'Students' }
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Lecturer Classes</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  );
};

export default LecturerClasses;
