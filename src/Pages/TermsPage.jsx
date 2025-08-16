import React from 'react';
import { Shield, Globe, CreditCard, Truck, RotateCcw, FileText, Scale, ChevronRight, Phone, Mail } from 'lucide-react';

const TermsPage = ({ navigate }) => {
  const handleNavigation = (path) => {
    if (navigate) {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FileText size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl text-emerald-100 mb-6">
              Please read these terms carefully before using our services
            </p>
            <div className="flex items-center justify-center space-x-2 text-emerald-200">
              <button 
                onClick={() => handleNavigation('/')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight size={16} />
              <span>Terms & Conditions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Last Updated */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8">
            <p className="text-emerald-800 font-medium">
              Last updated: January 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Cossy White</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using our website (cossywhite.com), you agree to comply with and be bound by these Terms & Conditions. 
              If you do not agree with any part of these terms, please do not use our site.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 font-medium">
                ⚠️ Important: These terms constitute a legally binding agreement between you and Cossy White Limited.
              </p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="space-y-8">
            
            {/* Business Overview */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield size={24} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Business Overview</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>
                  Cossy White Limited operates as a multi-division company specializing in:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Security equipment</strong> and technologies for residential and commercial use</li>
                  <li><strong>Agro commodities</strong> including premium agricultural products for export</li>
                  <li><strong>Automotive imports</strong> featuring quality vehicles from trusted manufacturers</li>
                </ul>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p>
                    <strong>Shipping Policy:</strong> All products are shipped globally by sea unless otherwise agreed upon in writing. 
                    Alternative shipping methods may be available at additional cost.
                  </p>
                </div>
              </div>
            </section>

            {/* Website Use */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Globe size={24} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Use of Website</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900">Age Requirement</h3>
                    <p>You must be at least <strong>18 years old</strong> to use our services and make purchases.</p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900">Prohibited Uses</h3>
                    <p>You agree not to misuse this website for fraudulent, harmful, or unlawful purposes.</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    <strong>Intellectual Property:</strong> All content, images, and materials are the exclusive property of 
                    Cossy White Limited and may not be copied, reproduced, or distributed without explicit written permission.
                  </p>
                </div>
              </div>
            </section>

            {/* Orders & Payments */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <CreditCard size={24} className="text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Orders & Payments</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Order Placement</h4>
                    <p className="text-sm">Orders must be placed through our official channels and authorized representatives.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Pricing</h4>
                    <p className="text-sm">Prices are listed in USD and subject to change without prior notice due to market fluctuations.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Payment Security</h4>
                    <p className="text-sm">Payments are processed through secure external providers. We do not store customer payment details.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping & Delivery */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Truck size={24} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Shipping & Delivery</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">Global Shipping by Sea</h3>
                  <ul className="space-y-2">
                    <li>• Standard shipping method for all international orders</li>
                    <li>• Delivery timelines vary by product category and destination</li>
                    <li>• Typical delivery: 2-8 weeks depending on location</li>
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    <strong>Customer Responsibility:</strong> You are responsible for providing accurate delivery details, 
                    including complete address, contact information, and any special delivery instructions.
                  </p>
                </div>
              </div>
            </section>

            {/* Returns & Refunds */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <RotateCcw size={24} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Returns & Refunds</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <h3 className="font-semibold text-lg">Return Conditions</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-700">✓ Acceptable Returns</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Items returned within 14 days of receipt</li>
                      <li>• Items unused and undamaged</li>
                      <li>• Original packaging intact</li>
                      <li>• Defective or damaged goods</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-700">✗ Non-Returnable Items</h4>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Perishable agro commodities (unless defective)</li>
                      <li>• Customized security equipment</li>
                      <li>• Items damaged by customer misuse</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Refund Process:</strong> Refunds will be processed within 7-14 business days once returned goods 
                    are inspected. Original shipping costs are non-refundable unless goods are defective.
                  </p>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield size={24} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">6. Intellectual Property</h2>
              </div>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  All website content including but not limited to text, graphics, logos, images, audio clips, 
                  digital downloads, data compilations, and software is the exclusive property of Cossy White Limited 
                  or its content suppliers.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">
                    Unauthorized use, reproduction, or distribution of our intellectual property is strictly prohibited 
                    and may result in legal action.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <Scale size={24} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
              </div>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>Cossy White Limited is not responsible for:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">Shipping Delays</h4>
                    <p className="text-sm text-red-700">
                      Delays caused by customs, port authorities, weather conditions, or third-party shipping agents.
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">Product Misuse</h4>
                    <p className="text-sm text-red-700">
                      Loss or damage due to improper use, installation, or maintenance of products after delivery.
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">Consequential Damages</h4>
                    <p className="text-sm text-red-700">
                      Indirect, incidental, punitive, or consequential damages arising from product use.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Governing Law */}
            <section className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText size={24} className="text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">8. Governing Law</h2>
              </div>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  These Terms & Conditions are governed by and construed in accordance with the laws of the 
                  Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the 
                  exclusive jurisdiction of Nigerian courts.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 font-medium">
                    For any legal matters or disputes, please contact our legal department at{' '}
                    <span className="text-emerald-600">legal@cossywhite.com</span>
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg p-8 mt-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
              <p className="text-emerald-100 mb-6">
                Our team is here to help clarify any aspect of our Terms & Conditions
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-2">
                  <Phone size={20} />
                  <span>+234 803 493 1164</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={20} />
                  <span>info@cossywhite.com</span>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => handleNavigation('/contact')}
                  className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Contact Us</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8 text-gray-500">
            <p>
              By continuing to use our website, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms & Conditions.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsPage;