import React from 'react';
import DataTable from '../../components/admin/DataTable';

const CertificatesPage = () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'recipient', label: 'Recipient' },
    { key: 'date', label: 'Date' }
  ];

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Certificates</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  );
};

export default CertificatesPage;
