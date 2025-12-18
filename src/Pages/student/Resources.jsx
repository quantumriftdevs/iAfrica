import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import { getResources } from '../../utils/api';
import { BookOpen } from 'lucide-react';

const LecturerResources = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'course', label: 'Course' },
    { 
      key: 'fileUrl', 
      label: 'Material',
      render: (value, _row) => (
        value ? (
          <a
            href={value}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Download
          </a>
        ) : (
          <span className="text-gray-500">-</span>
        )
      ),
    },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getResources();
        if (!mounted) return;
        setResources(Array.isArray(res) ? res.map((resource) => ({
          ...resource,
          course: resource.courseId?.name || '-',
        })) : []);
      } catch (e) {
        console.error('Resources fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Resources</h2>
            <p className="text-gray-600">Manage and share learning resources with students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Resources</h3>
            <p className="text-gray-600 text-sm mt-1">List of all uploaded learning resources</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No resources uploaded</p>
              <p className="text-gray-500 text-sm mt-2">Upload your first resource to share with students</p>
            </div>
          ) : (
            <DataTable columns={columns} data={resources} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerResources;
