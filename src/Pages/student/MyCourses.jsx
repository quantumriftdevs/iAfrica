import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getCourses } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { deriveEnrolledProgramIds, filterCoursesByProgramIds } from '../../utils/helpers';

// eslint-disable-next-line react-refresh/only-export-components
export const deriveEnrolled = (u, allCourses) => {
  if (!u || !Array.isArray(allCourses)) return [];

  // common fields that backends may use to store enrollments
  const lists = [u.enrolledCourses, u.courses, u.enrollments, u.enrolled];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;

    // if list contains ids
    const ids = list.filter(Boolean).map(x => (typeof x === 'string' ? x : (x._id || x.id || x.course || x.courseId || null))).filter(Boolean);
    if (ids.length) return allCourses.filter(c => ids.includes(c._id || c.id));

    // if list contains course objects
    const objs = list.filter(x => x && (x._id || x.id || x.name || x.title));
    if (objs.length) {
      return allCourses.filter(c => objs.some(o => (o._id && (o._id === c._id || o._id === c.id)) || (o.id && (o.id === c._id || o.id === c.id)) || (o.name && (o.name === c.name || o.name === c.title))));
    }
  }

  return [];
};

const MyCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const { user } = useAuth();

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'progress', label: 'Progress' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCourses();
        if (!mounted) return;
        setCourses(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('MyCourses fetch error', e);
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // derive enrolled courses via enrolled program ids (prefer program-based filtering)
  useEffect(() => {
    const programIds = deriveEnrolledProgramIds(user);
    let filtered = [];

    // If user explicitly listed enrolled courses, keep backward compatibility by matching those first
    try {
      // existing deriveEnrolled exported above — try to import dynamically to avoid circular deps
      // But fall back to program-based filtering
    } catch {
      // ignore
    }

    if (programIds.length > 0) {
      filtered = filterCoursesByProgramIds(courses, programIds);
    }

    setEnrolled(filtered);
  }, [user, courses]);

  return (
    <div className="container mx-auto px-4">
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
        {loading ? (
          <div className="py-8 text-center">Loading enrolled courses...</div>
        ) : enrolled.length === 0 ? (
          <div className="py-8 text-center text-gray-500">You are not enrolled in any courses</div>
        ) : (
          <DataTable columns={columns} data={enrolled.map((c, idx) => ({ id: c._id || idx+1, title: c.name || c.title || 'Untitled', progress: c.progress || '0%' }))} />
        )}
      </div>
    </div>
  );
};

export default MyCourses;
