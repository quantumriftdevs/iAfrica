import React, { useEffect, useState } from 'react';
import DataTable from '../../components/student/DataTable';
import { getClasses, getClassToken } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { deriveEnrolledProgramIds, filterClassesByProgramOrCourseIds } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastContext';

const MyClasses = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [joiningClassId, setJoiningClassId] = useState(null);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'schedule', label: 'Schedule' }
  ];

  const colsWithActions = [
    ...columns,
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const id = row._id || row.id;
        return (
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (!id) return toast.push('Unable to join: missing class id', { type: 'error' });

                // quick auth token presence check (context may not be hydrated)
                const token = localStorage.getItem('iafrica-token') || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
                if (!token) {
                  // redirect to login and include return URL to come back to this classroom
                  const returnUrl = encodeURIComponent(`/lecturer/classroom?classId=${encodeURIComponent(id)}`);
                  navigate(`/login?redirect=${returnUrl}`);
                  return;
                }

                try {
                  setJoiningClassId(id);
                  const tokenRes = await getClassToken(id);
                  const tokenData = tokenRes && (tokenRes.data || tokenRes) ? (tokenRes.data || tokenRes) : tokenRes;
                  const t = tokenData?.token || tokenData?.accessToken || tokenData?.jwt || '';
                  const url = tokenData?.url || tokenData?.wsUrl || tokenData?.livekitUrl || '';
                  const params = new URLSearchParams();
                  params.set('classId', id);
                  if (t) params.set('token', t);
                  if (url) params.set('url', url);
                  navigate(`/lecturer/classroom?${params.toString()}`);
                } catch (e) {
                  console.error('Join class error', e);
                  toast.push('Failed to join class. It may not have started yet or you lack permission.', { type: 'error' });
                } finally {
                  setJoiningClassId(null);
                }
              }}
              className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
            >
              {joiningClassId === (row._id || row.id) ? 'Joining...' : 'Join'}
            </button>
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getClasses();
        if (!mounted) return;
        setClasses(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('MyClasses fetch error', e);
        if (mounted) setClasses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">My Classes</h2>
      <div className="bg-white rounded-lg shadow p-4">
        {loading ? (
          <div className="py-8 text-center">Loading classes...</div>
        ) : (() => {
          const programIds = deriveEnrolledProgramIds(user);
          if (programIds.length === 0) return <div className="py-8 text-center text-gray-500">You have not enrolled in any programs yet</div>;
          const matched = filterClassesByProgramOrCourseIds(classes, programIds, []);
          if (matched.length === 0) return <div className="py-8 text-center text-gray-500">No classes available for your enrolled programs</div>;
          return <DataTable columns={colsWithActions} data={matched.map((c, idx) => ({ id: c._id || idx+1, _id: c._id || c.id || idx+1, title: c.name || c.title || 'Untitled', schedule: c.scheduledDate || c.schedule || c.startDate || 'TBA' }))} />;
        })()}
      </div>
    </div>
  );
};

export default MyClasses;
