import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getCertificates } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { Award } from 'lucide-react';

const CertificatesPage = () => {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'date', label: 'Date', render: (v, row) => formatDate(v || row.issuedAt || row.createdAt || row.date) }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Certificates</h1>
          <p className="text-gray-600">View and manage student certificates</p>
        </div>

        {loading ? (
          <div className="py-12 text-center mt-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-12 text-center mt-8">
            <Award size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No certificates found</p>
          </div>
        ) : (
          <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
              <DataTable columns={columns} data={certificates} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
