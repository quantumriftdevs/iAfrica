import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import { getResources, createResource, uploadResourceFile, getCourses, getSeasons, formatApiError } from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';

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
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Resources</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No resources found</div>
        ) : (
          <DataTable columns={[...columns, { key: 'actions', label: 'Actions' }]} data={resources} />
        )}
      </div>
      <div className="mt-4">
        <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 rounded bg-emerald-600 text-white">Upload Resource</button>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Upload Resource</h3>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full border rounded px-3 py-2" />
              <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select course (optional)</option>
                {courses.map(c => <option key={c._id || c._id} value={c._id || c._id}>{c.name || c.title}</option>)}
              </select>
              <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Select season (optional)</option>
                {seasons.map(s => <option key={s._id || s._id} value={s._id || s._id}>{s.name}</option>)}
              </select>
              <input type="file" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} className="w-full" />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
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
                    toast.push('Resource created', { type: 'success' });
                } catch (e) {
                  console.error('Create resource error', e);
                    toast.push(formatApiError(e) || 'Failed to create resource', { type: 'error' });
                } finally {
                  setCreating(false);
                }
              }} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">{creating ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerResources;
