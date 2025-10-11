import React from 'react';
import StatsCard from '../../components/lecturer/StatsCard';
import DataTable from '../../components/lecturer/DataTable';
import { PlusSquare } from 'lucide-react';

const LecturerDashboard = () => {
  const stats = [
    { title: 'My Classes', value: '6' },
    { title: 'Students', value: '240' },
    { title: 'Active Courses', value: '4' },
    { title: 'Pending Grades', value: '12' }
  ];

  const classes = [
    { id: 1, title: 'Intro to React', schedule: 'Mon 10:00', students: 40 },
    { id: 2, title: 'Advanced Node', schedule: 'Wed 14:00', students: 32 }
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'students', label: 'Students' }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-6">Lecturer Dashboard</h2>

        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500"><PlusSquare size={16} /> Create Class</button>
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
            <h3 className="text-lg font-semibold mb-4">My Classes</h3>
            <DataTable columns={columns} data={classes} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerDashboard;
