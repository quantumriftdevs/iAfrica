import React from 'react';
import StatsCard from '../../components/student/StatsCard';
import DataTable from '../../components/student/DataTable';
import { Search } from 'lucide-react';

const StudentDashboard = () => {
  const stats = [
    { title: 'Enrolled Courses', value: '3' },
    { title: 'Upcoming Classes', value: '2' },
    { title: 'Certificates', value: '1' },
    { title: 'Progress', value: '72%' }
  ];

  const myCourses = [
    { id: 1, title: 'Web Development', progress: '80%' },
    { id: 2, title: 'UI Design', progress: '60%' }
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'progress', label: 'Progress' }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>

        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500"><Search size={16} /> Find Courses</button>
          <button className="px-4 py-2 border border-gray-200 rounded hover:bg-gray-50">My Profile</button>
        </div>
      </div>

      <div className="gap-6">
        <main className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <StatsCard key={i} title={s.title} value={s.value} />
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">My Courses</h3>
            <DataTable columns={columns} data={myCourses} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
