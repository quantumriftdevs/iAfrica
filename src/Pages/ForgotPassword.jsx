import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useToast } from '../components/ui/ToastContext';
import { forgotPassword, formatApiError } from '../utils/api';

const ForgotPassword = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.push('Please provide your email', { type: 'error' });
    setSubmitting(true);
    try {
      await forgotPassword({ email });
      toast.push('If the email exists, a password reset token was sent. Check your inbox.', { type: 'success' });
      // navigate to reset page where user can paste token or use emailed link
      navigate('/reset-password');
    } catch (err) {
      console.error('Forgot password error', err);
      toast.push(formatApiError(err) || 'Failed to request password reset', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-4xl max-h-5xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[480px]">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 flex flex-col justify-center items-center text-white">
              <div className="max-w-md text-center">
                <img src="/logo.png" alt="iAfrica logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
                <h2 className="text-4xl font-bold mb-4">Reset your password</h2>
                <p className="text-xl text-emerald-100 leading-relaxed">Enter your email and we'll send a secure token to reset your password.</p>
              </div>
            </div>

            <div className="p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h3>
                  <p className="text-gray-600">Enter your account email and we'll send instructions to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center">
                      {submitting ? 'Sending...' : 'Send reset token'}
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <button onClick={() => navigate('/login')} className="text-emerald-600 hover:text-emerald-700 font-semibold">Back to sign in</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
