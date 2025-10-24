import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const DataTable = ({ columns = [], data = [], pageSize = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.min(Math.max(1, newPage), totalPages));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((row, idx) => (
              <tr 
                key={row._id || idx} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-800">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
