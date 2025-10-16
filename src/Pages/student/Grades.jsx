import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getClasses } from '../../utils/api';

const GradesPage = () => {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'course', label: 'Course' },
    { key: 'grade', label: 'Grade' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getClasses();
        if (!mounted) return;
        // Attempt to derive grades from classes if the API provides them.
        const derived = [];
        if (Array.isArray(res)) {
          res.forEach((c) => {
            if (Array.isArray(c.grades)) {
              c.grades.forEach((g) => {
                derived.push({ id: g.id || `${c.id}-${g.studentId || 's'}`, course: c.name || c.title || 'Untitled', grade: g.value ?? g.score ?? 'N/A' });
              });
            }
          });
        }
        setGrades(derived);
      } catch (e) {
        console.error('Grades fetch error', e);
        if (mounted) setGrades([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">My Grades</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading grades...</div>
        ) : grades.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No grades available</div>
        ) : (
          <DataTable columns={columns} data={grades} />
        )}
      </div>
    </div>
  );
};

export default GradesPage;
