import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getClasses } from '../../utils/api';

const ClassesPage = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'status', label: 'Status' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getClasses();
        if (!mounted) return;
        setClasses(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Classes fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Classes</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No classes found</div>
        ) : (
          <DataTable columns={columns} data={classes} />
        )}
      </div>
    </div>
  );
};

export default ClassesPage;
