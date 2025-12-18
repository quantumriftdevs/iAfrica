import React, { useEffect, useState } from 'react';
import { getMe } from '../../utils/api';
import { Mail, User, Phone, Shield } from 'lucide-react';

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMe();
        if (!mounted) return;
        setProfile(res || null);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h2>
            <p className="text-gray-600">Your account information</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : !profile ? (
            <div className="py-12 text-center text-gray-600">Unable to load profile.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 rounded-md">
                    <User className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.name || profile.fullName || profile.username || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <Mail className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <Shield className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.role || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-50 rounded-md">
                    <Phone className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.phone || profile.phoneNumber || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center items-start gap-3">
                <a href="/profile/edit" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 hover:shadow-md hover:bg-white transition">Edit Profile</a>
                <a href="/profile/change-password" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 hover:shadow-md hover:bg-white transition">Change Password</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
