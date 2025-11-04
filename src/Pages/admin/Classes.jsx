import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getClasses, createClass, getLecturers, getCourses, getSeasons } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../components/ui/ToastContext';

const ClassesPage = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration: '', schedule: '', courseId: '', seasonId: '', lecturerId: '' });
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCoursesList] = useState([]);
  const [seasons, setSeasonsList] = useState([]);
  const toast = useToast();

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'scheduledDate',
      label: 'Schedule',
      render: (v, row) => formatDate(v || row.startDate || row.start || row.start_date)
    },
    { key: 'status', label: 'Status' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [classesRes, lecturersRes, coursesRes, seasonsRes] = await Promise.allSettled([getClasses(), getLecturers(), getCourses(), getSeasons()]);
        if (!mounted) return;

        const classesArray = (classesRes.status === 'fulfilled' && Array.isArray(classesRes.value)) ? classesRes.value : [];
        const lecturersArray = (lecturersRes.status === 'fulfilled' && Array.isArray(lecturersRes.value)) ? lecturersRes.value : [];
        const coursesArray = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];
        const seasonsArray = (seasonsRes.status === 'fulfilled' && Array.isArray(seasonsRes.value)) ? seasonsRes.value : [];

        setClasses(classesArray);
        setLecturers(lecturersArray);
        setCoursesList(coursesArray);
        setSeasonsList(seasonsArray);
      } catch (e) {
        console.error('Classes fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Classes</h2>
        <div>
          <button onClick={() => setIsCreateOpen(true)} className="px-3 py-2 bg-emerald-600 text-white rounded">Create Class</button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No classes found</div>
        ) : (
          <DataTable columns={columns} data={classes} />
        )}
      </div>

      {/* Create Class Modal (admin) */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create Class (Admin)</h3>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Class title" className="w-full border rounded px-3 py-2" />
              <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full border rounded px-3 py-2" rows={3} />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.duration || ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} type="number" min="0" placeholder="Duration (minutes)" className="w-full border rounded px-3 py-2" />
                <input value={form.schedule || ''} onChange={(e) => setForm({ ...form, schedule: e.target.value })} type="datetime-local" placeholder="Schedule" className="w-full border rounded px-3 py-2" />
              </div>
              <select value={form.courseId || ''} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select course</option>
                {courses.map((c) => <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.title}</option>)}
              </select>
              <select value={form.seasonId || ''} onChange={(e) => setForm({ ...form, seasonId: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select season</option>
                {seasons.map((s) => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
              </select>
              <select value={form.lecturerId || ''} onChange={(e) => setForm({ ...form, lecturerId: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select lecturer (required)</option>
                {lecturers.map((l) => <option key={l._id || l.id} value={l._id || l.id}>{l.name || l.fullName || l.email}</option>)}
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button disabled={creating} onClick={async () => {
                setCreating(true);
                try {
                  let scheduledIso = undefined;
                  if (form.schedule) {
                    try { scheduledIso = new Date(form.schedule).toISOString(); } catch { scheduledIso = form.schedule; }
                  }
                  const payload = {
                    title: form.title,
                    description: form.description,
                    scheduledDate: scheduledIso,
                    course: form.courseId,
                    season: form.seasonId,
                    lecturer: form.lecturerId,
                    duration: form.duration,
                  };
                  const res = await createClass(payload);
                  const newClass = res && res._id ? res : (res && res.data ? res.data : res);
                  setClasses((c) => [{ ...newClass, id: newClass._id || newClass.id || Date.now() }, ...c]);
                  setIsCreateOpen(false);
                  setForm({ title: '', description: '', duration: '', schedule: '', courseId: '', seasonId: '', lecturerId: '' });
                  toast.push('Class created', { type: 'success' });
                } catch (err) {
                  console.error('Create class failed', err);
                  toast.push(err.message || 'Failed to create class', { type: 'error' });
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

export default ClassesPage;
