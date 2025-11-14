import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/student/StatsCard';
import DataTable from '../../components/student/DataTable';
import { Search } from 'lucide-react';
import { getCourses, getUserCertificates } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

import {
  deriveEnrolledProgramIds,
  filterCoursesByProgramIds,
  getStoredProgramIds,
} from '../../utils/helpers';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  
  
  const { user } = useAuth();
  

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'progress', label: 'Progress' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const [coursesRes, certificatesRes] = await Promise.allSettled([getCourses(), getUserCertificates()]);
        if (!mounted) return;

        const coursesArray = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];
        const certsArray = (certificatesRes.status === 'fulfilled' && Array.isArray(certificatesRes.value)) ? certificatesRes.value : [];
  // we don't show raw classes on the dashboard; keep courses & certificates
  setCourses(coursesArray);
  setCertificates(certsArray);
      } catch {
        // ignore errors
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const stats = [
    // compute effective program ids (stored + derived) and filter courses/classes accordingly
    // (() => {})(),
    // { title: 'Enrolled Courses', value: loading ? '—' : (Array.isArray(courses) ? (() => {
    //     const stored = getStoredProgramIds();
    //     const derived = deriveEnrolledProgramIds(user);
    //     const programIds = Array.from(new Set([...(stored || []), ...(derived || [])]));
    //     return programIds.length ? filterCoursesByProgramIds(courses, programIds).length : 0;
    //   })() : '—') },
    //   { title: 'Upcoming Classes', value: loading ? '—' : (() => {
    //     try {
    //       const stored = getStoredProgramIds();
    //       const derived = deriveEnrolledProgramIds(user);
    //       const programIds = Array.from(new Set([...(stored || []), ...(derived || [])]));
    //       if (!programIds.length) return 0;
    //       const matchedCourses = filterCoursesByProgramIds(courses, programIds);
    //       const courseIds = matchedCourses.map(c => String(c._id || c.id)).filter(Boolean);
    //       const matchedClasses = filterClassesByProgramOrCourseIds(classes, [], courseIds);
    //       return matchedClasses.length || 0;
    //     } catch {
    //       return '—';
    //     }
    //   })() },
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
              const stored = getStoredProgramIds();
              const derived = deriveEnrolledProgramIds(user);
              const programIds = Array.from(new Set([...(stored || []), ...(derived || [])]));
              if (programIds.length === 0) return <div className="py-8 text-center text-gray-500">You have not enrolled in any programs yet</div>;
              const matched = filterCoursesByProgramIds(courses, programIds);

              if (matched.length === 0) return <div className="py-8 text-center text-gray-500">No courses available for your enrolled programs</div>;

              return <DataTable columns={columns} data={matched.map((c, idx) => ({ id: c._id || idx+1, title: c.name || c.title || 'Untitled', progress: c.progress || '0%' }))} />;
            })()}
          </div>
          {/* Programs moved to the student-only Programs page */}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
