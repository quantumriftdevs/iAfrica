import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import { getResources, createResource, uploadResourceFile, getCourses, getSeasons, formatApiError } from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';
import { Plus, X, BookOpen } from 'lucide-react';

const LecturerResources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const toast = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', course: '', season: '', file: null });
  const [courses, setCourses] = useState([]);
  const [seasons, setSeasons] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'course', label: 'Course' },
    { key: 'uploaded', label: 'Uploaded' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [resRes, coursesRes, seasonsRes] = await Promise.allSettled([getResources(), getCourses(), getSeasons()]);
        if (!mounted) return;
        setResources((resRes.status === 'fulfilled' && Array.isArray(resRes.value)) ? resRes.value : []);
        setCourses((coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : []);
        setSeasons((seasonsRes.status === 'fulfilled' && Array.isArray(seasonsRes.value)) ? seasonsRes.value : []);
      } catch (e) {
        console.error('Resources fetch error', e);
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
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Resources</h2>
            <p className="text-gray-600">Manage and share learning resources with students</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl">
            <Plus size={18} /> Upload Resource
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Resources</h3>
            <p className="text-gray-600 text-sm mt-1">List of all uploaded learning resources</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No resources uploaded</p>
              <p className="text-gray-500 text-sm mt-2">Upload your first resource to share with students</p>
            </div>
          ) : (
            <DataTable columns={[...columns, { key: 'actions', label: 'Actions' }]} data={resources} />
          )}
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upload Resource</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Week 1 Lecture Notes" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select course (optional)</option>
                  {courses.map(c => <option key={c._id || c._id} value={c._id || c._id}>{c.name || c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select season (optional)</option>
                  {seasons.map(s => <option key={s._id || s._id} value={s._id || s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors">
                  <input type="file" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} className="block w-full text-sm text-gray-700" />
                  {form.file && <p className="text-sm text-emerald-600 font-medium mt-2">✓ {form.file.name}</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button disabled={creating} onClick={async () => {
                setCreating(true);
                try {
                  const payload = { title: form.title, course: form.course };
                  const res = await createResource(payload);
                  const created = res && res._id ? res : (res && res.data ? res.data : res);
                  if (form.file && created && (created._id || created._id)) {
                    const fd = new FormData();
                    fd.append('file', form.file);
                    try {
                      await uploadResourceFile(created._id || created._id, fd);
                      } catch (e) {
                        console.warn('File upload failed', e);
                      }
                  }
                  setResources((s) => [created, ...s]);
                  setIsCreateOpen(false);
                  setForm({ title: '', course: '', file: null });
                    toast.push('Resource uploaded successfully', { type: 'success' });
                } catch (e) {
                  console.error('Create resource error', e);
                    toast.push(formatApiError(e) || 'Failed to upload resource', { type: 'error' });
                } finally {
                  setCreating(false);
                }
              }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{creating ? 'Uploading...' : 'Upload Resource'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerResources;
