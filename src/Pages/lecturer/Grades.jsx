import React from 'react';
import DataTable from '../../components/lecturer/DataTable';

const LecturerGrades = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'student', label: 'Student' },
    { key: 'course', label: 'Course' },
    { key: 'grade', label: 'Grade' }
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Grades Management</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  );
};

export default LecturerGrades;
