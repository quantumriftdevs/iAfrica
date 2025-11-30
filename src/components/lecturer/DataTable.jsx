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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      {/* Search Bar */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 via-gray-50 to-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-widest">
                ID
              </th>
              {columns.map((col) => (
                <th key={col.key} className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-widest">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((row, idx) => (
              <tr 
                key={row._id || idx} 
                className="hover:bg-blue-50/40 transition-colors duration-200 cursor-pointer"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-700">{ idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-600">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-50">
        <div className="text-sm text-gray-600 font-medium">
          Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(startIndex + pageSize, filteredData.length)}</span> of <span className="font-semibold text-gray-900">{filteredData.length}</span> entries
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-sm text-gray-700 font-semibold px-4 py-1 bg-gray-100 rounded-lg">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
