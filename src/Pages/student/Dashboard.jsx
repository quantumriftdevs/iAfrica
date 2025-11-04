import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/student/StatsCard';
import DataTable from '../../components/student/DataTable';
import { Search } from 'lucide-react';
import { getCourses, getCertificates, getPrograms } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { deriveEnrolledProgramIds, filterCoursesByProgramIds } from '../../utils/helpers';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [programs, setPrograms] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'progress', label: 'Progress' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const [coursesRes, certificatesRes, programsRes] = await Promise.allSettled([getCourses(), getCertificates(), getPrograms()]);
        if (!mounted) return;

  const coursesArray = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];
  const certsArray = (certificatesRes.status === 'fulfilled' && Array.isArray(certificatesRes.value)) ? certificatesRes.value : [];
  const programsArray = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];

  console.log({ coursesRes, certificatesRes, programsRes });

  setCourses(coursesArray);
  setCertificates(certsArray);
  setPrograms(programsArray);
      } catch (e) {
        console.error('Student dashboard fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const stats = [
  { title: 'Enrolled Courses', value: loading ? '—' : (Array.isArray(courses) ? (deriveEnrolledProgramIds(user).length ? filterCoursesByProgramIds(courses, deriveEnrolledProgramIds(user)).length : 0) : '—') },
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
            ) : (() => {
              const programIds = deriveEnrolledProgramIds(user);
              if (programIds.length === 0) return <div className="py-8 text-center text-gray-500">You have not enrolled in any programs yet</div>;
              const matched = filterCoursesByProgramIds(courses, programIds);
              if (matched.length === 0) return <div className="py-8 text-center text-gray-500">No courses available for your enrolled programs</div>;
              return <DataTable columns={columns} data={matched.map((c, idx) => ({ id: c._id || idx+1, title: c.name || c.title || 'Untitled', progress: c.progress || '0%' }))} />;
            })()}
          </div>
          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <h3 className="text-lg font-semibold mb-4">Explore Programs</h3>
            {programs.length === 0 ? (
              <div className="py-6 text-center text-gray-500">No programs available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {programs.slice(0,3).map((p, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{p.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{p.description}</p>
                    <button onClick={() => navigate(`/Enroll?programId=${encodeURIComponent(p._id || p.id)}`, { state: { program: p } })} className="px-3 py-2 bg-emerald-600 text-white rounded">Enroll</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
