import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { updatePassword } from '../../utils/api';

const ChangePassword = () => {
  const [submitting, setSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: 'Please provide both current and new passwords' });
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Change Password</h2>
          <p className="text-gray-600">Update your account password</p>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden max-w-2xl">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Lock size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
              <p className="text-gray-600 text-sm mt-1">Change your password to keep your account secure</p>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              {message && (
                <div className={`p-3 rounded ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <a href="/profile" className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700">Cancel</a>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
