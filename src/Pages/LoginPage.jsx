import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useToast } from '../components/ui/ToastContext';
import { formatApiError } from '../utils/api';
import { Mail, Lock, User, ArrowRight, BookOpen, Users, Award, Phone } from 'lucide-react';

const LoginPage = ({ navigate }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || null;
  const mode = params.get('mode') || null;
  const [isLogin, setIsLogin] = useState(mode === 'signup' ? false : true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    confirmPassword: ''
  });

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        confirmPassword: ''
      });
    }, 400);
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toast = useToast();

  const auth = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.push('Please fill in all fields', { type: 'error' });
      return;
    }
    // Perform real login via AuthContext
    (async () => {
      try {
        setIsAnimating(true);
        const res = await auth.login(formData.email, formData.password);

        // if redirect param present, go there first
        if (redirectTo) {
          navigate(redirectTo);
          return;
        }

        // otherwise, redirect based on user role
        const role = res.user?.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'lecturer') navigate('/lecturer/dashboard');
        else navigate('/dashboard');
      } catch (err) {
        const msg = formatApiError(err) || 'Login failed. Check your credentials.';
        toast.push(msg, { type: 'error' });
      } finally {
        setIsAnimating(false);
      }
    })();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      toast.push('Please fill in all fields', { type: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.push('Passwords do not match', { type: 'error' });
      return;
    }

    try {
      setIsAnimating(true);
      // call registerStudent from AuthContext
      await auth.registerStudent({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      // after successful registration, redirect to provided redirect or Courses page
      if (redirectTo) navigate(redirectTo);
      else navigate('/Courses');
    } catch (err) {
      console.error('Signup error', err);
      const msg = formatApiError(err) || 'Signup failed. Please try again.';
      toast.push(msg, { type: 'error' });
    } finally {
      setIsAnimating(false);
    }
  };

  // auth defined earlier

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-4xl max-h-5xl">
        {/* Split Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">

            {/* Left Side - Illustration (switches with form during animation) */}
            <div 
              className={`bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 flex flex-col justify-center items-center text-white transition-all duration-700 transform ${
                isAnimating 
                  ? isLogin 
                    ? 'translate-x-full opacity-0' 
                    : '-translate-x-full opacity-0'
                  : 'translate-x-0 opacity-100'
              } ${!isLogin ? 'lg:order-2' : ''}`}
            >
              <div className="max-w-md text-center">
                <div className="mb-8">
                  <img src="/logo.png" alt="iAfrica logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
                  <h2 className="text-4xl font-bold mb-4">iAfrica Education</h2>
                  <p className="text-xl text-emerald-100 leading-relaxed">
                    Transform your future with expert-led programs, live interactive classes, and industry-recognized certificates.
                  </p>
                </div>

                <div className="space-y-6 mt-12">
                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-emerald-700 p-4 rounded-full">
                      <BookOpen size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">Live Classes</h3>
                      <p className="text-emerald-200 text-sm">Interactive learning sessions</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-emerald-700 p-4 rounded-full">
                      <Users size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">Expert Lecturers</h3>
                      <p className="text-emerald-200 text-sm">Learn from industry professionals</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-emerald-700 p-4 rounded-full">
                      <Award size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">Certificates</h3>
                      <p className="text-emerald-200 text-sm">Verified digital certificates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form (switches with illustration during animation) */}
            <div 
              className={`p-12 flex flex-col justify-center transition-all duration-700 transform ${
                isAnimating 
                  ? isLogin 
                    ? '-translate-x-full opacity-0' 
                    : 'translate-x-full opacity-0'
                  : 'translate-x-0 opacity-100'
              } ${!isLogin ? 'lg:order-1' : ''}`}
            >
              <div className="max-w-md mx-auto w-full">
                {/* Login Form */}
                {isLogin ? (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                      <p className="text-gray-600">Sign in to continue your learning journey</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                          <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <button onClick={() => navigate('/forgot-password')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                      >
                        Sign In
                        <ArrowRight size={20} />
                      </button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-gray-600">
                        Don't have an account?{' '}
                        <button
                          onClick={handleToggle}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          Sign Up
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Sign Up Form */
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                      <p className="text-gray-600">Start your learning journey today</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="e.g. +2348012345678"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                      >
                        Continue to Enrollment
                        <ArrowRight size={20} />
                      </button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-gray-600">
                        Already have an account?{' '}
                        <button
                          onClick={handleToggle}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            🔒 Your data is secure and encrypted. By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;