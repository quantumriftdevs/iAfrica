import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import { getResources } from '../../utils/api';

const LecturerResources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'course', label: 'Course' },
    { key: 'uploaded', label: 'Uploaded' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getResources();
        if (!mounted) return;
        setResources(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Resources fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Resources</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No resources found</div>
        ) : (
          <DataTable columns={columns} data={resources} />
        )}
      </div>
    </div>
  );
};

export default LecturerResources;
