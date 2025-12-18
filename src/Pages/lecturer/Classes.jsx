import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import {
  getClasses,
  getLecturerClasses,
  updateClass,
  deleteClass,
  getCourses,
  getSeasons,
  formatApiError,
  getClassToken
} from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { X, BookOpen, Play } from 'lucide-react';

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
  const lecturerId = user?._id;

  const toast = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [startingClassId, setStartingClassId] = useState(null);

  // delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [classesRes, coursesRes, seasonsRes] = await Promise.allSettled([
          lecturerId ? getLecturerClasses(lecturerId) : getClasses(),
          getCourses(),
          getSeasons()
        ]);

        const cls = classesRes.status === 'fulfilled' ? classesRes.value : [];
        if (!mounted) return;
        setClasses(Array.isArray(cls) ? cls : []);

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

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'scheduledDate',
      label: 'Schedule',
      render: (v, row) => formatDate(v || row.startDate || row.start || row.start_date),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">My Classes</h2>
          <p className="text-gray-600">Manage and teach your assigned classes</p>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Classes</h3>
            <p className="text-gray-600 text-sm mt-1">Your assigned classes and schedules</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No classes assigned</p>
              <p className="text-gray-500 text-sm mt-2">You don't have any classes yet</p>
            </div>
          ) : (
            <DataTable
              columns={[
                ...columns,
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (v, row) => {
                    const id = row._id || row.id;
                    return (
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(row)} className="px-3 py-1 text-sm rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors font-medium">Edit</button>
                        <button
                          onClick={async () => {
                            if (!id) return toast.push('Unable to start class: missing id', { type: 'error' });
                            try {
                              setStartingClassId(id);
                              await getClassToken(id);
                              navigate(`/classroom/${encodeURIComponent(id)}`);
                            } catch (e) {
                              console.error('Start class error', e);
                              toast.push(formatApiError(e) || 'Failed to start class', { type: 'error' });
                            } finally {
                              setStartingClassId(null);
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium"
                        >
                          <Play size={14} /> {startingClassId === id ? 'Starting...' : 'Start'}
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(id);
                            setIsDeleteOpen(true);
                          }}
                          className="px-3 py-1 text-sm rounded-lg border border-red-600 text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  }
                }
              ]}
              data={classes}
            />
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Class</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Title</label>
                <input
                  value={editing.title || editing.name || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Class title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <input
                  value={editing.schedule || (editing.scheduledDate ? toLocalDatetime(editing.scheduledDate) : '')}
                  onChange={(e) => setEditing({ ...editing, schedule: e.target.value })}
                  type="datetime-local"
                  placeholder="Schedule"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={editing.course || editing.courseId || ''}
                  onChange={(e) => setEditing({ ...editing, course: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select course (optional)</option>
                  {courses.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                <select
                  value={editing.season || editing.seasonId || ''}
                  onChange={(e) => setEditing({ ...editing, season: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select season (optional)</option>
                  {seasons.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const id = editing._id || editing.id;
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
                    setClasses((s) => s.map(x => ((x._id || x.id) === id ? { ...x, title: updated.title || updated.name, scheduledDate: updated.scheduledDate || updated.schedule } : x)));
                    setEditing(null);
                    toast.push('Class updated successfully', { type: 'success' });
                  } catch (e) {
                    console.error('Update class error', e);
                    toast.push(formatApiError(e) || 'Failed to update class', { type: 'error' });
                  } finally {
                    setSaving(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={isDeleteOpen}
        title="Delete class"
        message="Delete this class?"
        onCancel={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={async () => {
          if (!deleteTarget) return setIsDeleteOpen(false);
          try {
            await deleteClass(deleteTarget);
            setClasses((s) => s.filter(x => (x._id || x.id) !== deleteTarget));
            toast.push('Class deleted', { type: 'success' });
          } catch (e) {
            console.error('Delete class error', e);
            toast.push(formatApiError(e) || 'Failed to delete class', { type: 'error' });
          } finally {
            setIsDeleteOpen(false);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};

export default LecturerClasses;
