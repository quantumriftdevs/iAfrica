import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/student/StatsCard';
import DataTable from '../../components/student/DataTable';
import { Search, BookOpen, Award, TrendingUp, Users as UsersIcon } from 'lucide-react';
import { getCourses, getUserCertificates } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

import {
  deriveEnrolledProgramIds,
  filterCoursesByProgramIds,
  
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
    { title: 'Certificates Earned', value: loading ? '—' : (certificates.length || '0'), icon: Award, color: 'bg-yellow-500' },
    { title: 'Progress', value: '—', icon: TrendingUp, color: 'bg-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Student Dashboard</h2>
            <p className="text-gray-600">Welcome back! Continue your learning journey.</p>
          </div>

          <div className="flex items-center space-x-3 gap-3">
            <a href="/Courses" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl">
              <Search size={18} /> Find Courses
            </a>
            <a href="/profile" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 font-semibold">My Profile</a>
          </div>
        </div>

        <div className="gap-6 w-full">
          <main className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {loading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              ) : (
                stats.map((s, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">{s.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
                      </div>
                      <div className={`${s.color} p-3 rounded-full text-white`}>
                        <s.icon size={24} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">My Courses</h3>
                <p className="text-gray-600 text-sm mt-1">Courses you're currently enrolled in</p>
              </div>
              {loading ? (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
                </div>
              ) : (() => {
                const derived = deriveEnrolledProgramIds(user);
                const programIds = Array.from(new Set([...(derived || [])]));
                if (programIds.length === 0) return (
                  <div className="py-12 text-center">
                    <UsersIcon size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">You have not enrolled in any programs yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start exploring programs to begin learning</p>
                  </div>
                );
                const matched = filterCoursesByProgramIds(courses, programIds);

                if (matched.length === 0) return (
                  <div className="py-12 text-center">
                    <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No courses available</p>
                    <p className="text-gray-500 text-sm mt-2">Check back soon for new courses</p>
                  </div>
                );

                return <DataTable columns={columns} data={matched.map((c, idx) => ({ id: c._id || idx+1, title: c.name || c.title || 'Untitled', progress: c.progress || '0%' }))} />;
              })()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
