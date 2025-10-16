import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getCertificates } from '../../utils/api';

const CertificatesPage = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'date', label: 'Date' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCertificates();
        if (!mounted) return;
        setCertificates(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Certificates fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Certificates</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading certificates...</div>
        ) : certificates.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No certificates found</div>
        ) : (
          <DataTable columns={columns} data={certificates} />
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
