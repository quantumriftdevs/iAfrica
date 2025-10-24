import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getPrograms, createProgram, formatApiError, uploadProgramImage, toggleProgramActive, toggleProgramSuspension, updateProgram, deleteProgram } from '../../utils/api';
import { X } from 'lucide-react';
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
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Programs</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Create a new program</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:opacity-95"
          >
            Create Program
          </button>
        </div>
        {loading ? (
          <div className="py-8 text-center">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No programs found</div>
        ) : (
          <DataTable columns={columns} data={programs} />
        )}
      </div>

      {/* Program Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Create Program</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 gap-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Program name" className="p-3 border rounded" />
              <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration (e.g. 8 weeks)" className="p-3 border rounded" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="p-3 border rounded h-28" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={creating} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">
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
            <h4 className="text-lg font-semibold mb-4">Upload Program Image</h4>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setIsUploadOpen(false); setUploadFile(null); setUploadProgramId(null); }} className="px-3 py-2 rounded border">Cancel</button>
              <button onClick={handleUpload} disabled={uploading} className="px-3 py-2 rounded bg-emerald-600 text-white">{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {isEditModalOpen && editingProgram && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Edit Program</h4>
              <button onClick={() => { setIsEditModalOpen(false); setEditingProgram(null); }} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 grid grid-cols-1 gap-4">
              <input name="name" value={editingProgram.name} onChange={handleEditChange} placeholder="Program name" className="p-3 border rounded" />
              <input name="duration" value={editingProgram.duration} onChange={handleEditChange} placeholder="Duration (e.g. 8 weeks)" className="p-3 border rounded" />
              <textarea name="description" value={editingProgram.description} onChange={handleEditChange} placeholder="Short description" className="p-3 border rounded h-28" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingProgram(null); }} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={editingSaving} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">
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
