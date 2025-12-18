import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getPayments } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { DollarSign } from 'lucide-react';

const PaymentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status', render: (v, row) => (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        (v || row.status || '').toLowerCase() === 'success' ? 'bg-green-100 text-green-800' :
        (v || row.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {v || row.status || 'Unknown'}
      </span>
    ) },
    { key: 'date', label: 'Date', render: (v, row) => formatDate(v || row.createdAt || row.updatedAt || row.date) }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getPayments();
        if (!mounted) return;
        setPayments(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Payments fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Payments</h2>
          <p className="text-gray-600">Track and manage all platform payments</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Payment Records</h3>
                <p className="text-gray-600 text-sm mt-1">Complete transaction history</p>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No payments found</p>
              <p className="text-gray-500 text-sm mt-2">Payment records will appear here</p>
            </div>
          ) : (
            <DataTable columns={columns} data={payments} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
