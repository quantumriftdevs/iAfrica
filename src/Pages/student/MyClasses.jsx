import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getClasses, getCourses } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { deriveEnrolledProgramIds, filterClassesByProgramOrCourseIds, getStoredProgramIds, filterCoursesByProgramIds } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastContext';

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

                  // quick auth token presence check (context may not be hydrated)
                  const token = localStorage.getItem('iafrica-token');

                  if (!token) {
                    // redirect to login and include return URL to come back to this classroom
                    const returnUrl = encodeURIComponent(`/classroom/${encodeURIComponent(id)}`);
                    navigate(`/login?redirect=${returnUrl}`);
                    return;
                  }

                  // Navigate to the generic classroom page which will handle token acquisition
                  navigate(`/classroom/${encodeURIComponent(id)}`);
                }}
              className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
            >
              {'Join'}
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
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">My Classes</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading classes...</div>
        ) : (() => {
          const stored = getStoredProgramIds();
          const derived = deriveEnrolledProgramIds(user);
          const programIds = Array.from(new Set([...(stored || []), ...(derived || [])]));
          if (programIds.length === 0) return <div className="py-8 text-center text-gray-500">You have not enrolled in any programs yet</div>;
          // derive courseIds from available courses for more accurate filtering
          const matchedCourses = filterCoursesByProgramIds(courses, programIds);
          const courseIds = matchedCourses.map(c => String(c._id || c.id)).filter(Boolean);
          const matched = filterClassesByProgramOrCourseIds(classes, courseIds);
          if (matched.length === 0) return <div className="py-8 text-center text-gray-500">No classes available for your enrolled programs</div>;
          return <DataTable columns={colsWithActions} data={matched.map((c, idx) => ({ id: c._id || idx+1, _id: c._id || c.id || idx+1, title: c.name || c.title || 'Untitled', schedule: c.scheduledDate || c.schedule || c.startDate || 'TBA' }))} />;
        })()}
      </div>
    </div>
  );
};

export default MyClasses;
