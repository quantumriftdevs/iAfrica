import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, BookOpen, GraduationCap, Users, Award } from 'lucide-react';

const LoginPage = ({ navigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userType, setUserType] = useState('student'); // student, admin, lecturer
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setUserType('student'); // Reset to student when toggling
      setFormData({
        email: '',
        password: '',
        fullName: '',
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

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    // Simulate login
    alert(`Logging in as ${userType}...\nEmail: ${formData.email}`);
    
    // Here you would make API call to authenticate
    // On success, navigate to appropriate dashboard
    if (userType === 'student') {
      // Navigate to student dashboard
      console.log('Navigate to student dashboard');
    } else if (userType === 'admin') {
      // Navigate to admin dashboard
      console.log('Navigate to admin dashboard');
    } else if (userType === 'lecturer') {
      // Navigate to lecturer dashboard
      console.log('Navigate to lecturer dashboard');
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Redirect to enrollment page for students to choose and pay for program
    alert('Redirecting to enrollment page...\nAfter successful payment, your account will be created!');
    
    // Navigate to enroll page
    if (navigate) {
      navigate('/Enroll');
    }
  };

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
                  <GraduationCap size={80} className="mx-auto mb-6 text-emerald-200" />
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

                    {/* User Type Selection for Login */}
                    <div className="flex gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => setUserType('student')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          userType === 'student'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('lecturer')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          userType === 'lecturer'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Lecturer
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('admin')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          userType === 'admin'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Admin
                      </button>
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
                        <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                          Forgot password?
                        </a>
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

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          <strong>Note:</strong> After clicking Continue, you'll be directed to choose and enroll in a program. Your account will be created after successful payment.
                        </p>
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