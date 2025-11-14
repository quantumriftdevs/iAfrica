import React, { useEffect, useState } from 'react';
import { getPrograms } from '../../utils/api';
import { deriveEnrolledProgramIds, getStoredProgramIds } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const StudentPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPrograms();
        if (!mounted) return;
        if (Array.isArray(data)) setPrograms(data);
      } catch (e) {
        console.error('Failed to load programs', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const stored = getStoredProgramIds();
  const derived = deriveEnrolledProgramIds(user);
  const enrolledSet = new Set([...(stored || []), ...(derived || [])].map(String));

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Programs</h1>

      {loading ? (
        <div className="py-12 text-center">Loading programs...</div>
      ) : (!Array.isArray(programs) || programs.length === 0) ? (
        <div className="py-12 text-center text-gray-600">No programs available</div>
      ) : (
        <div className="space-y-12">
          {programs.map((p, idx) => (
            <div key={p._id || p.id || idx} className="bg-white rounded-lg shadow p-6">
              <div className="md:flex md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{p.name}</h2>
                  <p className="text-sm text-gray-600 mt-2">{p.description}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                  {enrolledSet.has(String(p._id || p.id)) ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Enrolled</span>
                  ) : (
                    <button
                      onClick={() => navigate(`/Enroll?programId=${encodeURIComponent(p._id || p.id)}`, { state: { program: p } })}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      Enroll
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>

              {Array.isArray(p.grades) && p.grades.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {p.grades.map((g, gi) => (
                    <div key={g._id || g.id || gi} className="p-4 border rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{g.name}</h4>
                          <p className="text-sm text-gray-600">{g.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">₦{Number(g.price).toLocaleString()}</div>
                          <button
                            onClick={() => navigate(`/Enroll?programId=${encodeURIComponent(p._id || p.id)}&gradeId=${encodeURIComponent(g._id || g.id)}`, { state: { program: p, grade: g } })}
                            className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-sm"
                          >Enroll</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentPrograms;
