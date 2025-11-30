import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getCertificates } from '../../utils/api';
import { Award } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">My Certificates</h2>
          <p className="text-gray-600">View all certificates you've earned</p>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Earned Certificates</h3>
            <p className="text-gray-600 text-sm mt-1">All certificates you've successfully obtained</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : certs.length === 0 ? (
            <div className="py-12 text-center">
              <Award size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No certificates yet</p>
              <p className="text-gray-500 text-sm mt-2">Complete courses to earn certificates</p>
            </div>
          ) : (
            <DataTable columns={columns} data={certs.map((c, idx) => ({ id: c._id || idx+1, title: c.title || c.name || 'Untitled', issued: c.issuedAt || c.issued || 'Unknown' }))} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificatesPage;
