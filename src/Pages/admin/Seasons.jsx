import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getSeasons } from '../../utils/api';

const SeasonsPage = () => {
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'start', label: 'Start' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getSeasons();
        if (!mounted) return;
        setSeasons(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Seasons fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Seasons</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading seasons...</div>
        ) : seasons.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No seasons found</div>
        ) : (
          <DataTable columns={columns} data={seasons} />
        )}
      </div>
    </div>
  );
};

export default SeasonsPage;
