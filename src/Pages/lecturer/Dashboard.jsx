import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/lecturer/StatsCard';
import DataTable from '../../components/lecturer/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { getLecturerClasses, getPrograms } from '../../utils/api';

const LecturerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const { user } = useAuth();
  // Lecturer dashboard no longer contains class creation — moved to admin flow

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'scheduledDate',
      label: 'Schedule',
      render: (v, row) => {
        // prefer scheduledDate but handle alternative fields
        return row.scheduledDate || row.startDate || row.start || row.schedule || '-';
      }
    },
    { key: 'status', label: 'Status' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const lecturerId = user?._id;
        const [classesRes, programsRes] = await Promise.allSettled([getLecturerClasses(lecturerId), getPrograms()]);
        if (!mounted) return;
        const classesArray = (classesRes.status === 'fulfilled' && Array.isArray(classesRes.value)) ? classesRes.value : [];
        const programsArray = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];

        setClasses(classesArray);
        setPrograms(programsArray);
      } catch (e) {
        console.error('Lecturer dashboard fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const stats = [
    { title: 'Students', value: '—' },
    { title: 'Active Courses', value: loading ? '—' : (programs.length || '0') },
    { title: 'Pending Grades', value: '—' }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-6">Lecturer Dashboard</h2>

        <div className="flex items-center space-x-3">
          {/* Class creation is managed in the admin area now */}
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
            {loading ? (
              <div className="py-8 text-center">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No classes to display</div>
            ) : (
              <DataTable columns={columns} data={classes.map((c, idx) => ({ id: c._id || idx+1, title: c.title || c.name || c.name || c.courseName || 'Untitled', scheduledDate: c.scheduledDate || c.schedule || c.startDate || c.start || '-', status: c.status || c.state || '-' }))} />
            )}
          </div>
        </main>
      </div>

      {/* Class creation moved to admin. */}
    </div>
  );
};

export default LecturerDashboard;
