import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/lecturer/StatsCard';
import DataTable from '../../components/lecturer/DataTable';
import { PlusSquare } from 'lucide-react';
import { getCourses, getPrograms, createClass } from '../../utils/api';

const LecturerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', schedule: '', programId: '' });

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
        const [coursesRes, programsRes] = await Promise.allSettled([getCourses(), getPrograms()]);
        if (!mounted) return;

        const coursesArray = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];
        const programsArray = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];

        setCourses(coursesArray);
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
              <DataTable columns={columns} data={courses.map((c, idx) => ({ id: c.id || idx+1, title: c.name || c.title || 'Untitled', schedule: c.schedule || '-', students: c.students || 0 }))} />
            )}
          </div>
        </main>
      </div>

      {/* Create Class Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create Class</h3>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Class title" className="w-full border rounded px-3 py-2" />
              <input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Schedule (e.g. Mon 10:00)" className="w-full border rounded px-3 py-2" />
              <select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select program (optional)</option>
                {programs.map((p) => <option key={p.id || p._id} value={p.id || p._id}>{p.name || p.title}</option>)}
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button disabled={creating} onClick={async () => {
                setCreating(true);
                try {
                  const payload = { name: form.title, schedule: form.schedule, programId: form.programId };
                  const res = await createClass(payload);
                  const newClass = res && res.id ? res : (res && res.data ? res.data : res);
                  setCourses((c) => [{ id: newClass.id || Date.now(), name: newClass.name || newClass.title || form.title, schedule: newClass.schedule || form.schedule, students: newClass.students || 0 }, ...c]);
                  setIsCreateOpen(false);
                  setForm({ title: '', schedule: '', programId: '' });
                } catch (err) {
                  console.error('Create class failed', err);
                  alert(err.message || 'Failed to create class');
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
