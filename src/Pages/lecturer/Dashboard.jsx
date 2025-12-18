import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/lecturer/StatsCard';
import DataTable from '../../components/lecturer/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { getLecturerClasses, getPrograms } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { Users, BookOpen, Clock } from 'lucide-react';

const LecturerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const { user } = useAuth();

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'scheduledDate',
      label: 'Schedule',
      render: (v, row) => {
        return formatDate(v || row.scheduledDate || row.startDate || row.start || row.schedule) || '-';
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
    { title: 'Students', value: '—', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Courses', value: loading ? '—' : (programs.length || '0'), icon: BookOpen, color: 'bg-orange-500' },
    { title: 'Pending Grades', value: '—', icon: Clock, color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Lecturer Dashboard</h2>
          <p className="text-gray-600">Manage your classes and track student progress</p>
        </div>

        <main className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
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
              <h3 className="text-xl font-bold text-gray-900">My Classes</h3>
              <p className="text-gray-600 text-sm mt-1">Classes you're teaching this semester</p>
            </div>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
              </div>
            ) : classes.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No classes to display</p>
                <p className="text-gray-500 text-sm mt-2">Classes will appear here once assigned</p>
              </div>
            ) : (
              <DataTable columns={columns} data={classes.map((c, idx) => ({ id: c._id || idx+1, title: c.title || c.name || c.name || c.courseName || 'Untitled', scheduledDate: c.scheduledDate || c.schedule || c.startDate || c.start || '-', status: c.status || c.state || '-' }))} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerDashboard;
