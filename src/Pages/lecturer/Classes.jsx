import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import { getClasses, getLecturerClasses, updateClass, deleteClass, getCourses, getSeasons, formatApiError } from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

// Convert an ISO date string to a datetime-local value (YYYY-MM-DDTHH:MM)
function toLocalDatetime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  } catch {
    return '';
  }
}

const LecturerClasses = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const { user } = useAuth();

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'students', label: 'Students' }
  ];

  const lecturerId = user?._id || user?._id;
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [seasons, setSeasons] = useState([]);
  // delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // If a lecturer is logged in, fetch only their classes
        const [classesRes, coursesRes, seasonsRes] = await Promise.allSettled([
          lecturerId ? getLecturerClasses(lecturerId) : getClasses(),
          getCourses(), getSeasons()
        ]);
        const res = (classesRes.status === 'fulfilled') ? classesRes.value : [];
        if (!mounted) return;
        setClasses(Array.isArray(res) ? res : []);

  setCourses((coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : []);
  setSeasons((seasonsRes.status === 'fulfilled' && Array.isArray(seasonsRes.value)) ? seasonsRes.value : []);
      } catch (e) {
        console.error('Lecturer classes fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [lecturerId]);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Lecturer Classes</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No classes found</div>
        ) : (
          <DataTable columns={[
            ...columns,
            { key: 'actions', label: 'Actions', render: (v, row) => (
              <div className="flex gap-2">
                <button onClick={() => setEditing(row)} className="text-sm px-2 py-1 rounded border">Edit</button>
                <button onClick={() => { setDeleteTarget(row._id || row._id); setIsDeleteOpen(true); }} className="text-sm px-2 py-1 rounded border text-red-600">Delete</button>
              </div>
            ) }
          ]} data={classes} />
        )}
      </div>
      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Edit Class</h3>
            <div className="space-y-3">
              <input value={editing.title || editing.name || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Class title" className="w-full border rounded px-3 py-2" />
              <input value={editing.schedule || (editing.scheduledDate ? toLocalDatetime(editing.scheduledDate) : '') || ''} onChange={(e) => setEditing({ ...editing, schedule: e.target.value })} type="datetime-local" placeholder="Schedule" className="w-full border rounded px-3 py-2" />
              <select value={editing.course || editing.courseId || ''} onChange={(e) => setEditing({ ...editing, course: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select course (optional)</option>
                {courses.map(c => <option key={c._id || c._id} value={c._id || c._id}>{c.name || c.title}</option>)}
              </select>
              <select value={editing.season || editing.seasonId || ''} onChange={(e) => setEditing({ ...editing, season: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select season (optional)</option>
                {seasons.map(s => <option key={s._id || s._id} value={s._id || s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded border">Cancel</button>
              <button disabled={saving} onClick={async () => {
                setSaving(true);
                try {
                  const id = editing._id || editing._id;
                  let scheduledIso = undefined;
                  if (editing.schedule) {
                    try {
                      scheduledIso = new Date(editing.schedule).toISOString();
                    } catch {
                      scheduledIso = editing.schedule;
                    }
                  }
                  const payload = { title: editing.title, scheduledDate: scheduledIso, course: editing.course || undefined, season: editing.season || undefined };
                  const res = await updateClass(id, payload);
                  const updated = res && res._id ? res : (res && res.data ? res.data : res);
                  setClasses((s) => s.map(x => ((x._id || x._id) === (id) ? { ...x, title: updated.title || updated.name, schedule: updated.scheduledDate || updated.schedule } : x)));
                  setEditing(null);
                  toast.push('Class updated', { type: 'success' });
                } catch (e) {
                  console.error('Update class error', e);
                  toast.push(formatApiError(e) || 'Failed to update class', { type: 'error' });
                } finally {
                  setSaving(false);
                }
              }} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm delete modal */}
      <ConfirmModal open={isDeleteOpen} title="Delete class" message="Delete this class?" onCancel={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} onConfirm={async () => {
        if (!deleteTarget) return setIsDeleteOpen(false);
        try {
          await deleteClass(deleteTarget);
          setClasses((s) => s.filter(x => (x._id || x._id) !== (deleteTarget)));
          toast.push('Class deleted', { type: 'success' });
        } catch (e) {
          console.error('Delete class error', e);
          toast.push(formatApiError(e) || 'Failed to delete class', { type: 'error' });
        } finally {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }
      }} />
    </div>
  );
};

export default LecturerClasses;
