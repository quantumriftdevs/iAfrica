import React, { useState, useEffect } from 'react';
import { initializePayment, verifyPayment, getPrograms, formatApiError, getActiveSeasons } from '../utils/api';
import { selectActiveSeasonForProgram, addStoredProgramId } from '../utils/helpers';
import { ChevronRight, Users, Award, Video, CheckCircle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EnrollPage = () => {
  const [programs, setPrograms] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonError, setSeasonError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [user, setUser] = useState();

  const { getCurrentUser } = useAuth();

  useEffect(() => {
    // load programs via API
    let mounted = true;
    (async () => {
      try {
        const data = await getPrograms();
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p, idx) => ({
            id: p._id || idx + 1,
            name: p.name || p.title || `Program ${idx + 1}`,
            description: p.description || p.summary || '',
            image: (p.image && p.image.url) || p.image || p.thumbnail || '',
            grades: Array.isArray(p.grades) ? p.grades : (p.levels || []),
          }));
          setPrograms(mapped);
          // attempt to pre-select if we arrived with a course in route state OR query params
          try {
            const incomingCourse = location?.state?.course;
            if (incomingCourse) {
              const progId = incomingCourse.program || incomingCourse.programId || (incomingCourse.program && (incomingCourse.program._id || incomingCourse.program.id));
              const found = mapped.find(p => String(p.id) === String(progId) || String(p.id) === String(incomingCourse.program) || String(p.id) === String(incomingCourse.programId));
              if (found) {
                setSelectedProgram(found);
                // try match grade if provided on course
                const incomingGrade = incomingCourse.grade || incomingCourse.gradeId || incomingCourse.level || null;
                if (incomingGrade && Array.isArray(found.grades)) {
                  const g = found.grades.find(x => String(x._id || x.id || x.name) === String(incomingGrade));
                  if (g) setSelectedGrade(g);
                }
              } else {
                // fallback: if course contains program info, set minimal program object
                if (incomingCourse.program && incomingCourse.program.name) {
                  setSelectedProgram({ id: incomingCourse.program._id || incomingCourse.program.id, name: incomingCourse.program.name, grades: [] });
                }
              }
            } else {
              // No route state; check for query params (persisted selection after auth redirect)
              const params = new URLSearchParams(location.search);
              const qProgramId = params.get('programId');
              const qGradeId = params.get('gradeId');
              const qCourseId = params.get('courseId');

              if (qProgramId) {
                const found = mapped.find(p => String(p.id) === String(qProgramId) || String(p.id) === String(qProgramId));
                if (found) {
                  setSelectedProgram(found);
                  if (qGradeId && Array.isArray(found.grades)) {
                    const g = found.grades.find(x => String(x._id || x.id || x.name) === String(qGradeId));
                    if (g) setSelectedGrade(g);
                  }
                }
                // if program not found, leave for user to pick; courseId is available if we need it later
              } else if (qCourseId) {
                // If only courseId provided, we can't fully reconstruct program/grade without extra API calls.
                // Optionally store the courseId in selectedProgram as minimal info so the user sees context.
                setSelectedProgram(prev => prev || { id: null, name: `Selected course: ${qCourseId}`, grades: [] });
              }
            }
          } catch {
            // ignore pre-selection errors
          }
        }
      } catch {
        // ignore errors
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [location]);

  useEffect(() => {
    const getStudent = async () => {
      const student = await getCurrentUser();
      setUser(student);
    }

    getStudent();
  }, [getCurrentUser]);

  // Check for payment reference in URL when returning from gateway and verify
  useEffect(() => {
    const ref = localStorage.getItem('paymentReference');
    if (!ref) return;

    let mounted = true;
    (async () => {
      try {
        setProcessingPayment(true);
        const verifyRes = await verifyPayment(ref);
        // support multiple backend shapes: { status: 'success' } or { success: true } or nested data
        const status = verifyRes?.status;
        const ok = (status === 'success') || (verifyRes && verifyRes.success === true) || (verifyRes?.data && (verifyRes.data.status === 'success' || verifyRes.data.success === true));
        if (ok) {
          // prefer backend message when available
          const successMsg = verifyRes?.message || verifyRes?.msg || verifyRes?.data?.message || 'Payment confirmed — you are now enrolled';
          toast.push(successMsg, { type: 'success' });

          // persist the enrolled program id into stored program ids (merge & dedupe)
          try {
            // derive program id from selectedProgram state first, else try response payload
            const fromSelected = selectedProgram?.id || selectedProgram?._id || selectedProgram?.programId || null;
            const fromVerify = verifyRes?.program || verifyRes?.programId || verifyRes?.data?.program || verifyRes?.data?.programId || (verifyRes?.course && (verifyRes.course.program || verifyRes.course.programId)) || (verifyRes?.data && verifyRes.data.course && (verifyRes.data.course.program || verifyRes.data.course.programId));
            const programIdToStore = String(fromSelected || fromVerify || '').trim();
            if (programIdToStore) {
              addStoredProgramId(programIdToStore);
            }
          } catch {
            // ignore errors
          }

          // clear selection and navigate to student dashboard
          setSelectedProgram(null);
          setSelectedGrade(null);
          // cleanup stored payment ref so we don't re-run verification
          try {
            localStorage.removeItem('paymentReference');
          } catch {
            // ignore errors
          }
          navigate('/dashboard');
        } else {
          const failMsg = verifyRes?.message || verifyRes?.error || verifyRes?.msg || 'Payment not confirmed. If you were charged, contact support.';
          toast.push(failMsg, { type: 'error' });
        }
      } catch (e) {
        const msg = formatApiError(e) || 'Unable to verify payment. Please try again or contact support.';
        toast.push(msg, { type: 'error' });
      } finally {
        if (mounted) setProcessingPayment(false);
      }
    })();

    return () => { mounted = false; };
  }, [navigate, toast, selectedProgram]);

  // Helper to fetch and set active season for a program
  const fetchSeasonForProgram = async (programId) => {
    setSeasonLoading(true);
    setSeasonError(null);
    try {
      const match = await selectActiveSeasonForProgram(getActiveSeasons, programId);
      if (match) {
        setSelectedSeason(match);
        setSeasonError(null);
      } else {
        setSelectedSeason(null);
        setSeasonError('No active season found for this program');
      }
    } catch {
      setSelectedSeason(null);
      setSeasonError('Failed to load active seasons');
    } finally {
      setSeasonLoading(false);
    }
  };

  // When selectedProgram changes, attempt to load its active season
  useEffect(() => {
    if (!selectedProgram) {
      setSelectedSeason(null);
      setSeasonError(null);
      return;
    }

    const progId = selectedProgram?._id || selectedProgram?.id || selectedProgram?.id;
    fetchSeasonForProgram(progId);
  }, [selectedProgram]);

  const handleEnroll = async (grade) => {
    setProcessingPayment(true);
    try {
      const token = localStorage.getItem('iafrica-token');
      if (!token) {
        navigate('/login?redirect=/Enroll&mode=signup');
        setProcessingPayment(false);
        return;
      }

      if (!selectedSeason) {
        toast.push('No active season found for the selected program. Please contact support or retry.', { type: 'error' });
        setProcessingPayment(false);
        return;
      }

      const price = parseFloat(grade.price) * 100;

      const payload = {
        program: selectedProgram?.id,
        grade: grade?._id,
        student: user._id,
        amount: price,
        currency: "NGN",
        callbackUrl: window.location.href,
        metadata: {
          program: selectedProgram?.id,
          grade: grade?._id,
        },
      };

      try {
        const match = selectedSeason || await selectActiveSeasonForProgram(getActiveSeasons, payload.program);
        if (match) {
          payload.season = match._id;
          payload.metadata.season = match._id;
        }
      } catch {
        // ignore errors
      }

      localStorage.setItem('enrollingIn', selectedProgram.id);

      const res = await initializePayment(payload);

      const paymentUrl = res.authorizationUrl;
      localStorage.setItem('paymentReference', res.reference);

      window.location.href = paymentUrl;
    } catch (e) {
      const msg = formatApiError(e) || 'Failed to initialize payment. Please try again later.';
      toast.push(msg, { type: 'error' });
    } finally {
      setProcessingPayment(false);
      // keep selection so user can retry or continue; do not auto-clear selection on init
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 mx-auto text-emerald-600 mb-4" />
          <p className="text-emerald-700 font-medium text-lg">Loading available programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-20">
      {/* Hero Section */}
      {!selectedProgram && !selectedGrade && (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white">
          <div className="container mx-auto px-4">
            <div className='max-w-4xl mx-auto text-center transition-all duration-1000 opacity-100 translate-y-0'>
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <img src="/logo.png" alt="iAfrica logo" className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 object-contain" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Enroll in a Program</h1>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 text-emerald-100">
                Invest in yourself and transform your future. Choose from our comprehensive programs with expert lecturers, live interactive classes, and industry-recognized certificates.
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                <span className="bg-emerald-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center">
                  <Video size={14} className="mr-1.5 sm:mr-2" /> Live Classes
                </span>
                <span className="bg-emerald-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center">
                  <Award size={14} className="mr-1.5 sm:mr-2" /> Verified Certificates
                </span>
                <span className="bg-emerald-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center">
                  <Users size={14} className="mr-1.5 sm:mr-2" /> Expert Lecturers
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back Button */}
      {(selectedProgram || selectedGrade) && (
        <div className="pb-4 sm:pb-6 bg-white">
          <div className="container mx-auto px-4">
            <button
              onClick={() => {
                if (selectedGrade) setSelectedGrade(null);
                else setSelectedProgram(null);
              }}
              className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors text-sm sm:text-base md:text-lg"
            >
              <ArrowLeft size={18} /> Back
            </button>
          </div>
        </div>
      )}

      {/* Programs List */}
      {!selectedProgram && (
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="space-y-12 sm:space-y-16 md:space-y-20">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className='transition-all duration-1000 opacity-100 translate-y-0'
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                    <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                      <div className="relative">
                        <img
                          src={program.image}
                          alt={program.name}
                          className="rounded-2xl shadow-xl w-full h-48 sm:h-64 md:h-80 object-cover"
                        />
                      </div>
                    </div>

                    <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{program.name}</h2>
                      <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">{program.description}</p>

                      <button
                        onClick={() => setSelectedProgram(program)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center shadow-lg text-sm sm:text-base"
                      >
                        View Grades
                        <ChevronRight size={18} className="ml-2" />
                      </button>
                    </div>
                  </div>

                  {index < programs.length - 1 && (
                    <div className="border-t border-gray-200 mt-12 sm:mt-16 md:mt-20"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grade Selection */}
      {selectedProgram && !selectedGrade && (
        <section className="py-8 sm:py-10 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className='transition-all duration-1000 opacity-100 translate-y-0'>
              <div className="mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{selectedProgram.name}</h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">{selectedProgram.description}</p>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Choose Your Grade</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {selectedProgram.grades.map((grade, gradeIndex) => (
                  <div
                    key={gradeIndex}
                    className="bg-gradient-to-br from-gray-50 to-emerald-50 p-6 sm:p-8 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl"
                    style={{ transitionDelay: `${gradeIndex * 150}ms` }}
                  >
                    <div className="flex flex-col items-start justify-center mb-6">
                      <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">{grade.name}</h4>
                      <p className="text-base sm:text-lg font-bold text-gray-900 my-2">{grade.description}</p>
                      <span className="bg-emerald-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full font-bold text-base sm:text-xl">
                        ₦ {grade.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedGrade(grade)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      Enroll Now
                      <ChevronRight size={20} className="ml-2" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Payment Section */}
      {selectedGrade && (
        <section className="py-8 sm:py-10 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border-2 border-emerald-100">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="bg-emerald-100 w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CreditCard size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Confirm Your Enrollment</h2>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg">Secure payment powered by Paystack</p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 border-2 border-emerald-200">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-4 border-b border-gray-200 gap-2">
                      <span className="text-gray-600 font-medium text-sm sm:text-base">Program:</span>
                      <span className="font-bold text-gray-900 text-base sm:text-lg text-left sm:text-right">{selectedProgram.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-4 border-b border-gray-200 gap-2">
                      <span className="text-gray-600 font-medium text-sm sm:text-base">Grade:</span>
                      <span className="font-bold text-gray-900 text-base sm:text-lg">{selectedGrade.name}</span>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-gray-800 font-bold text-base sm:text-lg md:text-xl">Total Amount:</span>
                      <span className="text-3xl sm:text-4xl font-bold text-emerald-600">₦{selectedGrade.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 sm:p-5 mb-6 border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">What's Included:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <CheckCircle size={16} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">Live interactive classes via LiveKit</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle size={16} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">Access to all course materials and resources</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle size={16} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">Quizzes and assessments</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle size={16} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">Email notifications for schedules</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle size={16} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">Verified digital certificate upon completion</span>
                    </div>
                  </div>
                </div>

                {processingPayment ? (
                  <button
                    disabled
                    className="w-full bg-emerald-500 text-white py-4 sm:py-5 rounded-xl flex items-center justify-center gap-3 font-bold text-base sm:text-lg md:text-xl"
                  >
                    <Loader2 className="animate-spin w-6 sm:w-7 h-6 sm:h-7" />
                    Processing Payment...
                  </button>
                ) : (
                  <div>
                    {seasonLoading ? (
                      <div className="mb-4 text-center text-xs sm:text-sm text-gray-600">Checking active seasons for this program...</div>
                    ) : seasonError ? (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-yellow-800 mb-3">{seasonError}. Enrollment is blocked until an active season is available.</p>
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              const progId = selectedProgram?._id || selectedProgram?.id || selectedProgram?.id;
                              fetchSeasonForProgram(progId);
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 text-sm"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <button
                      onClick={() => handleEnroll(selectedGrade)}
                      disabled={!selectedSeason}
                      className={`w-full ${!selectedSeason ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'} text-white py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg`}
                    >
                      <CheckCircle size={20} /> Pay ₦{selectedGrade.price.toLocaleString()} & Enroll
                    </button>
                  </div>
                )}

                <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
                  🔒 Secure payment processing. Your data is protected.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!selectedProgram && !selectedGrade && (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Need Help Choosing?</h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-emerald-100 max-w-2xl mx-auto">
              Our advisors are here to help you select the right program based on your goals and experience level.
            </p>
            <button className="bg-white text-emerald-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg text-base sm:text-lg">
              Get Free Consultation
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default EnrollPage;