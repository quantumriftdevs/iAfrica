import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getCourses, createCourse, getPrograms, updateCourse, deleteCourse, formatApiError, getGrades, getLecturers } from '../../utils/api';
import { X } from 'lucide-react';
import { useToast } from '../../components/ui/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

const CoursesPage = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  // supporting lists
  const [programs, setPrograms] = useState([]);
  const [grades, setGrades] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  const getProgramText = (row) => {
    const p = row.program || row.programId || row.programObj || null;
    if (!p) return '';
    if (typeof p === 'string') return p;
    return p.name || p.title || p._id || p.id || '';
  };
  const getStatusText = (row) => {
    if (typeof row.isActive === 'boolean') return row.isActive ? 'Active' : 'Inactive';
    if (row.status) return String(row.status);
    return '';
  };

  const columns = [
    { key: 'name', label: 'Title' },
    { key: 'program', label: 'Program', render: (_v, row) => getProgramText(row) },
    { key: 'status', label: 'Status', render: (_v, row) => getStatusText(row) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_v, row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => openEdit(row)} className="text-blue-600 hover:underline">Edit</button>
          <button onClick={() => handleDeleteCourse(row._id || row.id)} className="text-red-600 hover:underline">Delete</button>
        </div>
      )
    }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // fetch in parallel
        const [coursesRes, programsRes, gradesRes, lecturersRes] = await Promise.allSettled([
          getCourses(),
          getPrograms(),
          getGrades(),
          getLecturers()
        ]);

        const fetchedCourses = (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) ? coursesRes.value : [];
        const fetchedPrograms = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];
        const fetchedGrades = (gradesRes.status === 'fulfilled' && Array.isArray(gradesRes.value)) ? gradesRes.value : [];
        const fetchedLecturers = (lecturersRes.status === 'fulfilled' && Array.isArray(lecturersRes.value)) ? lecturersRes.value : [];

        if (!mounted) return;

        setCourses(fetchedCourses);
        setPrograms(fetchedPrograms);
        setGrades(fetchedGrades);
        setLecturers(fetchedLecturers);
      } catch (e) {
        console.error('Courses fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // create form state
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', programId: '', gradeId: '', lecturerId: '', description: '' });
  const toast = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.push('Please provide course title', { type: 'error' });
      return;
    }
    setCreating(true);
    try {
      const payload = {
        name: form.title,
        description: form.description || undefined,
        program: form.programId || undefined,
        grade: form.gradeId || undefined,
        lecturer: form.lecturerId || undefined,
        isActive: true,
      };
      await createCourse(payload);
      const res = await getCourses();
      setCourses(Array.isArray(res) ? res : []);
      setForm({ title: '', programId: '', gradeId: '', lecturerId: '', description: '' });
      setIsModalOpen(false);
      toast.push('Course created successfully', { type: 'success' });
    } catch (err) {
      console.error('Create course error', err);
      toast.push(formatApiError(err) || 'Failed to create course', { type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // Edit state and handlers
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editing, setEditing] = useState(false);

  const openEdit = (course) => {
    setEditingCourse({
      id: course._id || course.id,
      _id: course._id || course.id,
      title: course.title || course.name || '',
      programId: course.programId || (course.program && (course.program._id || course.program.id)) || '',
      gradeId: course.gradeId || (course.grade && (course.grade._id || course.grade.id)) || '',
      lecturerId: course.lecturer ? (typeof course.lecturer === 'string' ? course.lecturer : (course.lecturer._id || course.lecturer.id)) : (course.lecturerId || ''),
      description: course.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => setEditingCourse({ ...editingCourse, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse._id) return;
    setEditing(true);
    try {
      const payload = {
        title: editingCourse.title,
        programId: editingCourse.programId || undefined,
        gradeId: editingCourse.gradeId || undefined,
        lecturer: editingCourse.lecturerId || undefined,
        description: editingCourse.description || undefined
      };
      await updateCourse(editingCourse._id, payload);
      const res = await getCourses();
      setCourses(Array.isArray(res) ? res : []);
      setIsEditModalOpen(false);
      setEditingCourse(null);
      toast.push('Course updated', { type: 'success' });
    } catch (err) {
      console.error('Update course error', err);
      toast.push(formatApiError(err) || 'Failed to update course', { type: 'error' });
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    setDeleteTarget(id);
    setIsDeleteOpen(true);
  };

  // delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return setIsDeleteOpen(false);
    try {
      await deleteCourse(deleteTarget);
      const res = await getCourses();
      setCourses(Array.isArray(res) ? res : []);
      toast.push('Course deleted', { type: 'success' });
    } catch (err) {
      console.error('Delete course error', err);
      toast.push(formatApiError(err) || 'Failed to delete course', { type: 'error' });
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // helper to render lecturer option label
  const lecturerLabel = (lec) => {
    if (!lec) return '';
    return lec.name || lec.fullName || `${lec.firstName || ''} ${lec.lastName || ''}`.trim() || lec._id || lec.id || '';
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Courses</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Courses</h3>
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded">Create Course</button>
        </div>
        {loading ? (
          <div className="py-8 text-center">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No courses found</div>
        ) : (
          <DataTable columns={columns} data={courses} />
        )}
        {/* Confirm delete modal */}
        <ConfirmModal open={isDeleteOpen} title="Delete course" message="Delete this course?" onCancel={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} onConfirm={confirmDelete} />
      </div>

      {/* Edit Course Modal */}
      {isEditModalOpen && editingCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Edit Course</h4>
              <button onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); }} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 gap-4">
              <input name="title" value={editingCourse.title} onChange={handleEditChange} placeholder="Course title" className="p-3 border rounded" />
              <select name="programId" value={editingCourse.programId} onChange={handleEditChange} className="p-3 border rounded">
                <option value="">Select program</option>
                {programs.map((p) => <option key={p._id || p.id} value={p._id || p.id}>{p.name || p.title}</option>)}
              </select>
              <select name="gradeId" value={editingCourse.gradeId} onChange={handleEditChange} className="p-3 border rounded">
                <option value="">Select grade</option>
                {grades.map((g) => <option key={g._id || g.id} value={g._id || g.id}>{g.name || g.level || g.title}</option>)}
              </select>
              <select name="lecturerId" value={editingCourse.lecturerId} onChange={handleEditChange} className="p-3 border rounded">
                <option value="">Select lecturer</option>
                {lecturers.map((l) => <option key={l._id || l.id} value={l._id || l.id}>{lecturerLabel(l)}</option>)}
              </select>
              <textarea name="description" value={editingCourse.description} onChange={handleEditChange} placeholder="Short description" className="p-3 border rounded h-28" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); }} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={editing} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{editing ? 'Updating...' : 'Update Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Create Course</h4>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 gap-4">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Course title" className="p-3 border rounded" />
              <select name="programId" value={form.programId} onChange={handleChange} className="p-3 border rounded">
                <option value="">Select program</option>
                {programs.map((p) => <option key={p._id || p.id} value={p._id || p.id}>{p.name || p.title}</option>)}
              </select>
              <select name="gradeId" value={form.gradeId} onChange={handleChange} className="p-3 border rounded">
                <option value="">Select grade</option>
                {grades.map((g) => <option key={g._id || g.id} value={g._id || g.id}>{g.name || g.level || g.title}</option>)}
              </select>
              <select name="lecturerId" value={form.lecturerId} onChange={handleChange} className="p-3 border rounded">
                <option value="">Select lecturer</option>
                {lecturers.map((l) => <option key={l._id || l.id} value={l._id || l.id}>{lecturerLabel(l)}</option>)}
              </select>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="p-3 border rounded h-28" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={creating} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{creating ? 'Creating...' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
