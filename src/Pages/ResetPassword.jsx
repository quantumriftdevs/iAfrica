import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useToast } from '../components/ui/ToastContext';
import { resetPassword, formatApiError } from '../utils/api';

const ResetPassword = ({ navigate }) => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !password || !confirm) return toast.push('Please fill all fields', { type: 'error' });
    if (password !== confirm) return toast.push('Passwords do not match', { type: 'error' });
    setSubmitting(true);
    try {
      await resetPassword(token, { password });
      toast.push('Password reset successful. You can now sign in.', { type: 'success' });
      navigate('/login');
    } catch (err) {
      console.error('Reset password error', err);
      toast.push(formatApiError(err) || 'Failed to reset password', { type: 'error' });
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
                <h2 className="text-4xl font-bold mb-4">Choose a new password</h2>
                <p className="text-xl text-emerald-100 leading-relaxed">Enter the token we sent to your email and set a secure new password.</p>
              </div>
            </div>

            <div className="p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reset Token</label>
                    <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token from email" className="w-full p-3 border rounded" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg" placeholder="••••••••" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg" placeholder="••••••••" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200">
                      {submitting ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
