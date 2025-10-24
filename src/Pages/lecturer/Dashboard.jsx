import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/lecturer/StatsCard';
import DataTable from '../../components/lecturer/DataTable';
import { PlusSquare } from 'lucide-react';
import { getCourses, getPrograms, getSeasons, createClass, formatApiError } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/ToastContext';

const LecturerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', schedule: '', courseId: '' , seasonId: ''});
  const { user } = useAuth();
  const toast = useToast();

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'students', label: 'Students' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [coursesRes, programsRes, seasonsRes] = await Promise.allSettled([getCourses(), getPrograms(), getSeasons()]);
        if (!mounted) return;

        const coursesArray = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];
        const programsArray = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];
        const seasonsArray = (seasonsRes.status === 'fulfilled' && Array.isArray(seasonsRes.value)) ? seasonsRes.value : [];

        setCourses(coursesArray);
        setPrograms(programsArray);
        setSeasons(seasonsArray);
      } catch (e) {
        console.error('Lecturer dashboard fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const stats = [
    { title: 'My Classes', value: loading ? '—' : (courses.length || '0') },
    { title: 'Students', value: '—' },
    { title: 'Active Courses', value: loading ? '—' : (programs.length || '0') },
    { title: 'Pending Grades', value: '—' }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-6">Lecturer Dashboard</h2>

        <div className="flex items-center space-x-3">
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500"><PlusSquare size={16} /> Create Class</button>
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
            <h3 className="text-lg font-semibold mb-4">My Classes</h3>
            {loading ? (
              <div className="py-8 text-center">Loading classes...</div>
            ) : courses.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No classes to display</div>
            ) : (
              <DataTable columns={columns} data={courses.map((c, idx) => ({ id: c._id || idx+1, title: c.name || c.title || 'Untitled', schedule: c.schedule || '-', students: c.students || 0 }))} />
            )}
          </div>
        </main>
      </div>

      {/* Create Class Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create Class</h3>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Class title" className="w-full border rounded px-3 py-2" />
              {/* datetime-local expects a value like 2025-10-21T10:00 */}
              <input value={form.schedule || ''} onChange={(e) => setForm({ ...form, schedule: e.target.value })} type="datetime-local" placeholder="Schedule" className="w-full border rounded px-3 py-2" />
              <select value={form.courseId || form.programId || ''} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select course (optional)</option>
                {courses.map((c) => <option key={c._id || c._id} value={c._id || c._id}>{c.name || c.title}</option>)}
              </select>
              <select value={form.seasonId || ''} onChange={(e) => setForm({ ...form, seasonId: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select season (optional)</option>
                {seasons.map((s) => <option key={s._id || s._id} value={s._id || s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button disabled={creating} onClick={async () => {
                setCreating(true);
                try {
                  const lecturerId = user?._id || user?._id;
                  // Convert datetime-local (local time) to ISO string for backend
                  let scheduledIso = undefined;
                  if (form.schedule) {
                    try {
                      // create a Date from the local datetime input and convert to ISO
                      scheduledIso = new Date(form.schedule).toISOString();
                    } catch {
                      scheduledIso = form.schedule;
                    }
                  }

                  const payload = {
                    title: form.title,
                    scheduledDate: scheduledIso,
                    course: form.courseId || form.programId || undefined,
                    season: form.seasonId || undefined,
                    // include lecturer id explicitly so backend can associate owner
                    ...(lecturerId ? { lecturer: lecturerId } : {})
                  };
                  const res = await createClass(payload);
                  const newClass = res && res._id ? res : (res && res.data ? res.data : res);
                  setCourses((c) => [{ id: newClass._id || Date.now(), title: newClass.name || newClass.title || form.title, schedule: newClass.scheduledDate || form.schedule, students: newClass.students || 0 }, ...c]);
                  setIsCreateOpen(false);
                  setForm({ title: '', schedule: '', programId: '' });
                  toast.push('Class created', { type: 'success' });
                } catch (err) {
                  console.error('Create class failed', err);
                  toast.push(formatApiError(err) || 'Failed to create class', { type: 'error' });
                } finally {
                  setCreating(false);
                }
              }} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;
