import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import { getClasses } from '../../utils/api';

const LecturerGrades = () => {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'student', label: 'Student' },
    { key: 'course', label: 'Course' },
    { key: 'grade', label: 'Grade' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getClasses();
        if (!mounted) return;
        // if classes include student grade info, pull them; otherwise empty
        const derived = Array.isArray(res) ? (res.flatMap(c => (c.grades || []).map(g => ({ id: g.id || `${c.id}-${g.studentId}`, student: g.studentName || g.student || 'N/A', course: c.title || c.name || 'N/A', grade: g.score || g.grade || '-' })))) : [];
        setGrades(derived);
      } catch (e) {
        console.error('Grades fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Grades Management</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading grades...</div>
        ) : grades.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No grades to manage</div>
        ) : (
          <DataTable columns={columns} data={grades} />
        )}
      </div>
    </div>
  );
};

export default LecturerGrades;
