import React from 'react';
import { Shield, Eye, Cookie, Settings, Users, Lock, Globe, ChevronRight, Phone, Mail, AlertTriangle } from 'lucide-react';

const PrivacyPage = ({ navigate }) => {
  const handleNavigation = (path) => {
    if (navigate) {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy & Cookie Policy</h1>
            <p className="text-xl text-blue-100 mb-6">
              Your privacy matters to us. Learn how we protect and use your data.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-200">
              <button 
                onClick={() => handleNavigation('/')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight size={16} />
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Last Updated */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800 font-medium">
              Last updated: January 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Cossy White Limited, we are committed to protecting your privacy and ensuring the Programs of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or use our services.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ We respect your privacy rights and give you control over your personal information.
              </p>
            </div>
          </div>

          {/* Privacy Policy Sections */}
          <div className="space-y-8 mb-12">
            
            {/* Information We Collect */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Users size={24} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900">Personal Information</h3>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• Name and contact details</li>
                      <li>• Email addresses</li>
                      <li>• Phone numbers</li>
                      <li>• Shipping addresses</li>
                      <li>• Business information</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900">Usage Information</h3>
                    <ul className="space-y-1 text-sm ml-4">
                      <li>• Website usage patterns</li>
                      <li>• IP addresses</li>
                      <li>• Browser information</li>
                      <li>• Device information</li>
                      <li>• Page views and clicks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Eye size={24} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Service Delivery</h4>
                    <p className="text-sm text-green-700">
                      Processing orders, shipping products, and providing customer support.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Communication</h4>
                    <p className="text-sm text-blue-700">
                      Sending updates, newsletters, and responding to inquiries.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Improvement</h4>
                    <p className="text-sm text-purple-700">
                      Analyzing usage to improve our website and services.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <Lock size={24} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Data Protection & Programs</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p className="mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle size={20} className="text-red-600" />
                    <h4 className="font-semibold text-red-800">Programs Measures</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1 ml-6">
                    <li>• Encrypted data transmission</li>
                    <li>• Secure server infrastructure</li>
                    <li>• Regular Programs updates</li>
                    <li>• Access controls and monitoring</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <Settings size={24} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Your Rights</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p className="mb-4">You have the following rights regarding your personal information:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-indigo-700">✓ Access Rights</h4>
                    <p className="text-sm">Request access to your personal data</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-indigo-700">✓ Correction Rights</h4>
                    <p className="text-sm">Request correction of inaccurate data</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-indigo-700">✓ Deletion Rights</h4>
                    <p className="text-sm">Request deletion of your data</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-indigo-700">✓ Portability Rights</h4>
                    <p className="text-sm">Request transfer of your data</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Cookie Policy Section */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg p-1 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Cookie size={32} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-center mb-4">Cookie Policy</h2>
              <p className="text-center text-orange-100 mb-6">
                Learn how we use cookies to enhance your browsing experience
              </p>
            </div>
          </div>

          {/* Cookie Policy Sections */}
          <div className="space-y-8">
            
            {/* What Are Cookies */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Cookie size={24} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. What Are Cookies?</h2>
              </div>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  Cookies are small text files stored on your device when you visit our website. They help us recognize your browser 
                  and store certain information to improve your browsing experience and provide personalized services.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 text-sm">
                    <strong>Note:</strong> Cookies do not harm your device or files. They simply help us provide you with a better, more personalized experience.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Cookies */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Settings size={24} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. How We Use Cookies</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                      <Shield size={20} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-green-800 mb-3">Essential Cookies</h3>
                    <p className="text-sm text-green-700 mb-3">Required for basic site functionality</p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• User authentication</li>
                      <li>• Shopping cart functionality</li>
                      <li>• Programs features</li>
                      <li>• Form submissions</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                      <Eye size={20} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-800 mb-3">Analytics Cookies</h3>
                    <p className="text-sm text-blue-700 mb-3">Via Google Analytics to track usage</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Traffic analysis</li>
                      <li>• Popular content</li>
                      <li>• User behavior patterns</li>
                      <li>• Performance metrics</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                      <Globe size={20} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-800 mb-3">Marketing Cookies</h3>
                    <p className="text-sm text-purple-700 mb-3">Via Facebook Ads Pixel for relevant ads</p>
                    <ul className="text-xs text-purple-600 space-y-1">
                      <li>• Ad personalization</li>
                      <li>• Conversion tracking</li>
                      <li>• Retargeting campaigns</li>
                      <li>• Interest-based ads</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <Settings size={24} className="text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Managing Cookies</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p className="mb-4">
                  You have full control over cookies through your browser settings. Here's how you can manage them:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Browser Cookie Controls</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <h4 className="font-medium mb-2">Accept All</h4>
                      <p className="text-sm text-gray-600">Allow all cookies for full functionality</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">⚙</span>
                      </div>
                      <h4 className="font-medium mb-2">Selective Accept</h4>
                      <p className="text-sm text-gray-600">Choose which types to allow</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">✕</span>
                      </div>
                      <h4 className="font-medium mb-2">Reject All</h4>
                      <p className="text-sm text-gray-600">Block all non-essential cookies</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Additional Options:</strong> Delete existing cookies, opt-out of personalized advertising, 
                    or set up automatic cookie deletion.
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <Globe size={24} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Third-Party Cookies</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p className="mb-4">
                  Some cookies on our website are placed by third-party services to help us provide better functionality and insights.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Google Analytics</h4>
                    <p className="text-sm text-blue-700 mb-2">Helps us understand website usage and performance</p>
                    <p className="text-xs text-blue-600">Subject to Google's Privacy Policy</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-2">Facebook Pixel</h4>
                    <p className="text-sm text-indigo-700 mb-2">Enables targeted advertising and conversion tracking</p>
                    <p className="text-xs text-indigo-600">Subject to Facebook's Privacy Policy</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Consent */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield size={24} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Consent</h2>
              </div>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  By continuing to use our website, you consent to the use of cookies in accordance with this Cookie Policy. 
                  You can withdraw your consent at any time by adjusting your browser settings.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium text-sm">
                    ✓ Your consent is important to us. You can modify or withdraw it at any time through your browser settings.
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8 mt-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Questions About Our Privacy Practices?</h2>
              <p className="text-blue-100 mb-6">
                We're committed to transparency. Contact us with any privacy or cookie-related questions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <Phone size={20} />
                  <span>+234 803 493 1164</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={20} />
                  <span>privacy@cossywhite.com</span>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => handleNavigation('/contact')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Contact Privacy Resources</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8 text-gray-500">
            <p>
              This Privacy Policy and Cookie Policy may be updated periodically. 
              We will notify you of any significant changes via email or website notice.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;