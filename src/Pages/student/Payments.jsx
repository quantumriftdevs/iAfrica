import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getUserPayments } from '../../utils/api';
import { DollarSign } from 'lucide-react';

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  const columns = [
    { key: 'amount', label: 'Amount' },
    { key: 'paymentMethod', label: 'Payment Method' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (v) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          (v || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
          (v || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {v || 'Unknown'}
        </span>
      )
    }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getUserPayments();
        if (!mounted) return;
        setPayments(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Payments fetch error', e);
        if (mounted) setPayments([]);
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
          <h2 className="text-4xl font-bold text-gray-900 mb-2">My Payments</h2>
          <p className="text-gray-600">Track all your payment transactions</p>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
              <p className="text-gray-600 text-sm mt-1">All transactions and payment records</p>
            </div>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No payments yet</p>
              <p className="text-gray-500 text-sm mt-2">Your payment history will appear here</p>
            </div>
          ) : (
            <DataTable columns={columns} data={payments.map((p, idx) => ({ id: p._id || idx+1, amount: p.amount || p.total || '0', status: p.status || 'unknown' }))} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
