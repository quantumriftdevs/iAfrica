import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Truck, Sprout, Users, Phone, Mail, MapPin, Star, ShoppingCart, Eye, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

// Animation hooks
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return [ref, isVisible];
};


// Contact Page Component
const ContactPage = () => {
  const [contactRef, contactVisible] = useScrollAnimation();
  const [formRef, formVisible] = useScrollAnimation();
  const [mapRef, mapVisible] = useScrollAnimation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    service: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        service: 'general'
      });
      
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 2000);
  };
  
  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Location",
      details: ["4 BDT 25, Canaan Estate", "Life Camp, Abuja, Nigeria"],
      color: "emerald"
    },
    {
      icon: Phone,
      title: "Phone Number",
      details: ["+234 803 493 1164", "Available Mon-Sat 9AM-6PM"],
      color: "green"
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["info@cossywhite.com", "We respond within 24 hours"],
      color: "teal"
    }
  ];
  
  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ];
  
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container mx-auto px-4">
          <div ref={contactRef} className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
            contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Ready to discuss your security, agricultural, or automotive needs? 
              Our team is here to provide personalized solutions that meet your requirements.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
                             transform hover:-translate-y-2 group
                             ${contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br from-${info.color}-500 to-${info.color}-600 
                                  rounded-full flex items-center justify-center mx-auto mb-4 
                                  group-hover:scale-110 transition-transform duration-300`}>
                    <info.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className={`${idx === 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'} text-sm`}>
                      {detail}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div ref={formRef} className={`transition-all duration-1000 ${
              formVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                               focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                               focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                               focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                               focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Interest</label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                             focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="security">Security Technologies</option>
                    <option value="agribusiness">Agribusiness Export</option>
                    <option value="automotive">Automotive Import</option>
                    <option value="investment">Investment Opportunities</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                             focus:border-emerald-500 transition-all duration-200"
                    placeholder="What is this regarding?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                             focus:border-emerald-500 transition-all duration-200 resize-none"
                    placeholder="Tell us more about your requirements..."
                  ></textarea>
                </div>
                
                {submitStatus === 'success' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Message sent successfully!</p>
                    <p className="text-sm">We'll get back to you within 24 hours.</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-8 rounded-lg 
                           font-semibold hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 
                           transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 
                           disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending Message...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
            
            {/* Contact Info & Hours */}
            <div ref={mapRef} className={`transition-all duration-1000 ${
              mapVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Visit Our Office</h2>
              
              {/* Office Photo */}
              <div className="mb-8">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Modern office space"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                />
              </div>
              
              {/* Business Hours */}
              <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-3">
                  {officeHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="font-medium text-gray-700">{schedule.day}</span>
                      <span className="text-emerald-600 font-semibold">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Team Photo */}
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-6 rounded-2xl text-white">
                <h3 className="text-xl font-bold mb-4">Ready to Connect?</h3>
                <p className="mb-4">
                  Our experienced team is ready to help you find the perfect solution for your needs. 
                  Whether you're looking for security systems, agricultural exports, or luxury vehicles, 
                  we're here to make it happen.
                </p>
                <div className="flex items-center space-x-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                    alt="Team representative"
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                  <div>
                    <p className="font-semibold">Professional Team</p>
                    <p className="text-emerald-100 text-sm">Ready to assist you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;