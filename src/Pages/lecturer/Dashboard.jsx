import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/lecturer/StatsCard';
import DataTable from '../../components/lecturer/DataTable';
import { PlusSquare } from 'lucide-react';
import { getCourses, getPrograms } from '../../utils/api';

const LecturerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'students', label: 'Students' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [coursesRes, programsRes] = await Promise.allSettled([getCourses(), getPrograms()]);
        if (!mounted) return;

        const coursesArray = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];
        const programsArray = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];

        setCourses(coursesArray);
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
    { title: 'My Classes', value: loading ? '—' : (courses.length || '0') },
    { title: 'Students', value: '—' },
    { title: 'Active Courses', value: loading ? '—' : (programs.length || '0') },
    { title: 'Pending Grades', value: '—' }
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
            {loading ? (
              <div className="py-8 text-center">Loading classes...</div>
            ) : courses.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No classes to display</div>
            ) : (
              <DataTable columns={columns} data={courses.map((c, idx) => ({ id: c.id || idx+1, title: c.name || c.title || 'Untitled', schedule: c.schedule || '-', students: c.students || 0 }))} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerDashboard;
