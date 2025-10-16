import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/student/StatsCard';
import DataTable from '../../components/student/DataTable';
import { Search } from 'lucide-react';
import { getCourses, getCertificates } from '../../utils/api';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'progress', label: 'Progress' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [coursesRes, certificatesRes] = await Promise.allSettled([getCourses(), getCertificates()]);
        if (!mounted) return;

        const coursesArray = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];
        const certsArray = (certificatesRes.status === 'fulfilled' && Array.isArray(certificatesRes.value)) ? certificatesRes.value : [];

        console.log({ coursesRes, certificatesRes });

        setCourses(coursesArray);
        setCertificates(certsArray);
      } catch (e) {
        console.error('Student dashboard fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const stats = [
    { title: 'Enrolled Courses', value: loading ? '—' : (courses.length || '0') },
    { title: 'Upcoming Classes', value: '—' },
    { title: 'Certificates', value: loading ? '—' : (certificates.length || '0') },
    { title: 'Progress', value: '—' }
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
            {loading ? (
              <div className="py-8 text-center">Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No courses to display</div>
            ) : (
              <DataTable columns={columns} data={courses.map((c, idx) => ({ id: c.id || idx+1, title: c.name || c.title || 'Untitled', progress: c.progress || '0%' }))} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
