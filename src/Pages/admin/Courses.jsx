import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getCourses } from '../../utils/api';

const CoursesPage = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'program', label: 'Program' },
    { key: 'status', label: 'Status' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCourses();
        if (!mounted) return;
        setCourses(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Courses fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Courses</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No courses found</div>
        ) : (
          <DataTable columns={columns} data={courses} />
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
