import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getCourses, createCourse, getPrograms, updateCourse, deleteCourse, formatApiError, getGrades, getLecturers } from '../../utils/api';
import { X, Plus, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Courses</h2>
            <p className="text-gray-600">Manage all courses and their assignments</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl">
            <Plus size={18} /> Create Course
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Courses</h3>
            <p className="text-gray-600 text-sm mt-1">Complete list of courses in the system</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No courses found</p>
              <p className="text-gray-500 text-sm mt-2">Create a new course to get started</p>
            </div>
          ) : (
            <DataTable columns={columns} data={courses} />
          )}
          {/* Confirm delete modal */}
          <ConfirmModal open={isDeleteOpen} title="Delete course" message="Delete this course?" onCancel={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} onConfirm={confirmDelete} />
        </div>
      </div>

      {/* Edit Course Modal */}
      {isEditModalOpen && editingCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h4 className="text-2xl font-bold text-gray-900">Edit Course</h4>
              <button onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input name="title" value={editingCourse.title} onChange={handleEditChange} placeholder="Course title" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select name="programId" value={editingCourse.programId} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select program</option>
                  {programs.map((p) => <option key={p._id || p.id} value={p._id || p.id}>{p.name || p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <select name="gradeId" value={editingCourse.gradeId} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select grade</option>
                  {grades.map((g) => <option key={g._id || g.id} value={g._id || g.id}>{g.name || g.level || g.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lecturer</label>
                <select name="lecturerId" value={editingCourse.lecturerId} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select lecturer</option>
                  {lecturers.map((l) => <option key={l._id || l.id} value={l._id || l.id}>{lecturerLabel(l)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="description" value={editingCourse.description} onChange={handleEditChange} placeholder="Short description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-28" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingCourse(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={editing} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{editing ? 'Updating...' : 'Update Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h4 className="text-2xl font-bold text-gray-900">Create Course</h4>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Course title" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select name="programId" value={form.programId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select program</option>
                  {programs.map((p) => <option key={p._id || p.id} value={p._id || p.id}>{p.name || p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <select name="gradeId" value={form.gradeId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select grade</option>
                  {grades.map((g) => <option key={g._id || g.id} value={g._id || g.id}>{g.name || g.level || g.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lecturer</label>
                <select name="lecturerId" value={form.lecturerId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select lecturer</option>
                  {lecturers.map((l) => <option key={l._id || l.id} value={l._id || l.id}>{lecturerLabel(l)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-28" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{creating ? 'Creating...' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
