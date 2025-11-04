import React, { useState, useEffect } from 'react';
import { initializePayment, getPrograms, formatApiError, getActiveSeasons } from '../utils/api';
import { selectActiveSeasonForProgram } from '../utils/helpers';
import { ChevronRight, Users, Award, Video, CheckCircle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
          } catch (e) {
            // ignore pre-selection errors
            console.warn('pre-selection parse error', e);
          }
        }
      } catch {
        console.error('Programs fetch error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [location]);

  // Check for payment reference in URL when returning from gateway and verify
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || params.get('trxref') || params.get('payment_reference') || params.get('paymentRef');
    if (!ref) return;

    let mounted = true;
    (async () => {
      try {
        setProcessingPayment(true);
        const verifyRes = await (await import('../utils/api')).verifyPayment(ref);
        if (!mounted) return;
        const status = verifyRes?.status || verifyRes?.payment_status || verifyRes?.data?.status || (verifyRes?.success ? 'success' : 'failed');
        if (status === 'success' || status === 'paid' || status === 'completed') {
          toast.push('Payment confirmed — you are now enrolled. Check your email for access details.', { type: 'success' });
          // clear selection and navigate to student dashboard
          setSelectedProgram(null);
          setSelectedGrade(null);
          navigate('/dashboard');
        } else {
          toast.push('Payment not confirmed. If you were charged, contact support.', { type: 'error' });
        }
      } catch (e) {
        console.error('Payment verification error', e);
        const msg = formatApiError(e) || 'Unable to verify payment. Please try again or contact support.';
        toast.push(msg, { type: 'error' });
      } finally {
        if (mounted) setProcessingPayment(false);
      }
    })();

    return () => { mounted = false; };
  }, [navigate, toast]);

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
    } catch (err) {
      console.error('Season fetch error', err);
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
      // Require an auth token before initializing payment. Some flows redirect here
      // without fully hydrating `user` in context, so prefer checking localStorage for
      // a token. If none found, send the user to signup/login and let them return.
      const token = localStorage.getItem('iafrica-token');
      if (!token) {
        // redirect to login/signup and preserve return URL so they come back to this enroll page
        navigate('/login?redirect=/Enroll&mode=signup');
        setProcessingPayment(false);
        return;
      }
      // Ensure an active season is selected for this program before proceeding
      if (!selectedSeason) {
        toast.push('No active season found for the selected program. Please contact support or retry.', { type: 'error' });
        setProcessingPayment(false);
        return;
      }

      // Build payload expected by backend initialize endpoint
      const payload = {
        program: selectedProgram?.id,
        grade: grade?._id,
        callbackUrl: window.location.href,
      };

      // Select an active season that matches the selected program (if any)
      try {
        // If we already have selectedSeason (fetched earlier), use that; otherwise try a last-minute match
        const match = selectedSeason || await selectActiveSeasonForProgram(getActiveSeasons, payload.program);
        if (match) {
          payload.season = match._id;
        }
      } catch (e) {
        // ignore season selection failures; payment can still proceed if backend supports it
        console.warn('Failed to auto-select season', e);
      }

      console.log({ payload });

      const res = await initializePayment(payload);

      console.log({ res });

      // Expecting a payment url in response; common keys: authorization_url, data.authorization_url, checkout_url
      const paymentUrl = res?.authorization_url || res?.data?.authorization_url || res?.checkout_url || res?.data?.checkout_url || res?.payment_url || res?.gateway_url;

      if (paymentUrl) {
        // redirect in same tab to make the flow simpler for verification
        window.location.href = paymentUrl;
      } else {
        // If API returned inline data (e.g., paystack reference), show a toast so the user can continue
        toast.push('Payment initialized. Please complete payment on the provided page.', { type: 'info' });
      }
    } catch (e) {
      console.error('Payment initialization error', e);
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
        <section className="py-20 bg-gradient-to-br from-emerald-900 to-emerald-700 text-white">
          <div className="container mx-auto px-4">
            <div className='max-w-4xl mx-auto text-center transition-all duration-1000 opacity-100 translate-y-0'>
              <div className="flex items-center justify-center mb-6">
                <img src="/logo.png" alt="iAfrica logo" className="w-24 h-24 object-contain" />
              </div>
              <h1 className="text-5xl font-bold mb-6">Enroll in a Program</h1>
              <p className="text-xl leading-relaxed mb-8 text-emerald-100">
                Invest in yourself and transform your future. Choose from our comprehensive programs with expert lecturers, live interactive classes, and industry-recognized certificates.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Video size={16} className="mr-2" /> Live Classes
                </span>
                <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Award size={16} className="mr-2" /> Verified Certificates
                </span>
                <span className="bg-emerald-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <Users size={16} className="mr-2" /> Expert Lecturers
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back Button */}
      {(selectedProgram || selectedGrade) && (
        <div className="pb-6 bg-white">
          <div className="container mx-auto px-4">
            <button
              onClick={() => {
                if (selectedGrade) setSelectedGrade(null);
                else setSelectedProgram(null);
              }}
              className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors text-lg"
            >
              <ArrowLeft size={20} /> Back
            </button>
          </div>
        </div>
      )}

      {/* Programs List */}
      {!selectedProgram && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="space-y-20">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className='transition-all duration-1000 opacity-100 translate-y-0'
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                    <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                      <div className="relative">
                        <img
                          src={program.image}
                          alt={program.name}
                          className="rounded-2xl shadow-xl w-full h-80 object-cover"
                        />
                      </div>
                    </div>

                    <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                      <h2 className="text-4xl font-bold text-gray-900 mb-4">{program.name}</h2>
                      <p className="text-xl text-gray-600 mb-6 leading-relaxed">{program.description}</p>

                      <button
                        onClick={() => setSelectedProgram(program)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center shadow-lg"
                      >
                        View Grades
                        <ChevronRight size={20} className="ml-2" />
                      </button>
                    </div>
                  </div>

                  {index < programs.length - 1 && (
                    <div className="border-t border-gray-200 mt-12"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grade Selection */}
      {selectedProgram && !selectedGrade && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className='transition-all duration-1000 opacity-100 translate-y-0'>
              <div className="mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{selectedProgram.name}</h2>
                <p className="text-xl text-gray-600 leading-relaxed">{selectedProgram.description}</p>
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Grade</h3>

              <div className="grid md:grid-cols-2 gap-8">
                {selectedProgram.grades.map((grade, gradeIndex) => (
                  <div
                    key={gradeIndex}
                    className="bg-gradient-to-br from-gray-50 to-emerald-50 p-8 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl"
                    style={{ transitionDelay: `${gradeIndex * 150}ms` }}
                  >
                    <div className="flex flex-col items-start justify-center mb-6">
                      <h4 className="text-3xl font-bold text-gray-900">{grade.name}</h4>
                      <p className="text-lg font-bold text-gray-900 my-2">{grade.description}</p>
                      <span className="bg-emerald-600 text-white px-5 py-3 rounded-full font-bold text-xl">
                        ₦ {grade.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedGrade(grade)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      Enroll Now
                      <ChevronRight size={24} className="ml-2" />
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
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl shadow-2xl p-10 border-2 border-emerald-100">
                <div className="text-center mb-8">
                  <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={40} className="text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Enrollment</h2>
                  <p className="text-gray-600 text-lg">Secure payment powered by Paystack</p>
                </div>

                <div className="bg-white rounded-xl p-6 mb-6 border-2 border-emerald-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Program:</span>
                      <span className="font-bold text-gray-900 text-lg text-right">{selectedProgram.name}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Grade:</span>
                      <span className="font-bold text-gray-900 text-lg">{selectedGrade.name}</span>
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                      <span className="text-gray-800 font-bold text-xl">Total Amount:</span>
                      <span className="text-4xl font-bold text-emerald-600">₦{selectedGrade.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-5 mb-6 border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">What's Included:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <CheckCircle size={18} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Live interactive classes via LiveKit</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle size={18} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Access to all course materials and resources</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle size={18} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Quizzes and assessments</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle size={18} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Email notifications for schedules</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle size={18} className="text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Verified digital certificate upon completion</span>
                    </div>
                  </div>
                </div>

                {processingPayment ? (
                  <button
                    disabled
                    className="w-full bg-emerald-500 text-white py-5 rounded-xl flex items-center justify-center gap-3 font-bold text-xl"
                  >
                    <Loader2 className="animate-spin w-7 h-7" />
                    Processing Payment...
                  </button>
                ) : (
                  <div>
                    {seasonLoading ? (
                      <div className="mb-4 text-center text-sm text-gray-600">Checking active seasons for this program...</div>
                    ) : seasonError ? (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-sm text-yellow-800 mb-3">{seasonError}. Enrollment is blocked until an active season is available.</p>
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              const progId = selectedProgram?._id || selectedProgram?.id || selectedProgram?.id;
                              fetchSeasonForProgram(progId);
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <button
                      onClick={() => handleEnroll(selectedGrade)}
                      disabled={!selectedSeason}
                      className={`w-full ${!selectedSeason ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'} text-white py-5 rounded-xl font-bold text-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg`}
                    >
                      <CheckCircle size={24} /> Pay ₦{selectedGrade.price.toLocaleString()} & Enroll
                    </button>
                  </div>
                )}

                <p className="text-center text-sm text-gray-500 mt-4">
                  🔒 Secure payment processing. Your data is protected.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!selectedProgram && !selectedGrade && (
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Need Help Choosing?</h2>
            <p className="text-xl mb-8 text-emerald-100 max-w-2xl mx-auto">
              Our advisors are here to help you select the right program based on your goals and experience level.
            </p>
            <button className="bg-white text-emerald-700 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg text-lg">
              Get Free Consultation
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default EnrollPage;