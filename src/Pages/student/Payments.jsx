import React from 'react';
import DataTable from '../../components/student/DataTable';

const Payments = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">My Payments</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  );
};

export default Payments;
