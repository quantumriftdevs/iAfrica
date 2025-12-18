import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { getMe, updateDetails } from '../../utils/api';

const ProfileEdit = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMe();
        if (!mounted) return;
        setProfile({ name: res.name || '', email: res.email || '', phone: res.phone || res.phoneNumber || '' });
      } catch (err) {
        console.error('Failed to load profile for edit', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const payload = { name: profile.name, email: profile.email, phone: profile.phone };
      await updateDetails(payload);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Edit Profile</h2>
          <p className="text-gray-600">Update your personal information</p>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden max-w-2xl">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
              <p className="text-gray-600 text-sm mt-1">Manage your account details</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <div className={`p-3 rounded ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <a href="/profile" className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700">Cancel</a>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
