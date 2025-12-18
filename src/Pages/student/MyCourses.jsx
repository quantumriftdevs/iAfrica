import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getCourses, getProgram } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { deriveEnrolledProgramIds, deriveEnrolledGradeIds, filterCoursesByProgramIds } from '../../utils/helpers';
import { BookOpen } from 'lucide-react';

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
    const programIds = deriveEnrolledProgramIds(user);
    if (!Array.isArray(programIds) || programIds.length === 0) {
      setPrograms([]);
      setProgramsLoading(false);
      return () => { mounted = false; };
    }

    (async () => {
      setProgramsLoading(true);
      try {
        const results = await Promise.allSettled(programIds.map(id => getProgram(id)));
        if (!mounted) return;
        const loaded = results.map(r => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean);
        setPrograms(Array.isArray(loaded) ? loaded : []);
      } catch (e) {
        console.error('Failed to load programs for enrolled ids', e);
        if (mounted) setPrograms([]);
      } finally {
        if (mounted) setProgramsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  // derive enrolled courses via enrolled program and grade ids (prefer program+grade filtering)
  useEffect(() => {
    const derivedPrograms = deriveEnrolledProgramIds(user);
    const programIds = Array.from(new Set([...(derivedPrograms || [])]));

    // If stored program ids exist but program objects are still loading, wait
    if (Array.isArray(programIds) && programIds.length > 0 && programsLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">My Courses</h2>
          <p className="text-gray-600">Track your enrolled courses and progress</p>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Enrolled Courses</h3>
            <p className="text-gray-600 text-sm mt-1">All courses you're currently enrolled in</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : enrolled.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No courses enrolled</p>
              <p className="text-gray-500 text-sm mt-2">You haven't enrolled in any courses yet</p>
            </div>
          ) : (
            <DataTable columns={columns} data={enrolled.map((c, idx) => ({ id: c._id || idx+1, title: c.name || c.title || 'Untitled', progress: c.progress || '0%' }))} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
