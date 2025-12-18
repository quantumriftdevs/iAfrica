import React, { useState, useEffect } from 'react';
import { initializePayment, verifyPayment, getPrograms, formatApiError, getActiveSeasons } from '../utils/api';
import { selectActiveSeasonForProgram } from '../utils/helpers';
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
          // previously we persisted enrolled program ids to localStorage here; no longer needed

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

      const payload = {
        program: selectedProgram?.id,
        grade: grade?._id,
        student: user._id,
        amount: grade.price,
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
        <div className="sticky top-20 pt-6 sm:pt-8 pb-6 sm:pb-8 bg-gradient-to-b from-white via-white to-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
          <div className="container mx-auto px-4">
            <button
              onClick={() => {
                if (selectedGrade) setSelectedGrade(null);
                else setSelectedProgram(null);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-semibold transition-all duration-200 text-sm sm:text-base md:text-lg rounded-lg group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" /> Back
            </button>
          </div>
        </div>
      )}

      {/* Programs List */}
      {!selectedProgram && (
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="space-y-16 sm:space-y-20 md:space-y-24">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className='transition-all duration-1000 opacity-100 translate-y-0'
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center`}>
                    <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <img
                          src={program.image}
                          alt={program.name}
                          className="relative rounded-3xl shadow-2xl w-full h-56 sm:h-72 md:h-96 object-cover group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>

                    <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                      <div className="space-y-6 sm:space-y-8">
                        <div>
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-5 leading-tight">{program.name}</h2>
                          <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">{program.description}</p>
                        </div>

                        <button
                          onClick={() => setSelectedProgram(program)}
                          className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-7 sm:px-9 py-4 sm:py-5 rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl group transform hover:-translate-y-1 text-base sm:text-lg"
                        >
                          View Grades
                          <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {index < programs.length - 1 && (
                    <div className="border-t border-gray-300 mt-16 sm:mt-20 md:mt-24"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grade Selection */}
      {selectedProgram && !selectedGrade && (
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white via-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className='transition-all duration-1000 opacity-100 translate-y-0'>
              <div className="mb-12 sm:mb-14 md:mb-16 max-w-4xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-5 sm:mb-6 leading-tight">{selectedProgram.name}</h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">{selectedProgram.description}</p>
              </div>

              <div className="mb-10 sm:mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Choose Your Grade</h3>
                <div className="h-1 w-20 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full mt-4"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
                {selectedProgram.grades.map((grade, gradeIndex) => (
                  <div
                    key={gradeIndex}
                    className="group bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl overflow-hidden relative"
                    style={{ transitionDelay: `${gradeIndex * 150}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex flex-col items-start justify-center mb-8">
                        <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{grade.name}</h4>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">{grade.description}</p>
                        <div className="inline-block bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 sm:px-7 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl shadow-lg">
                          ₦ {grade.price.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedGrade(grade)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group/btn transform hover:-translate-y-1"
                      >
                        Enroll Now
                        <ChevronRight size={22} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Payment Section */}
      {selectedGrade && (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 md:p-12 border border-gray-100 overflow-hidden relative">
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="text-center mb-8 sm:mb-10">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 w-20 sm:w-24 h-20 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg">
                      <CreditCard size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Confirm Your Enrollment</h2>
                    <p className="text-gray-600 text-base sm:text-lg">🔒 Secure payment powered by Paystack</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-6 sm:p-7 mb-7 border border-emerald-200 shadow-sm">
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-5 border-b border-emerald-100 gap-2">
                      <span className="text-gray-600 font-semibold text-sm sm:text-base">Program:</span>
                      <span className="font-bold text-gray-900 text-base sm:text-lg text-left sm:text-right">{selectedProgram.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-5 border-b border-emerald-100 gap-2">
                      <span className="text-gray-600 font-semibold text-sm sm:text-base">Grade:</span>
                      <span className="font-bold text-gray-900 text-base sm:text-lg">{selectedGrade.name}</span>
                    </div>
                    <div className="pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white rounded-lg p-4 border border-emerald-100">
                      <span className="text-gray-800 font-bold text-lg sm:text-xl">Total Amount:</span>
                      <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">₦{selectedGrade.price.toLocaleString()}</span>
                    </div>
                  </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-xl p-6 sm:p-7 mb-8 border border-emerald-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg sm:text-xl flex items-center">
                    <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 text-sm font-bold">✓</span>
                    What's Included:
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start group">
                      <CheckCircle size={20} className="text-emerald-600 mr-3 mt-0.5 flex-shrink-0 group-hover:text-emerald-700 transition-colors" />
                      <span className="text-gray-700 text-sm sm:text-base font-medium">Live interactive classes via LiveKit</span>
                    </div>
                    <div className="flex items-start group">
                      <CheckCircle size={20} className="text-emerald-600 mr-3 mt-0.5 flex-shrink-0 group-hover:text-emerald-700 transition-colors" />
                      <span className="text-gray-700 text-sm sm:text-base font-medium">Access to all course materials and resources</span>
                    </div>
                    <div className="flex items-start group">
                      <CheckCircle size={20} className="text-emerald-600 mr-3 mt-0.5 flex-shrink-0 group-hover:text-emerald-700 transition-colors" />
                      <span className="text-gray-700 text-sm sm:text-base font-medium">Quizzes and assessments</span>
                    </div>
                    <div className="flex items-start group">
                      <CheckCircle size={20} className="text-emerald-600 mr-3 mt-0.5 flex-shrink-0 group-hover:text-emerald-700 transition-colors" />
                      <span className="text-gray-700 text-sm sm:text-base font-medium">Email notifications for schedules</span>
                    </div>
                    <div className="flex items-start group">
                      <CheckCircle size={20} className="text-emerald-600 mr-3 mt-0.5 flex-shrink-0 group-hover:text-emerald-700 transition-colors" />
                      <span className="text-gray-700 text-sm sm:text-base font-medium">Verified digital certificate upon completion</span>
                    </div>
                  </div>
                  </div>

                  {processingPayment ? (
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 sm:py-5 rounded-xl flex items-center justify-center gap-3 font-bold text-base sm:text-lg md:text-xl shadow-lg"
                  >
                    <Loader2 className="animate-spin w-6 sm:w-7 h-6 sm:h-7" />
                    Processing Payment...
                  </button>
                ) : (
                  <div className="space-y-4">
                    {seasonLoading ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                        <p className="text-sm sm:text-base text-blue-800 font-medium">Checking active seasons for this program...</p>
                      </div>
                    ) : seasonError ? (
                      <div className="p-5 bg-yellow-50 border-2 border-yellow-300 rounded-xl text-center">
                        <p className="text-sm sm:text-base text-yellow-900 font-semibold mb-4">{seasonError}</p>
                        <p className="text-xs sm:text-sm text-yellow-800 mb-4">Enrollment is blocked until an active season is available.</p>
                        <button
                          onClick={() => {
                            const progId = selectedProgram?._id || selectedProgram?.id || selectedProgram?.id;
                            fetchSeasonForProgram(progId);
                          }}
                          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm shadow-md"
                        >
                          Retry
                        </button>
                      </div>
                    ) : null}

                    <button
                      onClick={() => handleEnroll(selectedGrade)}
                      disabled={!selectedSeason}
                      className={`w-full py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                        !selectedSeason 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                      }`}
                    >
                      <CheckCircle size={22} /> Pay ₦{selectedGrade.price.toLocaleString()} & Enroll
                    </button>
                  </div>
                  )}

                  <p className="text-center text-xs sm:text-sm text-gray-500 mt-5 font-medium">
                    🔒 Secure payment processing. Your data is protected by industry-standard encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!selectedProgram && !selectedGrade && (
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mb-48"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 leading-tight">Need Help Choosing?</h2>
              <p className="text-base sm:text-lg md:text-xl mb-10 sm:mb-12 text-emerald-50 leading-relaxed">
                Our advisors are here to help you select the right program based on your goals and experience level. Get personalized guidance from industry experts.
              </p>
              <button className="inline-block bg-white text-emerald-700 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-2xl text-base sm:text-lg group transform hover:-translate-y-1">
                Get Free Consultation
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default EnrollPage;