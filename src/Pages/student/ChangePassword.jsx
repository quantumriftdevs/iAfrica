import React from 'react';
import { Lock } from 'lucide-react';

const ChangePassword = () => {
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
            <div className="text-center text-gray-500">
              <p>Password change form will be implemented here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
