import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getPayments } from '../../utils/api';

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' }
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
        if (mounted) setPayments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">My Payments</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No payments found</div>
        ) : (
          <DataTable columns={columns} data={payments.map((p, idx) => ({ id: p._id || idx+1, amount: p.amount || p.total || '0', status: p.status || 'unknown' }))} />
        )}
      </div>
    </div>
  );
};

export default Payments;
