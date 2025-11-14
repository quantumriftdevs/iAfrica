import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getCourses, getProgram } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { deriveEnrolledProgramIds, deriveEnrolledGradeIds, filterCoursesByProgramIds, getStoredProgramIds } from '../../utils/helpers';

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
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
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

  // Fetch program objects for stored program ids so we can derive grade ids
  useEffect(() => {
    let mounted = true;
    const stored = getStoredProgramIds();
    if (!Array.isArray(stored) || stored.length === 0) {
      setPrograms([]);
      setProgramsLoading(false);
      return () => { mounted = false; };
    }

    (async () => {
      setProgramsLoading(true);
      try {
        const results = await Promise.allSettled(stored.map(id => getProgram(id)));
        if (!mounted) return;
        const loaded = results.map(r => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean);
        setPrograms(Array.isArray(loaded) ? loaded : []);
      } catch (e) {
        console.error('Failed to load programs for stored ids', e);
        if (mounted) setPrograms([]);
      } finally {
        if (mounted) setProgramsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // derive enrolled courses via enrolled program and grade ids (prefer program+grade filtering)
  useEffect(() => {
    const stored = getStoredProgramIds();
    const derivedPrograms = deriveEnrolledProgramIds(user);
    const programIds = Array.from(new Set([...(stored || []), ...(derivedPrograms || [])]));

    // If stored program ids exist but program objects are still loading, wait
    if (Array.isArray(stored) && stored.length > 0 && programsLoading) {
      // don't set enrolled yet until we have program grade information
      return;
    }

    // Start with grade ids derived directly from the user object
    let gradeIds = Array.isArray(deriveEnrolledGradeIds(user)) ? deriveEnrolledGradeIds(user) : [];

    // Also derive grade ids from fetched program objects (if any)
    if (Array.isArray(programs) && programs.length > 0) {
      for (const p of programs) {
        if (!p) continue;
        const g = p.grades || p.gradeIds || p.gradesIds || p.grades || [];
        if (!Array.isArray(g)) continue;
        const ids = g.map(x => (typeof x === 'string' ? x : (x && (x._id || x.id) ? (x._id || x.id) : null))).filter(Boolean);
        gradeIds = Array.from(new Set([...(gradeIds || []), ...ids]));
      }
    }

    let filtered = [];

    if (programIds.length > 0) {
      // Filter courses by program first
      const byProgram = filterCoursesByProgramIds(courses, programIds);

      // If we have grade ids, further filter by grade.
      if (Array.isArray(gradeIds) && gradeIds.length > 0) {
        filtered = byProgram.filter(c => {
          try {
            const courseGrade = c.grade || c.gradeId || (c.grade && (c.grade._id || c.grade.id));
            if (!courseGrade) return false;
            return gradeIds.includes(String(courseGrade));
          } catch {
            return false;
          }
        });
      } else {
        filtered = byProgram;
      }
    }

    setEnrolled(filtered);
  }, [user, courses, programs, programsLoading]);

  return (
    <div className="container mx-auto px-4">
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-4">
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
    </div>
  );
};

export default MyCourses;
