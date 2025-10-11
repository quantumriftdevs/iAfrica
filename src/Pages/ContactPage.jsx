import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, GraduationCap, Users, Phone, Mail, MapPin, MessageCircle, Clock, HelpCircle, Video } from 'lucide-react';

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
  const colorClasses = {
    emerald: "from-emerald-500 to-emerald-600",
    green: "from-green-500 to-green-600",
    teal: "from-teal-500 to-teal-600"
  };
  const [contactRef, contactVisible] = useScrollAnimation();
  const [formRef, formVisible] = useScrollAnimation();
  const [mapRef, mapVisible] = useScrollAnimation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentLevel: '',
    subject: '',
    message: '',
    interest: 'general'
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
        currentLevel: '',
        subject: '',
        message: '',
        interest: 'general'
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
      details: ["Abuja, Nigeria", "Federal Capital Territory"],
      color: "emerald"
    },
    {
      icon: Phone,
      title: "Phone Number",
      details: ["+234 XXX XXX XXXX", "Available Mon-Sat 9AM-6PM"],
      color: "green"
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["education@iafrica.com", "We respond within 24 hours"],
      color: "teal"
    }
  ];
  
  const supportHours = [
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
              Have questions about our programs, enrollment process, or technical support? 
              Our dedicated Resources is here to guide you on your learning journey and help you choose the right path.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={index}
                    className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 
                               transform hover:-translate-y-2 group
                               ${contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[info.color]} 
                                    rounded-full flex items-center justify-center mx-auto mb-4 
                                    group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className={`${idx === 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'} text-sm`}>
                        {detail}
                      </p>
                    ))}
                  </div>
                );
              })}
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Level</label>
                    <input
                      type="text"
                      name="currentLevel"
                      value={formData.currentLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                               focus:border-emerald-500 transition-all duration-200"
                      placeholder="Beginner, Intermediate, etc."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Area of Interest</label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 
                             focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="web-dev">Web Development Program</option>
                    <option value="digital-marketing">Digital Marketing Program</option>
                    <option value="graphic-design">Graphic Design Program</option>
                    <option value="data-analytics">Data Analytics Program</option>
                    <option value="enrollment">Enrollment Process</option>
                    <option value="technical">Technical Support</option>
                    <option value="certificates">Certificate Verification</option>
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
                    placeholder="Tell us more about your inquiry..."
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
            
            {/* Support Info & Hours */}
            <div ref={mapRef} className={`transition-all duration-1000 ${
              mapVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Student Support</h2>
              
              {/* Support Photo */}
              <div className="mb-8">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Student support Resources"
                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                />
              </div>
              
              {/* Support Hours */}
              <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Support Hours</h3>
                <div className="space-y-3">
                  {supportHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="font-medium text-gray-700">{schedule.day}</span>
                      <span className="text-emerald-600 font-semibold">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="bg-emerald-50 p-6 rounded-2xl mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <HelpCircle className="mr-2 text-emerald-600" size={24} />
                  Quick Help
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Video className="mr-3 mt-1 text-emerald-600 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-semibold text-gray-900">Having trouble joining classes?</p>
                      <p className="text-sm text-gray-600">Check our technical support guide</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <BookOpen className="mr-3 mt-1 text-emerald-600 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-semibold text-gray-900">Need help with enrollment?</p>
                      <p className="text-sm text-gray-600">View our step-by-step guide</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MessageCircle className="mr-3 mt-1 text-emerald-600 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-semibold text-gray-900">Want to speak with an advisor?</p>
                      <p className="text-sm text-gray-600">Schedule a consultation call</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Ready to Enroll */}
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-6 rounded-2xl text-white">
                <h3 className="text-xl font-bold mb-4">Ready to Start Learning?</h3>
                <p className="mb-4">
                  Our dedicated support Resources is here to guide you through every step of your educational journey. 
                  From choosing the right program to technical assistance during live classes, we've got you covered.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <GraduationCap className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold">Expert Support Resources</p>
                    <p className="text-emerald-100 text-sm">Available to assist you</p>
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