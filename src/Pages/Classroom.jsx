import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClass, getClassToken } from '../utils/api';
import { formatDate } from '../utils/helpers';
import LiveClassroom from '../components/LiveClassroom';

const Classroom = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Basic auth guard: redirect to login if no token present in localStorage
    const token = localStorage.getItem('iafrica-token');
    if (!token) {
      const returnUrl = encodeURIComponent(`/classroom/${encodeURIComponent(classId || '')}`);
      navigate(`/login?redirect=${returnUrl}`);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        if (!classId) throw new Error('Missing class id');
        const info = await getClass(classId);
        if (!mounted) return;
        setClassInfo(info || null);

        // Try to request a token. Server may refuse if class not started yet.
        try {
          const tk = await getClassToken(classId);
          if (!mounted) return;
          const tokenData = tk && (tk.data || tk) ? (tk.data || tk) : tk;
          setTokenInfo(tokenData || null);
        } catch {
          // token may not be available yet (class not started). We'll show waiting UI.
          if (mounted) setTokenInfo(null);
        }
      } catch (e) {
        console.error('Classroom load error', e);
        if (mounted) setError(e?.message || 'Failed to load classroom');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [classId, navigate]);

  // If we have a tokenInfo, this is where you would initialize your video/RTC SDK.
  // For now we show a simple connected state and the token/url details for debugging.

  if (loading) return <div className="container mx-auto px-4 py-10">Loading classroom...</div>;

  if (error) return <div className="container mx-auto px-4 py-10 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Classroom</h2>
      {classInfo ? (
        <div className="mb-4">
          <div className="font-semibold">{classInfo.name || classInfo.title || classInfo.course || 'Live Class'}</div>
          <div className="text-sm text-gray-600">Scheduled: {formatDate(classInfo.scheduledDate || classInfo.startDate) || 'TBA'}</div>
        </div>
      ) : null}
      {!tokenInfo ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-3">The class is not yet available to join. The lecturer may not have started the session.</p>
          <p className="text-sm text-gray-500">We will try again when you refresh or when the lecturer starts the class.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <LiveClassroom tokenInfo={tokenInfo} classId={classId} />
        </div>
      )}
    </div>
  );
};

export default Classroom;
