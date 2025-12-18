import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import {
  getResources,
  createResource,
  uploadResourceFile,
  getCourses,
  formatApiError,
  updateResource,
  deleteResource
} from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';
import { Plus, X, BookOpen } from 'lucide-react';

const AdminResources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const toast = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course: '', externalLink: '', file: null });
  const [createStep, setCreateStep] = useState(1);
  const [createdResource, setCreatedResource] = useState(null);
  const [courses, setCourses] = useState([]);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', course: '', externalLink: '', file: null });
  const [editResourceId, setEditResourceId] = useState(null);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'course', label: 'Course' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id || row.id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [resRes, coursesRes] = await Promise.allSettled([getResources(), getCourses()]);
        if (!mounted) return;
        setResources(
          resRes.status === 'fulfilled' && Array.isArray(resRes.value)
            ? resRes.value.map(r => ({
                ...r,
                course: r.courseId?.name || '-',
              }))
            : []
        );
        setCourses((coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : []);
      } catch (e) {
        console.error('Resources fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // ---------- Edit handler (fixed optional chaining) ----------
  function handleEdit(row) {
    // prefills edit form and opens modal
    setEditResourceId(row._id || row.id);
    setEditForm({
      title: row.title || '',
      description: row.description || '',
      // fixed optional chaining: use ?. not ?..
      course: (row.courseId && (row.courseId._id || row.courseId)) || row.course || '',
      externalLink: row.externalLink || '',
      file: null
    });
    setIsEditOpen(true);
  }

  // Save edit
  async function saveEdit() {
    if (!editResourceId) return;
    setEditing(true);
    try {
      if (!editForm.title) {
        toast.push('Title is required', { type: 'error' });
        setEditing(false);
        return;
      }

      const payload = {
        title: editForm.title,
        description: editForm.description,
        type: 'document',
        courseId: editForm.course || undefined,
        externalLink: editForm.externalLink,
        isPublished: true
      };

      // update metadata
      await updateResource(editResourceId, payload);

      // optionally upload file
      if (editForm.file instanceof File) {
        const fd = new FormData();
        fd.append('file', editForm.file);
        await uploadResourceFile(editResourceId, fd);
      }

      // refresh resources (best-effort)
      try {
        const updated = await getResources();
        setResources(Array.isArray(updated) ? updated.map((resource) => ({
          ...resource,
          course: resource.courseId?.name || '-',
        })) : []);
      } catch {
        // fallback local patch
        setResources(prev => prev.map(r => (r._id === editResourceId || r.id === editResourceId ? { ...r, title: payload.title, description: payload.description, course: courses.find(c => c._id === payload.courseId)?.name || r.course } : r)));
      }

      setIsEditOpen(false);
      setEditForm({ title: '', description: '', course: '', externalLink: '', file: null });
      setEditResourceId(null);
      toast.push('Resource updated', { type: 'success' });
    } catch (e) {
      console.error('Update resource failed', e);
      toast.push(formatApiError(e) || 'Failed to update resource', { type: 'error' });
    } finally {
      setEditing(false);
    }
  }

  // ---------- Delete handler ----------
  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm('Are you sure you want to delete this resource? This action cannot be undone.');
    if (!ok) return;

    try {
      await deleteResource(id);
      // remove from state
      setResources(prev => prev.filter(r => (r._id || r.id) !== id));
      toast.push('Resource deleted', { type: 'success' });
    } catch (e) {
      console.error('Delete resource failed', e);
      toast.push(formatApiError(e) || 'Failed to delete resource', { type: 'error' });
    }
  }

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
            // pass the columns array directly (no duplicate)
            <DataTable columns={columns} data={resources} />
          )}
        </div>
      </div>

      {/* Create modal (unchanged) */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upload Resource</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            {createStep === 1 ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resource Title *</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Week 1 Lecture Notes" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">External Link</label>
                    <input value={form.externalLink} onChange={(e) => setForm({ ...form, externalLink: e.target.value })} placeholder="https://example.com/resource" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                    <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="">Select course</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.name || c.title}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => { setIsCreateOpen(false); setCreateStep(1); setForm({ title: '', description: '', course: '', externalLink: '', file: null }); setCreatedResource(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                  <button disabled={creating} onClick={async () => {
                    setCreating(true);
                    try {
                      if (!form.title) {
                        toast.push('Title is required', { type: 'error' });
                        setCreating(false);
                        return;
                      }

                      const payload = {
                        title: form.title,
                        description: form.description,
                        type: 'document',
                        courseId: form.course,
                        fileUrl: "https://file.com",
                        externalLink: form.externalLink,
                        isPublished: true
                      };

                      const res = await createResource(payload);
                      const created = res && (res._id || res.id) ? (res._id ? res : res.data || res) : res;
                      setCreatedResource(created);
                      setCreateStep(2);
                    } catch (e) {
                      console.error('Create resource error', e);
                      toast.push(formatApiError(e) || 'Failed to create resource', { type: 'error' });
                    } finally {
                      setCreating(false);
                    }
                  }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{creating ? 'Creating...' : 'Save details'}</button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-700">Resource created. You can now upload the file for this resource.</p>
                    <p className="text-sm text-gray-500">Resource ID: <span className="font-mono text-xs">{(createdResource && (createdResource._id || createdResource.id)) || (createdResource && createdResource._id)}</span></p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors">
                      <input type="file" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} className="block w-full text-sm text-gray-700" />
                      {form.file && <p className="text-sm text-emerald-600 font-medium mt-2">✓ {form.file.name}</p>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => { setCreateStep(1); setCreatedResource(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Back</button>
                  <button disabled={creating} onClick={async () => {
                    setCreating(true);
                    try {
                      if (form.file && createdResource && (createdResource._id)) {
                        const fd = new FormData();
                        fd.append('file', form.file);
                        await uploadResourceFile(createdResource._id, fd);
                      }

                      try {
                        const updated = await getResources();
                        setResources(Array.isArray(updated) ? updated.map((resource) => ({
                          ...resource,
                          course: resource.courseId?.name || '-',
                        })) : []);
                      } catch {
                        setResources((s) => [createdResource, ...s]);
                      }

                      setIsCreateOpen(false);
                      setForm({ title: '', description: '', course: '', externalLink: '', file: null });
                      setCreateStep(1);
                      setCreatedResource(null);
                      toast.push('Resource created', { type: 'success' });
                    } catch (e) {
                      console.error('File upload failed', e);
                      toast.push(formatApiError(e) || 'Failed to upload file', { type: 'error' });
                    } finally {
                      setCreating(false);
                    }
                  }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{creating ? 'Uploading...' : 'Upload File & Finish'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Resource</h3>
              <button onClick={() => { setIsEditOpen(false); setEditResourceId(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resource Title *</label>
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="e.g., Week 1 Lecture Notes" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Short description" rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">External Link</label>
                <input value={editForm.externalLink} onChange={(e) => setEditForm({ ...editForm, externalLink: e.target.value })} placeholder="https://example.com/resource" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select value={editForm.course} onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name || c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Replace File (optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors">
                  <input type="file" onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })} className="block w-full text-sm text-gray-700" />
                  {editForm.file && <p className="text-sm text-emerald-600 font-medium mt-2">✓ {editForm.file.name}</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setIsEditOpen(false); setEditForm({ title: '', description: '', course: '', externalLink: '', file: null }); setEditResourceId(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button disabled={editing} onClick={saveEdit} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{editing ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;
