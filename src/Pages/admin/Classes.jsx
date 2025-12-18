import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getClasses, createClass, getLecturers, getCourses, getSeasons } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../components/ui/ToastContext';
import { Plus, X, BookOpen } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Classes</h2>
            <p className="text-gray-600">Manage all class schedules and assignments</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl">
            <Plus size={18} /> Create Class
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Classes</h3>
            <p className="text-gray-600 text-sm mt-1">Complete list of scheduled classes</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No classes found</p>
              <p className="text-gray-500 text-sm mt-2">Create a new class to get started</p>
            </div>
          ) : (
            <DataTable columns={columns} data={classes} />
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create Class</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Introduction to JavaScript" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Class description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                  <input value={form.duration || ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} type="number" min="0" placeholder="60" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                  <input value={form.schedule || ''} onChange={(e) => setForm({ ...form, schedule: e.target.value })} type="datetime-local" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select value={form.courseId || ''} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select course</option>
                  {courses.map((c) => <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                <select value={form.seasonId || ''} onChange={(e) => setForm({ ...form, seasonId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select season</option>
                  {seasons.map((s) => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lecturer *</label>
                <select value={form.lecturerId || ''} onChange={(e) => setForm({ ...form, lecturerId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select lecturer (required)</option>
                  {lecturers.map((l) => <option key={l._id || l.id} value={l._id || l.id}>{l.name || l.fullName || l.email}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
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
                  toast.push('Class created successfully', { type: 'success' });
                } catch (err) {
                  console.error('Create class failed', err);
                  toast.push(err.message || 'Failed to create class', { type: 'error' });
                } finally {
                  setCreating(false);
                }
              }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{creating ? 'Creating...' : 'Create Class'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
