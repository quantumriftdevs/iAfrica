import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getPrograms } from '../../utils/api';

const ProgramsPage = () => {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'courses', label: 'Courses' },
    { key: 'status', label: 'Status' }
  ];

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

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Programs</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No programs found</div>
        ) : (
          <DataTable columns={columns} data={programs} />
        )}
      </div>
    </div>
  );
};

export default ProgramsPage;
