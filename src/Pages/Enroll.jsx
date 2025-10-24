import React, { useState, useEffect } from 'react';
import { initializePayment, getPrograms, formatApiError } from '../utils/api';
import { ChevronRight, BookOpen, School, Users, Clock, Calendar, Award, Video, FileText, CheckCircle, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/ToastContext';
import { useNavigate } from 'react-router-dom';

// Animation hooks
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const ref = React.useRef();
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return [ref, isVisible];
};

const EnrollPage = () => {
  const [programs, setPrograms] = useState([]);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [heroRef, heroVisible] = useScrollAnimation();
  const [programsRef, programsVisible] = useScrollAnimation();
  const [gradeRef, gradeVisible] = useScrollAnimation();

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
            students: p.students || '0',
            rating: p.rating || '0',
            grades: Array.isArray(p.grades) ? p.grades : (p.levels || []),
            features: p.features || []
          }));
          setPrograms(mapped);
        }
      } catch (e) {
        console.error('Programs fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

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

  const handleEnroll = async (grade) => {
    setProcessingPayment(true);
    try {
      // Build payload expected by backend initialize endpoint
      const payload = {
        programId: selectedProgram._id,
        gradeId: grade._id,
        amount: grade.price,
        currency: 'NGN',
        returnUrl: window.location.href,
        metadata: {
          programName: selectedProgram.name,
          gradeLevel: grade.level,
          student: user ? { id: user._id || user._id, email: user.email, name: user.name || user.fullName || user.firstName } : undefined
        }
      };

      const res = await initializePayment(payload);

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
            <div ref={heroRef} className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
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
            <div ref={programsRef} className="space-y-20">
              {programs.map((program, index) => (
                <div
                  key={program._id}
                  className={`transition-all duration-1000 ${
                    programsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
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
                        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg">
                          <div className="flex items-center">
                            <Users size={16} className="text-emerald-600 mr-2" />
                            <span className="font-semibold text-gray-900">{program.students} Students</span>
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span className="font-semibold text-gray-900">{program.rating}/5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                      <h2 className="text-4xl font-bold text-gray-900 mb-4">{program.name}</h2>
                      <p className="text-xl text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                      
                      <div className="space-y-3 mb-6">
                        {program.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center">
                            <CheckCircle size={20} className="text-emerald-600 mr-3" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setSelectedProgram(program)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center shadow-lg"
                      >
                        View Grade Levels
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
            <div ref={gradeRef} className={`transition-all duration-1000 ${
              gradeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{selectedProgram.name}</h2>
                <p className="text-xl text-gray-600 leading-relaxed">{selectedProgram.description}</p>
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Level</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {selectedProgram.grades.map((grade, gradeIndex) => (
                  <div
                    key={grade._id}
                    className="bg-gradient-to-br from-gray-50 to-emerald-50 p-8 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl"
                    style={{ transitionDelay: `${gradeIndex * 150}ms` }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-3xl font-bold text-gray-900">{grade.level} Level</h4>
                      <span className="bg-emerald-600 text-white px-5 py-3 rounded-full font-bold text-xl">
                        ₦{grade.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 mb-6 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={20} className="text-emerald-600" />
                        <span className="font-semibold text-gray-800">Season: {grade.seasonInfo.name}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 pl-7">
                        <p>Starts: {grade.seasonInfo.startDate}</p>
                        <p>Ends: {grade.seasonInfo.endDate}</p>
                        <p>Duration: {grade.duration}</p>
                        <p className="font-semibold text-orange-600">{grade.seasonInfo.spotsLeft} spots remaining</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen size={20} className="text-emerald-600" />
                        <p className="font-semibold text-gray-900 text-lg">Courses Included:</p>
                      </div>
                      <div className="space-y-3">
                        {grade.courses.map((course, courseIndex) => (
                          <div key={courseIndex} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="font-medium text-gray-800 mb-1">{course.name}</div>
                            <div className="text-gray-500 text-sm flex items-center">
                              <Users size={14} className="mr-1" />
                              Lecturer: {course.lecturer}
                            </div>
                          </div>
                        ))}
                      </div>
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
                      <span className="text-gray-600 font-medium">Level:</span>
                      <span className="font-bold text-gray-900 text-lg">{selectedGrade.level}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Duration:</span>
                      <span className="font-semibold text-gray-800">{selectedGrade.duration}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Season:</span>
                      <span className="font-semibold text-gray-800">{selectedGrade.seasonInfo.name}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Courses:</span>
                      <span className="font-semibold text-gray-800">{selectedGrade.courses.length} courses included</span>
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
                  <button
                    onClick={() => handleEnroll(selectedGrade)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-5 rounded-xl font-bold text-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle size={24} /> Pay ₦{selectedGrade.price.toLocaleString()} & Enroll
                  </button>
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