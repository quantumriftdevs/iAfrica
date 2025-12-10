import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyOtp, resendOtp, formatApiError } from '../utils/api';
import { useToast } from '../components/ui/ToastContext';
import { useNavigate } from 'react-router-dom';

const OTPVerification = () => {
  const location = useLocation();
  const state = location.state || {};
  const redirectTo = state.redirectTo || null;
  const auth = useAuth();
  const toast = useToast();
  const _navigate = useNavigate();

  const [code, setCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [resending, setResending] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    // Attempt to get email from auth.user, otherwise fetch current user
    (async () => {
      try {
        // prefer email passed via location state (from login page)
        const passedEmail = state && state.email;
        if (passedEmail) {
          setUserEmail(passedEmail);
        } else {
          const u = auth.user || await auth.getCurrentUser();
          if (u && u.email) setUserEmail(u.email);
        }
      } catch {
        // ignore
      }
    })();
    // Start a resend cooldown on mount (assume an OTP was sent on login)
    setCooldown(60);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!code) {
      toast.push('Enter the verification code sent to your email', { type: 'error' });
      return;
    }

    try {
      setProcessing(true);
      // Backend expects { email, OTP }
      const payload = userEmail ? { email: userEmail, otp: code } : { otp: code };
      console.log({ payload });
      const res = await verifyOtp(payload);
      toast.push('Verification successful', { type: 'success' });

      // If the verify endpoint returned a token, persist it and load user
      const token = res?.token || (res && res.data && res.data.token);
      try {
        await auth.completeVerification(token);
      } catch (err) {
        // If completing verification failed, show a message but continue to redirect if possible
        const m = formatApiError(err) || 'Could not complete verification';
        toast.push(m, { type: 'error' });
      }

      // decide final redirect
      let u = auth.user;
      try { u = auth.user || await auth.getCurrentUser(); } catch { /* ignore */ }

      if (redirectTo) {
        _navigate(redirectTo);
        return;
      }

      const role = u?.role;
      if (role === 'admin') _navigate('/admin/dashboard');
      else if (role === 'lecturer') _navigate('/lecturer/dashboard');
      else _navigate('/dashboard');
    } catch (err) {
      const msg = formatApiError(err) || 'Verification failed. Please try again.';
      toast.push(msg, { type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setResending(true);
      const payload = userEmail ? { email: userEmail } : { email: '' };
      await resendOtp(payload);
      toast.push('Verification code resent to your email', { type: 'success' });
      // restart cooldown
      setCooldown(60);
    } catch (err) {
      const msg = formatApiError(err) || 'Could not resend code';
      toast.push(msg, { type: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Enter verification code</h2>
          <p className="text-sm text-gray-600 mb-6">We sent a one-time code to <strong>{userEmail || 'your email'}</strong>. Enter it below to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Verification code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:border-emerald-500"
                placeholder="e.g. 123456"
                inputMode="numeric"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
              >
                {processing ? 'Verifying...' : 'Verify'}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {resending ? 'Resending...' : (cooldown > 0 ? `Resend in ${Math.floor(cooldown/60)}:${String(cooldown%60).padStart(2,'0')}` : 'Resend code')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            <p>If you did not receive the code, check your spam folder or click "Resend code".</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
