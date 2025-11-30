import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getPrograms, createProgram, formatApiError, uploadProgramImage, toggleProgramActive, toggleProgramSuspension, updateProgram, deleteProgram } from '../../utils/api';
import { X, Plus, BookOpen } from 'lucide-react';
import { useToast } from '../../components/ui/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ProgramsPage = () => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'duration', label: 'Duration' },
    { key: 'description', label: 'Description' }
  ];

  // show actions column
  columns.push({ key: 'actions', label: 'Actions', render: (_v, row) => (
    <div className="flex gap-2">
      <button onClick={() => openUpload(row)} className="px-2 py-1 text-sm rounded border">Upload Image</button>
      <button onClick={() => handleToggleActive(row)} className="px-2 py-1 text-sm rounded border">{row.isActive ? 'Mark Inactive' : 'Mark Active'}</button>
      <button onClick={() => handleToggleSuspend(row)} className="px-2 py-1 text-sm rounded border">{row.isSuspended ? 'Unsuspend' : 'Suspend'}</button>
      <button onClick={() => openEdit(row)} className="px-2 py-1 text-sm rounded border">Edit</button>
      <button onClick={() => confirmDeletePrompt(row)} className="px-2 py-1 text-sm rounded border text-red-600">Delete</button>
    </div>
  )});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getPrograms();
        if (!mounted) return;
        setPrograms(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Programs fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // create form state
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', duration: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProgramId, setUploadProgramId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingSaving, setEditingSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      toast.push('Please provide program name and description', { type: 'error' });
      return;
    }
    setCreating(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        duration: form.duration || 'N/A',
        // default flags per requirement
        isActive: true,
        isSuspended: false
      };
      const created = await createProgram(payload);
      // refresh list
      const res = await getPrograms();
      setPrograms(Array.isArray(res) ? res : []);
      setForm({ name: '', description: '', duration: '' });
      setIsModalOpen(false);
      // prompt for image upload for created program
      const createdId = created && (created._id || created.id || created._id);
      if (createdId) {
        setUploadProgramId(createdId);
        setIsUploadOpen(true);
      }
      toast.push('Program created successfully', { type: 'success' });
    } catch (err) {
      console.error('Create program error', err);
      toast.push(formatApiError(err) || 'Failed to create program', { type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const openUpload = (program) => {
    const id = program._id || program.id;
    setUploadProgramId(id);
    setIsUploadOpen(true);
  };

  const handleFileChange = (e) => setUploadFile(e.target.files && e.target.files[0]);

  const handleUpload = async () => {
    if (!uploadProgramId) return toast.push('No program selected for upload', { type: 'error' });
    if (!uploadFile) return toast.push('Please select a file to upload', { type: 'error' });
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      await uploadProgramImage(uploadProgramId, fd);
      const res = await getPrograms();
      setPrograms(Array.isArray(res) ? res : []);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadProgramId(null);
      toast.push('Program image uploaded', { type: 'success' });
    } catch (err) {
      console.error('Upload error', err);
      toast.push(formatApiError(err) || 'Failed to upload image', { type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (program) => {
    try {
      const id = program._id || program.id;
      await toggleProgramActive(id);
      const res = await getPrograms();
      setPrograms(Array.isArray(res) ? res : []);
      toast.push('Program active state toggled', { type: 'success' });
    } catch (err) {
      console.error('Toggle active error', err);
      toast.push(formatApiError(err) || 'Failed to toggle active', { type: 'error' });
    }
  };

  const handleToggleSuspend = async (program) => {
    try {
      const id = program._id || program.id;
      await toggleProgramSuspension(id);
      const res = await getPrograms();
      setPrograms(Array.isArray(res) ? res : []);
      toast.push('Program suspension toggled', { type: 'success' });
    } catch (err) {
      console.error('Toggle suspend error', err);
      toast.push(formatApiError(err) || 'Failed to toggle suspension', { type: 'error' });
    }
  };

  const openEdit = (program) => {
    setEditingProgram({
      _id: program._id || program.id,
      name: program.name || '',
      description: program.description || '',
      duration: program.duration || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => setEditingProgram({ ...editingProgram, [e.target.name]: e.target.value });

  const handleEditSave = async (e) => {
    e && e.preventDefault();
    if (!editingProgram) return;
    setEditingSaving(true);
    try {
      const id = editingProgram._id;
      const payload = { name: editingProgram.name, description: editingProgram.description, duration: editingProgram.duration };
      await updateProgram(id, payload);
      const res = await getPrograms();
      setPrograms(Array.isArray(res) ? res : []);
      setIsEditModalOpen(false);
      setEditingProgram(null);
      toast.push('Program updated', { type: 'success' });
    } catch (err) {
      console.error('Edit program error', err);
      toast.push(formatApiError(err) || 'Failed to update program', { type: 'error' });
    } finally {
      setEditingSaving(false);
    }
  };

  const confirmDeletePrompt = (program) => {
    setDeleteTarget(program._id || program.id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return setIsDeleteOpen(false);
    try {
      await deleteProgram(deleteTarget);
      const res = await getPrograms();
      setPrograms(Array.isArray(res) ? res : []);
      toast.push('Program deleted', { type: 'success' });
    } catch (err) {
      console.error('Delete program error', err);
      toast.push(formatApiError(err) || 'Failed to delete program', { type: 'error' });
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Programs</h2>
            <p className="text-gray-600">Manage educational programs and their content</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            <Plus size={18} /> Create Program
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Programs</h3>
            <p className="text-gray-600 text-sm mt-1">Complete list of all programs</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : programs.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No programs found</p>
              <p className="text-gray-500 text-sm mt-2">Create a new program to get started</p>
            </div>
          ) : (
            <DataTable columns={columns} data={programs} />
          )}
        </div>
      </div>

      {/* Program Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h4 className="text-2xl font-bold text-gray-900">Create Program</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Advanced Web Development" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g., 8 weeks" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-28" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating ? 'Creating...' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Image Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Upload Program Image</h4>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-700" />
                {uploadFile && <p className="text-sm text-emerald-600 font-medium mt-2">✓ {uploadFile.name}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setIsUploadOpen(false); setUploadFile(null); setUploadProgramId(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {isEditModalOpen && editingProgram && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h4 className="text-2xl font-bold text-gray-900">Edit Program</h4>
              <button onClick={() => { setIsEditModalOpen(false); setEditingProgram(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close modal">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
                <input name="name" value={editingProgram.name} onChange={handleEditChange} placeholder="e.g., Advanced Web Development" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input name="duration" value={editingProgram.duration} onChange={handleEditChange} placeholder="e.g., 8 weeks" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={editingProgram.description} onChange={handleEditChange} placeholder="Short description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-28" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingProgram(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={editingSaving} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal open={isDeleteOpen} title="Delete program" message="Delete this program?" onCancel={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} onConfirm={handleDelete} />
    </div>
  );
};

export default ProgramsPage;
