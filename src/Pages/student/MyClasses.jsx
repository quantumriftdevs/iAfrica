import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getClasses, getCourses } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { deriveEnrolledProgramIds, filterClassesByProgramOrCourseIds, filterCoursesByProgramIds, formatDate } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastContext';
import { Play, BookOpen } from 'lucide-react';

const MyClasses = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'schedule', label: 'Schedule' }
  ];

  const colsWithActions = [
    ...columns,
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const id = row._id || row.id;
        return (
          <div className="flex gap-2">
            <button
              onClick={async () => {
                  if (!id) return toast.push('Unable to join: missing class id', { type: 'error' });

                  const token = localStorage.getItem('iafrica-token');

                  if (!token) {
                    const returnUrl = encodeURIComponent(`/classroom/${encodeURIComponent(id)}`);
                    navigate(`/login?redirect=${returnUrl}`);
                    return;
                  }

                  navigate(`/classroom/${encodeURIComponent(id)}`);
                }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors font-medium"
            >
              <Play size={16} /> Join
            </button>
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [classesRes, coursesRes] = await Promise.allSettled([getClasses(), getCourses()]);
        if (!mounted) return;

        const classesArray = (classesRes.status === 'fulfilled' && Array.isArray(classesRes.value)) ? classesRes.value : [];
        const coursesArray = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];

        setClasses(classesArray);
        setCourses(coursesArray);
      } catch (e) {
        console.error('MyClasses fetch error', e);
        if (mounted) {
          setClasses([]);
          setCourses([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">My Classes</h2>
          <p className="text-gray-600">View and join your scheduled classes</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Enrolled Classes</h3>
            <p className="text-gray-600 text-sm mt-1">Classes available for your enrolled programs</p>
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
                <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">You have not enrolled in any programs yet</p>
                <p className="text-gray-500 text-sm mt-2">Enroll in a program to view available classes</p>
              </div>
            );
            // derive courseIds from available courses for more accurate filtering
            const matchedCourses = filterCoursesByProgramIds(courses, programIds);
            const courseIds = matchedCourses.map(c => String(c._id || c.id)).filter(Boolean);
            const matched = filterClassesByProgramOrCourseIds(classes, courseIds);
            if (matched.length === 0) return (
              <div className="py-12 text-center">
                <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No classes available</p>
                <p className="text-gray-500 text-sm mt-2">Check back soon for scheduled classes</p>
              </div>
            );
            return <DataTable columns={colsWithActions} data={matched.map((c, idx) => ({ id: c._id || idx+1, _id: c._id || c.id || idx+1, title: c.name || c.title || 'Untitled', schedule: formatDate(c.scheduledDate || c.schedule || c.startDate) || 'TBA' }))} />;
          })()}
        </div>
      </div>
    </div>
  );
};

export default MyClasses;
