import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getCertificates } from '../../utils/api';

const CertificatesPage = () => {
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState([]);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'issued', label: 'Issued' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCertificates();
        if (!mounted) return;
        setCerts(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Certificates fetch error', e);
        if (mounted) setCerts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">My Certificates</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading certificates...</div>
        ) : certs.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No certificates found</div>
        ) : (
          <DataTable columns={columns} data={certs.map((c, idx) => ({ id: c._id || idx+1, title: c.title || c.name || 'Untitled', issued: c.issuedAt || c.issued || 'Unknown' }))} />
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
