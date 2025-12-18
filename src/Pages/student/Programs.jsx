import React, { useEffect, useState } from 'react';
import { getPrograms } from '../../utils/api';
import { deriveEnrolledProgramIds } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen } from 'lucide-react';

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

  const derived = deriveEnrolledProgramIds(user);
  const enrolledSet = new Set((derived || []).map(String));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Programs</h1>
          <p className="text-gray-600">Explore and enroll in our educational programs</p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : (!Array.isArray(programs) || programs.length === 0) ? (
          <div className="py-12 text-center mt-8">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No programs available</p>
          </div>
        ) : (
          <div className="space-y-6 mt-8">
            {programs.map((p, idx) => (
              <div key={p._id || p.id || idx} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="md:flex md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{p.name}</h2>
                      <p className="text-gray-600 mt-2 leading-relaxed">{p.description}</p>
                      {p.duration && <p className="text-sm text-gray-500 mt-2">Duration: <span className="font-medium">{p.duration}</span></p>}
                    </div>
                    <div className="mt-4 md:mt-0 flex-shrink-0">
                      {enrolledSet.has(String(p._id || p.id)) ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold text-sm">✓ Enrolled</span>
                      ) : (
                        <button
                          onClick={() => navigate(`/Enroll?programId=${encodeURIComponent(p._id || p.id)}`, { state: { program: p } })}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                        >
                          Enroll
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {Array.isArray(p.grades) && p.grades.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Grades</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {p.grades.map((g, gi) => (
                          <div key={g._id || g.id || gi} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{g.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{g.description}</p>
                              </div>
                              <div className="text-right ml-4 flex-shrink-0">
                                <div className="text-xl font-bold text-emerald-600">₦{Number(g.price).toLocaleString()}</div>
                                <button
                                  onClick={() => navigate(`/Enroll?programId=${encodeURIComponent(p._id || p.id)}&gradeId=${encodeURIComponent(g._id || g.id)}`, { state: { program: p, grade: g } })}
                                  className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors font-medium"
                                >Enroll</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPrograms;
